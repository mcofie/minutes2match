import { serverSupabaseClient, serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import { calculateFlashLobbyMatchScore, createFlashLobbyMatch, processFlashLobbyLifecycle } from '~/server/utils/flashLobby'
import { notifyFlashLobbyMutualMatch, notifyFlashLobbySparkSent } from '~/server/utils/discord'
import { notifyFlashLobbyMutualUnlocked, notifyFlashLobbySparkReceived } from '~/server/utils/notifications'
import { sanitizeSparkMessage, validateSparkMessage, isResolvedIntentStatus, resolveSparkOutcome, canUsersSeeEachOther } from '~/server/utils/flashLobbyRules'

export default defineEventHandler(async (event) => {
  const headers = getHeaders(event)
  const body = await readBody(event).catch(() => ({} as Record<string, any>))

  let userId: string | null = null

  try {
    const user = await serverSupabaseUser(event)
    if (user?.id) {
      userId = user.id
    }
  } catch (err) {
    console.warn('[Lobby Connect] serverSupabaseUser failed:', err)
  }

  if (!userId) {
    try {
      const client = await serverSupabaseClient(event)
      const { data: { session } } = await client.auth.getSession()
      if (session?.user?.id) {
        userId = session.user.id
      }
    } catch (err) {
      console.warn('[Lobby Connect] session lookup failed:', err)
    }
  }

  if (!userId) {
    const authHeader = headers.authorization || headers.Authorization
    const bearer = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null

    if (bearer && bearer !== 'undefined') {
      try {
        const supabaseAdmin = serverSupabaseServiceRole(event)
        const { data, error } = await supabaseAdmin.auth.getUser(bearer)
        if (!error && data.user?.id) {
          userId = data.user.id
        }
      } catch (err) {
        console.warn('[Lobby Connect] bearer verification failed:', err)
      }
    }
  }

  if (!userId && process.env.NODE_ENV !== 'production') {
    const debugUserId = body.userId
    if (debugUserId && debugUserId !== 'undefined') {
      userId = String(debugUserId)
      console.warn('[Lobby Connect] USER RECOVERED VIA INSECURE DEBUG FALLBACK:', userId)
    }
  }

  if (!userId || userId === 'undefined') {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { targetId, message } = body
  const cleanMessage = sanitizeSparkMessage(message)

  const validationError = !targetId ? 'Target ID and message are required' : validateSparkMessage(cleanMessage)
  if (validationError) {
    throw createError({ statusCode: 400, statusMessage: validationError })
  }

  const client = serverSupabaseServiceRole(event)
  const now = new Date().toISOString()
  await processFlashLobbyLifecycle()

  const { data: activeLobby } = await client
    .schema('m2m')
    .from('flash_lobbies')
    .select('id, title')
    .lte('start_at', now)
    .gte('end_at', now)
    .maybeSingle()

  if (!activeLobby) {
    throw createError({ statusCode: 400, statusMessage: 'No active flash lobby right now' })
  }

  const [{ data: me }, { data: target }] = await Promise.all([
    client.schema('m2m').from('profiles').select('id, gender, interested_in, display_name').eq('id', userId).maybeSingle(),
    client.schema('m2m').from('profiles').select('id, gender, interested_in, display_name').eq('id', targetId).maybeSingle()
  ])

  if (!target) {
    throw createError({ statusCode: 404, statusMessage: 'Target profile not found' })
  }

  const visibility = canUsersSeeEachOther({
    viewerGender: me?.gender,
    viewerInterest: me?.interested_in,
    candidateGender: target.gender,
    candidateInterest: target.interested_in
  })

  if (!visibility.viewerCanSeeCandidate) {
    throw createError({ statusCode: 403, statusMessage: 'This profile is outside your current lobby preferences' })
  }

  const { count: sentCount } = await client
    .schema('m2m')
    .from('flash_lobby_intents')
    .select('*', { count: 'exact', head: true })
    .eq('lobby_id', activeLobby.id)
    .eq('sender_id', userId)

  const { data: existingIntent } = await client
    .schema('m2m')
    .from('flash_lobby_intents')
    .select('id, status, match_id')
    .eq('lobby_id', activeLobby.id)
    .eq('sender_id', userId)
    .eq('receiver_id', targetId)
    .maybeSingle()

  const initialOutcome = resolveSparkOutcome({
    existingIntentStatus: existingIntent?.status,
    reverseIntentExists: false
  })

  if (initialOutcome === 'mutual' && existingIntent?.match_id) {
    return { success: true, mutual: true, matchId: existingIntent.match_id }
  }

  if (existingIntent && isResolvedIntentStatus(existingIntent.status)) {
    throw createError({ statusCode: 409, statusMessage: 'This spark has already been resolved for this lobby.' })
  }

  if (!existingIntent && (sentCount || 0) >= 20) {
    throw createError({ statusCode: 429, statusMessage: 'You have reached the spark limit for this lobby.' })
  }

  if (existingIntent) {
    await client
      .schema('m2m')
      .from('flash_lobby_intents')
      .update({ message: cleanMessage })
      .eq('id', existingIntent.id)
  } else {
    const { data: insertedIntent, error: insertError } = await client
      .schema('m2m')
      .from('flash_lobby_intents')
      .insert({
        lobby_id: activeLobby.id,
        sender_id: userId,
        receiver_id: targetId,
        message: cleanMessage
      })
      .select('id')
      .single()

    if (insertError) {
      throw createError({ statusCode: 500, statusMessage: insertError.message })
    }

    await notifyFlashLobbySparkReceived(client as any, {
      recipientId: targetId,
      senderName: me?.display_name || 'Someone',
      lobbyId: activeLobby.id,
      lobbyTitle: activeLobby.title || 'the Flash Lobby',
      intentId: insertedIntent.id
    })

    await notifyFlashLobbySparkSent({
      lobbyName: activeLobby.title || 'Flash Lobby',
      senderName: me?.display_name || 'Someone',
      receiverName: target.display_name || 'Someone',
      message: cleanMessage
    })
  }

  const { data: reverseIntent } = await client
    .schema('m2m')
    .from('flash_lobby_intents')
    .select('id, message, match_id')
    .eq('lobby_id', activeLobby.id)
    .eq('sender_id', targetId)
    .eq('receiver_id', userId)
    .maybeSingle()

  const outcome = resolveSparkOutcome({
    existingIntentStatus: existingIntent?.status,
    reverseIntentExists: !!reverseIntent
  })

  if (outcome !== 'mutual') {
    return { success: true, mutual: false, lobbyId: activeLobby.id }
  }

  const matchScore = await calculateFlashLobbyMatchScore({
    initiatorId: userId,
    targetId
  })

  const match = await createFlashLobbyMatch({
    initiatorId: userId,
    targetId,
    lobbyId: activeLobby.id,
    matchScore,
    status: 'unlocked',
    fullyUnlocked: true,
    unlockPrice: 15,
    reasons: [
      'Mutual Flash Lobby Spark ⚡',
      `${me?.display_name || 'Someone'}: ${cleanMessage}`,
      `${target.display_name || 'Someone'}: ${reverseIntent.message || 'Interested back'}`
    ]
  })

  const mutualAt = new Date().toISOString()
  await client
    .schema('m2m')
    .from('flash_lobby_intents')
    .update({
      status: 'mutual',
      match_id: match.id,
      mutual_at: mutualAt
    })
    .eq('lobby_id', activeLobby.id)
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${targetId}),and(sender_id.eq.${targetId},receiver_id.eq.${userId})`)

  await notifyFlashLobbyMutualUnlocked(client as any, {
    userIds: [userId, targetId],
    userNames: [me?.display_name || 'Someone', target.display_name || 'Someone'],
    matchId: match.id
  })

  await notifyFlashLobbyMutualMatch({
    lobbyName: activeLobby.title || 'Flash Lobby',
    user1Name: me?.display_name || 'Someone',
    user2Name: target.display_name || 'Someone',
    matchId: match.id
  })

  return {
    success: true,
    mutual: true,
    matchId: match.id
  }
})
