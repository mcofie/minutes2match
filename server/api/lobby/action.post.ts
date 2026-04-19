import { serverSupabaseClient, serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import { calculateFlashLobbyMatchScore, createFlashLobbyMatch, processFlashLobbyLifecycle } from '~/server/utils/flashLobby'
import { createInAppNotification } from '~/server/utils/notifications'
import { canPerformPostLobbyAction } from '~/server/utils/flashLobbyRules'

export default defineEventHandler(async (event) => {
  const headers = getHeaders(event)
  const body = await readBody(event).catch(() => ({} as Record<string, any>))

  let userId: string | null = null

  try {
    const user = await serverSupabaseUser(event)
    if (user?.id) userId = user.id
  } catch (err) {
    console.warn('[Lobby Action] serverSupabaseUser failed:', err)
  }

  if (!userId) {
    try {
      const client = await serverSupabaseClient(event)
      const { data: { session } } = await client.auth.getSession()
      if (session?.user?.id) userId = session.user.id
    } catch (err) {
      console.warn('[Lobby Action] session lookup failed:', err)
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
        if (!error && data.user?.id) userId = data.user.id
      } catch (err) {
        console.warn('[Lobby Action] bearer verification failed:', err)
      }
    }
  }

  if (!userId && process.env.NODE_ENV !== 'production') {
    const debugUserId = body.userId
    if (debugUserId && debugUserId !== 'undefined') {
      userId = String(debugUserId)
      console.warn('[Lobby Action] USER RECOVERED VIA INSECURE DEBUG FALLBACK:', userId)
    }
  }

  if (!userId || userId === 'undefined') {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { intentId, action } = body
  if (!intentId || !action) {
    throw createError({ statusCode: 400, statusMessage: 'intentId and action are required' })
  }

  const client = serverSupabaseServiceRole(event)
  await processFlashLobbyLifecycle()
  const { data: intent, error } = await client
    .schema('m2m')
    .from('flash_lobby_intents')
    .select(`
      *,
      lobby:flash_lobbies!flash_lobby_intents_lobby_id_fkey(id, title, end_at)
    `)
    .eq('id', intentId)
    .single()

  if (error || !intent) {
    throw createError({ statusCode: 404, statusMessage: 'Spark not found' })
  }

  if (intent.status === 'mutual' && intent.match_id) {
    return { success: true, matchId: intent.match_id, alreadyMutual: true }
  }

  const { data: relatedProfiles } = await client
    .schema('m2m')
    .from('profiles')
    .select('id, display_name')
    .in('id', [intent.sender_id, intent.receiver_id])

  const senderProfile = (relatedProfiles || []).find((profile: any) => profile.id === intent.sender_id)
  const receiverProfile = (relatedProfiles || []).find((profile: any) => profile.id === intent.receiver_id)

  const actionGate = canPerformPostLobbyAction({
    action,
    status: intent.status,
    isSender: intent.sender_id === userId,
    isReceiver: intent.receiver_id === userId,
    lobbyEnded: !!intent.lobby?.end_at && new Date(intent.lobby.end_at).getTime() <= Date.now()
  })

  if (!actionGate.ok) {
    throw createError({
      statusCode: intent.status === 'expired' ? 410 : actionGate.error?.includes('Only the') ? 403 : 400,
      statusMessage: actionGate.error
    })
  }

  if (action === 'unlock') {
    const matchScore = await calculateFlashLobbyMatchScore({
      initiatorId: intent.sender_id,
      targetId: intent.receiver_id
    })

    // Check if the receiver has an active subscription
    const { data: subscription } = await client
      .schema('m2m')
      .from('subscriptions')
      .select('status, end_date')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('end_date', new Date().toISOString())
      .maybeSingle()

    const isSubscribed = !!subscription

    if (isSubscribed) {
      // Subscriber: Fully unlock match for free
      const match = await createFlashLobbyMatch({
        initiatorId: intent.sender_id,
        targetId: intent.receiver_id,
        lobbyId: intent.lobby_id,
        matchScore,
        unlockPrice: 0,
        status: 'unlocked',
        fullyUnlocked: true,
        reasons: [
          'Flash Lobby Spark ⚡ (Subscriber)',
          `${senderProfile?.display_name || 'Someone'}: ${intent.message}`
        ]
      })

      await client
        .schema('m2m')
        .from('flash_lobby_intents')
        .update({
          status: 'mutual',
          match_id: match.id,
          mutual_at: new Date().toISOString()
        })
        .eq('id', intent.id)

      // Notify both users that the match is fully unlocked
      const { notifyFlashLobbyMutualUnlocked } = await import('~/server/utils/notifications')
      await notifyFlashLobbyMutualUnlocked(client as any, {
        userIds: [intent.sender_id, intent.receiver_id],
        userNames: [senderProfile?.display_name || 'Someone', receiverProfile?.display_name || 'Someone'],
        matchId: match.id
      })

      // Discord notification
      const { notifyMatchUnlocked } = await import('~/server/utils/discord')
      await notifyMatchUnlocked({
        user1Name: senderProfile?.display_name || 'Someone',
        user2Name: receiverProfile?.display_name || 'Someone',
        matchId: match.id,
        fullyUnlocked: true
      })

      return { success: true, mutual: true, matchId: match.id }
    } else {
      // Non-subscriber: Create pending_payment match at GHS 15
      const match = await createFlashLobbyMatch({
        initiatorId: intent.sender_id,
        targetId: intent.receiver_id,
        lobbyId: intent.lobby_id,
        matchScore,
        unlockPrice: 15,
        status: 'pending_payment',
        reasons: [
          'Flash Lobby Spark ⚡',
          `${senderProfile?.display_name || 'Someone'}: ${intent.message}`
        ]
      })

      await client
        .schema('m2m')
        .from('flash_lobby_intents')
        .update({
          status: 'converted_to_match',
          match_id: match.id
        })
        .eq('id', intent.id)

      return { success: true, matchId: match.id, redirectTo: `/payment/match/${match.id}?unlock_both=1` }
    }
  }

  if (action === 'super_connect') {
    const matchScore = await calculateFlashLobbyMatchScore({
      initiatorId: intent.sender_id,
      targetId: intent.receiver_id
    })

    // Check if the sender has an active subscription
    const { data: subscription } = await client
      .schema('m2m')
      .from('subscriptions')
      .select('status, end_date')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('end_date', new Date().toISOString())
      .maybeSingle()

    const isSubscribed = !!subscription

    if (isSubscribed) {
      // Subscriber: Fully unlock match for free
      const match = await createFlashLobbyMatch({
        initiatorId: intent.sender_id,
        targetId: intent.receiver_id,
        lobbyId: intent.lobby_id,
        matchScore,
        unlockPrice: 0,
        status: 'unlocked',
        fullyUnlocked: true,
        reasons: [
          'Flash Lobby Super Connect ⚡ (Subscriber)',
          `${senderProfile?.display_name || 'Someone'}: ${intent.message}`
        ]
      })

      await client
        .schema('m2m')
        .from('flash_lobby_intents')
        .update({
          is_super_connect: true,
          status: 'mutual',
          match_id: match.id,
          mutual_at: new Date().toISOString()
        })
        .eq('id', intent.id)

      // Notify both users that the match is fully unlocked
      const { notifyFlashLobbyMutualUnlocked } = await import('~/server/utils/notifications')
      await notifyFlashLobbyMutualUnlocked(client as any, {
        userIds: [intent.sender_id, intent.receiver_id],
        userNames: [senderProfile?.display_name || 'Someone', receiverProfile?.display_name || 'Someone'],
        matchId: match.id
      })

      // Discord: Super Connect completed (fully unlocked via subscription)
      const { notifyFlashLobbySuperConnectCompleted } = await import('~/server/utils/discord')
      await notifyFlashLobbySuperConnectCompleted({
        senderName: senderProfile?.display_name || 'Someone',
        receiverName: receiverProfile?.display_name || 'Someone',
        lobbyName: intent.lobby?.title || 'Flash Lobby',
        matchId: match.id
      })

      return { success: true, mutual: true, matchId: match.id }
    } else {
      // Non-subscriber: Create pending_payment match at GHS 25
      const match = await createFlashLobbyMatch({
        initiatorId: intent.sender_id,
        targetId: intent.receiver_id,
        lobbyId: intent.lobby_id,
        matchScore,
        unlockPrice: 25,
        status: 'pending_payment',
        reasons: [
          'Flash Lobby Super Connect ⚡',
          `${senderProfile?.display_name || 'Someone'}: ${intent.message}`
        ]
      })

      await client
        .schema('m2m')
        .from('flash_lobby_intents')
        .update({
          is_super_connect: true,
          status: 'converted_to_match',
          match_id: match.id
        })
        .eq('id', intent.id)

      // Discord: Super Connect initiated (pending payment)
      const { notifyFlashLobbySuperConnectStarted } = await import('~/server/utils/discord')
      await notifyFlashLobbySuperConnectStarted({
        senderName: senderProfile?.display_name || 'Someone',
        receiverName: receiverProfile?.display_name || 'Someone',
        lobbyName: intent.lobby?.title || 'Flash Lobby',
        matchId: match.id
      })

      return { success: true, matchId: match.id, redirectTo: `/payment/match/${match.id}?super_connect=1` }
    }
  }

  if (action === 'decline') {
    await client
      .schema('m2m')
      .from('flash_lobby_intents')
      .update({
        status: 'declined',
        declined_at: new Date().toISOString()
      })
      .eq('id', intent.id)

    await createInAppNotification(client as any, {
      userId: intent.sender_id,
      type: 'flash_lobby_update',
      title: 'A spark has closed',
      message: `${receiverProfile?.display_name || 'Someone'} has passed on your Flash Lobby spark.`,
      data: { intent_id: intent.id, lobby_id: intent.lobby_id },
      dedupeKey: `flash-lobby-declined:${intent.id}`
    })

    return { success: true, declined: true }
  }

  if (action === 'delete') {
    await client
      .schema('m2m')
      .from('flash_lobby_intents')
      .delete()
      .eq('id', intent.id)

    return { success: true, deleted: true }
  }

  throw createError({ statusCode: 400, statusMessage: 'Invalid action' })
})
