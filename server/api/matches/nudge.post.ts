import { serverSupabaseClient, serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import { sendSMS } from '~/server/utils/sms'
import { notifyMatchNudge } from '~/server/utils/discord'

export default defineEventHandler(async (event) => {
  const headers = getHeaders(event)
  const query = getQuery(event)
  const body = await readBody(event).catch(() => ({} as Record<string, any>))
  
  console.log('[Nudge Debug] Request Headers:', Object.keys(headers))
  console.log('[Nudge Debug] Request Query Keys:', Object.keys(query))

  let userId: string | null = null
  
  // 1. Primary auth path: Nuxt Supabase user helper
  try {
    const user = await serverSupabaseUser(event)
    if (user?.id) {
      userId = user.id
      console.log('[Nudge Debug] User resolved via serverSupabaseUser:', userId)
    }
  } catch (err: any) {
    console.warn('[Nudge Debug] serverSupabaseUser failed:', err?.message || err)
  }

  // 2. Fallback: session lookup via server Supabase client
  if (!userId) {
    try {
      const client = await serverSupabaseClient(event)
      const { data: { session } } = await client.auth.getSession()
      if (session?.user?.id) {
        userId = session.user.id
        console.log('[Nudge Debug] User resolved via serverSupabaseClient session:', userId)
      }
    } catch (err: any) {
      console.warn('[Nudge Debug] serverSupabaseClient session lookup failed:', err?.message || err)
    }
  }

  // 3. Fallback: verify explicit bearer token if the client sent one
  if (!userId) {
    const authHeader = headers.authorization || headers.Authorization
    const bearer = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null

    if (bearer && bearer !== 'undefined') {
      try {
        const supabaseAdmin = serverSupabaseServiceRole(event)
        const { data, error } = await supabaseAdmin.auth.getUser(bearer)
        if (error) {
          console.warn('[Nudge Debug] Bearer verification failed:', error.message)
        } else if (data.user?.id) {
          userId = data.user.id
          console.log('[Nudge Debug] User resolved via bearer token:', userId)
        }
      } catch (err: any) {
        console.warn('[Nudge Debug] Bearer verification threw:', err?.message || err)
      }
    }
  }

  // 4. Development-only fallback for local debugging
  if (!userId && process.env.NODE_ENV !== 'production') {
    const debugUserId = body.userId || query.userId
    if (debugUserId && debugUserId !== 'undefined') {
      userId = String(debugUserId)
      console.warn('[Nudge Debug] USER RECOVERED VIA INSECURE DEBUG FALLBACK:', userId)
    }
  }
  
  if (!userId || userId === 'undefined') {
    console.error('[Nudge Debug] ALL AUTH RECOVERY STRATEGIES FAILED')
    throw createError({ 
       statusCode: 401, 
       message: 'Unauthorized: No valid user session found. Please try logging out and back in.' 
    })
  }

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
