import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const userId = (user as any)?.id || (user as any)?.sub
  if (!user || !userId) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const client = serverSupabaseServiceRole(event)
  const { data: admin } = await client.schema('m2m').from('admins').select('id').eq('id', userId).maybeSingle()
  if (!admin) throw createError({ statusCode: 403, statusMessage: 'Admin access required' })

  const now = new Date().toISOString()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [{ data: sessions }, { data: endedLobbies }, { data: pendingIntents }, { data: moderationActions }, { data: recentMatches }] = await Promise.all([
    client
      .schema('m2m')
      .from('flash_lobby_sessions')
      .select('lobby_id, user_id, joined_at, last_seen_at, left_at')
      .gte('created_at', sevenDaysAgo),
    client
      .schema('m2m')
      .from('flash_lobbies')
      .select('id, title, end_at')
      .lt('end_at', now)
      .order('end_at', { ascending: false })
      .limit(10),
    client
      .schema('m2m')
      .from('flash_lobby_intents')
      .select('id, lobby_id, status, match_id, created_at')
      .eq('status', 'pending')
      .gte('created_at', sevenDaysAgo),
    client
      .schema('m2m')
      .from('flash_lobby_moderation_actions')
      .select('id, action, active, created_at')
      .eq('active', true)
      .gte('created_at', sevenDaysAgo),
    client
      .schema('m2m')
      .from('matches')
      .select('id, created_at, unlocked_at, status')
      .eq('created_by_label', 'flash_lobby')
      .gte('created_at', sevenDaysAgo)
  ])

  const sessionRows = sessions || []
  const totalJoins = sessionRows.length
  const uniqueAttendees = new Set(sessionRows.map((session: any) => session.user_id).filter(Boolean)).size
  const avgMinutesInRoom = totalJoins
    ? Math.round(sessionRows.reduce((sum: number, session: any) => {
      const start = new Date(session.joined_at).getTime()
      const end = new Date(session.left_at || session.last_seen_at || session.joined_at).getTime()
      return sum + Math.max(0, (end - start) / 60000)
    }, 0) / totalJoins)
    : 0

  const endedLobbyIds = (endedLobbies || []).map((lobby: any) => lobby.id)
  const { data: endedLobbyIntents } = endedLobbyIds.length
    ? await client
      .schema('m2m')
      .from('flash_lobby_intents')
      .select('id, lobby_id, status, match_id, is_super_connect, super_connect_paid')
      .in('lobby_id', endedLobbyIds)
    : { data: [] as any[] }

  const endedIntents = endedLobbyIntents || []
  const postLobbyPendingReview = endedIntents.filter((intent: any) => intent.status === 'pending').length
  const postLobbyUnlocks = endedIntents.filter((intent: any) => intent.status === 'converted_to_match' && intent.match_id).length
  const postLobbyMutuals = endedIntents.filter((intent: any) => intent.status === 'mutual' && intent.match_id).length
  const superConnectConversions = endedIntents.filter((intent: any) => (intent.is_super_connect || intent.super_connect_paid) && intent.match_id).length
  const postLobbyConversionRate = endedIntents.length
    ? Math.round(((postLobbyUnlocks + postLobbyMutuals) / endedIntents.length) * 100)
    : 0

  const recentMatchRows = recentMatches || []
  const unlockedRecentMatches = recentMatchRows.filter((match: any) => match.status === 'unlocked').length
  const unlockedRate = recentMatchRows.length
    ? Math.round((unlockedRecentMatches / recentMatchRows.length) * 100)
    : 0

  const activeModeration = moderationActions || []
  const moderationBreakdown = {
    removed: activeModeration.filter((action: any) => action.action === 'removed').length,
    hidden: activeModeration.filter((action: any) => action.action === 'hide_profile').length,
    blocked: activeModeration.filter((action: any) => action.action === 'block_rejoin').length
  }

  return {
    totalJoins,
    uniqueAttendees,
    avgMinutesInRoom,
    pendingReviewCount: postLobbyPendingReview,
    postLobbyUnlocks,
    postLobbyMutuals,
    superConnectConversions,
    postLobbyConversionRate,
    unlockedRate,
    moderationBreakdown,
    pendingIntents7d: (pendingIntents || []).length
  }
})
