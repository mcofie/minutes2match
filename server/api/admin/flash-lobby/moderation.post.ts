import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import { leaveFlashLobbySession } from '~/server/utils/flashLobby'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const adminUserId = (user as any)?.id || (user as any)?.sub
  if (!user || !adminUserId) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const client = serverSupabaseServiceRole(event)
  const { data: admin } = await client.schema('m2m').from('admins').select('id').eq('id', adminUserId).maybeSingle()
  if (!admin) throw createError({ statusCode: 403, statusMessage: 'Admin access required' })

  const body = await readBody(event).catch(() => ({} as Record<string, any>))
  const { lobbyId, targetUserId, action, note } = body

  if (!lobbyId || !targetUserId || !action) {
    throw createError({ statusCode: 400, statusMessage: 'lobbyId, targetUserId and action are required' })
  }

  const allowedActions = new Set(['remove_user', 'hide_profile', 'block_rejoin', 'restore_user'])
  if (!allowedActions.has(action)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid moderation action' })
  }

  if (action === 'restore_user') {
    const { error } = await client
      .schema('m2m')
      .from('flash_lobby_moderation_actions')
      .update({ active: false, note: note || null })
      .eq('lobby_id', lobbyId)
      .eq('user_id', targetUserId)
      .eq('active', true)

    if (error) throw createError({ statusCode: 500, statusMessage: error.message })

    return { success: true, restored: true }
  }

  const mappedAction = action === 'remove_user'
    ? 'removed'
    : action === 'hide_profile'
      ? 'hide_profile'
      : 'block_rejoin'

  const { data: existing } = await client
    .schema('m2m')
    .from('flash_lobby_moderation_actions')
    .select('id')
    .eq('lobby_id', lobbyId)
    .eq('user_id', targetUserId)
    .eq('action', mappedAction)
    .maybeSingle()

  let error = null as any

  if (existing?.id) {
    const response = await client
      .schema('m2m')
      .from('flash_lobby_moderation_actions')
      .update({
        active: true,
        note: note || null,
        created_by: adminUserId
      })
      .eq('id', existing.id)
    error = response.error
  } else {
    const response = await client
      .schema('m2m')
      .from('flash_lobby_moderation_actions')
      .insert({
        lobby_id: lobbyId,
        user_id: targetUserId,
        action: mappedAction,
        active: true,
        note: note || null,
        created_by: adminUserId
      })
    error = response.error
  }

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  if (mappedAction === 'removed' || mappedAction === 'block_rejoin') {
    await leaveFlashLobbySession({ lobbyId, userId: targetUserId })
  }

  return { success: true, action: mappedAction }
})
