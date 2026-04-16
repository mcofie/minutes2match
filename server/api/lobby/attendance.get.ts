import { getQuery } from 'h3'
import { serverSupabaseClient, serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import { getActiveFlashLobby, getLiveFlashLobbyAttendance } from '~/server/utils/flashLobby'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const requestedLobbyId = query.lobbyId ? String(query.lobbyId) : null

  const headers = getHeaders(event)

  let userId: string | null = null
  try {
    const user = await serverSupabaseUser(event)
    if (user?.id) userId = user.id
  } catch {}

  if (!userId) {
    try {
      const client = await serverSupabaseClient(event)
      const { data: { session } } = await client.auth.getSession()
      if (session?.user?.id) userId = session.user.id
    } catch {}
  }

  if (!userId) {
    const authHeader = headers.authorization || headers.Authorization
    const bearer = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null

    if (bearer) {
      try {
        const admin = serverSupabaseServiceRole(event)
        const { data } = await admin.auth.getUser(bearer)
        if (data.user?.id) userId = data.user.id
      } catch {}
    }
  }

  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const client = serverSupabaseServiceRole(event)
  const { data: adminRow } = await client
    .schema('m2m')
    .from('admins')
    .select('id')
    .eq('id', userId)
    .maybeSingle()

  const activeLobby = requestedLobbyId ? null : await getActiveFlashLobby()
  const targetLobbyIds = requestedLobbyId ? [requestedLobbyId] : activeLobby?.id ? [activeLobby.id] : []

  const attendance = await getLiveFlashLobbyAttendance(targetLobbyIds)

  return {
    lobbyId: requestedLobbyId || activeLobby?.id || null,
    count: attendance.count,
    ids: attendance.users.map((user) => user.id),
    users: adminRow ? attendance.users : [],
    isAdmin: !!adminRow
  }
})
