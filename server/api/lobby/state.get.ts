import { serverSupabaseClient, serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import { processFlashLobbyLifecycle } from '~/server/utils/flashLobby'

export default defineEventHandler(async (event) => {
  const headers = getHeaders(event)
  const query = getQuery(event)

  let userId: string | null = null

  try {
    const user = await serverSupabaseUser(event)
    if (user?.id) userId = user.id
  } catch (err) {
    console.warn('[Lobby State] serverSupabaseUser failed:', err)
  }

  if (!userId) {
    try {
      const client = await serverSupabaseClient(event)
      const { data: { session } } = await client.auth.getSession()
      if (session?.user?.id) userId = session.user.id
    } catch (err) {
      console.warn('[Lobby State] session lookup failed:', err)
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
        console.warn('[Lobby State] bearer verification failed:', err)
      }
    }
  }

  if (!userId && process.env.NODE_ENV !== 'production') {
    const debugUserId = query.userId
    if (debugUserId && debugUserId !== 'undefined') {
      userId = String(debugUserId)
      console.warn('[Lobby State] USER RECOVERED VIA INSECURE DEBUG FALLBACK:', userId)
    }
  }

  if (!userId || userId === 'undefined') {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const client = serverSupabaseServiceRole(event)
  const now = new Date().toISOString()
  await processFlashLobbyLifecycle()

  const { data: activeLobby } = await client
    .schema('m2m')
    .from('flash_lobbies')
    .select('*')
    .lte('start_at', now)
    .gte('end_at', now)
    .maybeSingle()

  const { data: recentLobby } = activeLobby
    ? { data: null }
    : await client
      .schema('m2m')
      .from('flash_lobbies')
      .select('*')
      .lt('end_at', now)
      .order('end_at', { ascending: false })
      .limit(1)
      .maybeSingle()

  const lobby = activeLobby || recentLobby

  if (!lobby) {
    return {
      lobby: null,
      scope: 'none',
      sent: [],
      received: [],
      mutual: [],
      expiredCount: 0
    }
  }

  const { data: intents } = await client
    .schema('m2m')
    .from('flash_lobby_intents')
    .select(`
      *,
      match:matches(id, status, unlock_price, unlocked_at)
    `)
    .eq('lobby_id', lobby.id)
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false })

  const relatedProfileIds = Array.from(new Set(
    (intents || []).flatMap((intent: any) => [intent.sender_id, intent.receiver_id]).filter(Boolean)
  ))

  const { data: profiles } = relatedProfileIds.length
    ? await client
      .schema('m2m')
      .from('profiles')
      .select('id, display_name, photo_url, location, dating_persona, gender')
      .in('id', relatedProfileIds)
    : { data: [] as any[] }

  const profilesById = new Map((profiles || []).map((profile: any) => [profile.id, profile]))

  const sent = (intents || [])
    .filter((intent: any) => (
      intent.sender_id === userId &&
      (intent.status === 'pending' || (intent.status === 'converted_to_match' && intent.is_super_connect))
    ))
    .map((intent: any) => {
      const targetProfile = profilesById.get(intent.receiver_id)
      return {
        id: intent.id,
        message: intent.message,
        status: intent.status,
        createdAt: intent.created_at,
        isSuperConnect: intent.is_super_connect,
        superConnectPaid: intent.super_connect_paid,
        lobbyEnded: !activeLobby,
        target: {
          id: targetProfile?.id || intent.receiver_id,
          displayName: targetProfile?.display_name || 'Unknown',
          photoUrl: targetProfile?.photo_url || null,
          location: targetProfile?.location || null,
          gender: targetProfile?.gender || null
        },
        match: intent.match || null
      }
    })

  const received = (intents || [])
    .filter((intent: any) => intent.receiver_id === userId && intent.status === 'pending')
    .map((intent: any) => {
      const senderProfile = profilesById.get(intent.sender_id)
      return {
        id: intent.id,
        message: intent.message,
        status: intent.status,
        createdAt: intent.created_at,
        isSuperConnect: intent.is_super_connect,
        superConnectPaid: intent.super_connect_paid,
        lobbyEnded: !activeLobby,
        sender: {
          id: senderProfile?.id || intent.sender_id,
          displayName: senderProfile?.display_name || 'Unknown',
          photoUrl: senderProfile?.photo_url || null,
          location: senderProfile?.location || null,
          gender: senderProfile?.gender || null
        },
        match: intent.match || null
      }
    })

  const mutualMap = new Map<string, any>()
  ;(intents || [])
    .filter((intent: any) => intent.status === 'mutual' && intent.match_id)
    .forEach((intent: any) => {
      if (mutualMap.has(intent.match_id)) return
      const counterpart = profilesById.get(intent.sender_id === userId ? intent.receiver_id : intent.sender_id)
      mutualMap.set(intent.match_id, {
        id: intent.id,
        createdAt: intent.created_at,
        matchId: intent.match_id,
        status: intent.match?.status || 'unlocked',
        displayName: counterpart?.display_name,
        photoUrl: counterpart?.photo_url,
        location: counterpart?.location,
        gender: counterpart?.gender,
        is_mutual: true
      })
    })

  const mutual = Array.from(mutualMap.values())
  const expiredCount = (intents || []).filter((intent: any) => (
    (intent.sender_id === userId || intent.receiver_id === userId) && intent.status === 'expired'
  )).length

  return {
    lobby,
    scope: activeLobby ? 'live' : 'recent',
    sent,
    received,
    mutual,
    expiredCount
  }
})
