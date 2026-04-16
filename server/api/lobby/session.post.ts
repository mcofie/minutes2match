import { serverSupabaseClient, serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import { getActiveFlashLobby, getFlashLobbyModerationState, leaveFlashLobbySession, touchFlashLobbySession } from '~/server/utils/flashLobby'

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({} as Record<string, any>))
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

  const action = body.action === 'leave' ? 'leave' : 'heartbeat'
  const activeLobby = await getActiveFlashLobby()
  const lobbyId = String(body.lobbyId || activeLobby?.id || '')

  if (!lobbyId) {
    return { success: true, lobbyId: null, skipped: true }
  }

  if (action === 'leave') {
    await leaveFlashLobbySession({ lobbyId, userId })
    return { success: true, action, lobbyId }
  }

  const moderationState = await getFlashLobbyModerationState({ lobbyId, userId })
  if (moderationState.removed || moderationState.blocked) {
    throw createError({ statusCode: 403, statusMessage: 'You are no longer active in this lobby' })
  }

  await touchFlashLobbySession({ lobbyId, userId })
  return { success: true, action, lobbyId }
})
