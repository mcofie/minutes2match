import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import { sendSMS } from '~/server/utils/sms'
import { notifyMatchNudge } from '~/server/utils/discord'

export default defineEventHandler(async (event) => {
  // 1. Verify Authentication
  let user = await serverSupabaseUser(event)
  
  // Fallback: Manually check Authorization header if cookie-based check failed
  if (!user) {
    const authHeader = getHeader(event, 'Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const supabaseAdmin = serverSupabaseServiceRole(event)
      const { data } = await supabaseAdmin.auth.getUser(token)
      user = data?.user
      if (user) console.log('[Nudge Debug] User recovered via Auth Header')
    }
  }
  
  if (!user || !user.id || user.id === 'undefined') {
    throw createError({ 
       statusCode: 401, 
       message: 'Unauthorized: No valid user session found. Please try logging out and back in.' 
    })
  }

  const userId = user.id
  console.log(`[Nudge Debug] Authenticated User ID: ${userId}`)

  const body = await readBody(event)
  const { matchId, customMessage } = body

  if (!matchId) {
    throw createError({ statusCode: 400, message: 'Match ID required' })
  }

  const supabase = await serverSupabaseServiceRole(event)

  // 1. Fetch match details to get the users
  const { data: match, error: matchError } = await supabase
    .schema('m2m')
    .from('matches')
    .select(`
      *,
      user_1:profiles!matches_user_1_id_fkey(display_name, phone),
      user_2:profiles!matches_user_2_id_fkey(display_name, phone)
    `)
    .eq('id', matchId)
    .single()

  if (matchError || !match) {
    throw createError({ statusCode: 404, message: 'Match not found' })
  }

  // 2. Identify who is nudging and who is being nudged
  const isUser1 = userId === String(match.user_1_id)
  const isUser2 = userId === String(match.user_2_id)

  console.log(`[Nudge Debug] User: ${userId} vs Match Participants: ${match.user_1_id} / ${match.user_2_id}`)

  if (!isUser1 && !isUser2) {
    throw createError({ 
       statusCode: 403, 
       message: `Forbidden: Participant mismatch. User: ${userId} | Match Participants: ${match.user_1_id}, ${match.user_2_id}` 
    })
  }

  const hasNudged = isUser1 ? match.user_1_contacted : match.user_2_contacted

  if (hasNudged) {
    throw createError({ statusCode: 400, message: "You've already nudged this match." })
  }

  const targetUser = isUser1 ? match.user_2 : match.user_1
  const targetName = isUser1 ? match.user_2.display_name : match.user_1.display_name
  const senderName = isUser1 ? match.user_1.display_name : match.user_2.display_name

  if (!targetUser?.phone) {
    return { success: false, message: 'Target user has no phone number' }
  }

  // 3. Send the nudge SMS
  const smsMessage = customMessage 
    ? `M2M: ${senderName} says: "${customMessage}" Unlock now: https://minutes2match.com/matches`
    : `M2M: ${senderName} just unlocked your match! They're waiting to see you. Unlock now to connect: https://minutes2match.com/matches`
  
  try {
    // 1. Always notify Discord first for audit log
    await notifyMatchNudge({
       senderName: senderName || 'Unknown User',
       targetName: targetName || 'Unknown Match',
       message: smsMessage
    })
  } catch (discordErr) {
    console.error('Discord nudge notification failed:', discordErr)
  }

  try {
    // 2. Dispatch SMS
    const smsRes = await sendSMS(targetUser.phone, smsMessage)

    // 3. Mark as nudged in DB
    await supabase.schema('m2m').from('matches').update({
       [isUser1 ? 'user_1_contacted' : 'user_2_contacted']: true
    }).eq('id', matchId)

    return { success: true, smsId: smsRes?.id }
  } catch (err: any) {
    console.error('Nudge SMS failed:', err)
    
    // Attempt to notify Discord about the failed SMS delivery
    try {
      const { notifyError } = await import('~/server/utils/discord')
      await notifyError({
        context: 'Nudge SMS Delivery',
        message: err?.message || 'Unknown SMS failure',
        userId: targetUser?.id
      })
    } catch (e) {}

    return { success: false, error: 'Failed to send SMS' }
  }
})
