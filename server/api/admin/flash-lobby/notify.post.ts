import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import { notifyFlashLobbyLifecycle } from '~/server/utils/discord'
import type { M2MDatabase } from '~/types/database.types'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const userId = (user as any)?.id || (user as any)?.sub
  if (!user || !userId) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const client = serverSupabaseServiceRole<M2MDatabase>(event)
  const { data: admin } = await client.schema('m2m').from('admins').select('id').eq('id', userId).maybeSingle()
  if (!admin) throw createError({ statusCode: 403, statusMessage: 'Admin access required' })

  const body = await readBody(event).catch(() => ({} as Record<string, any>))
  const action = body.action as 'created' | 'updated' | 'deleted'
  const lobby = body.lobby as { title?: string; start_at?: string; end_at?: string } | undefined

  if (!action || !lobby?.title) {
    throw createError({ statusCode: 400, statusMessage: 'action and lobby are required' })
  }

  await notifyFlashLobbyLifecycle({
    action,
    lobbyName: lobby.title,
    startAt: lobby.start_at,
    endAt: lobby.end_at
  })

  return { success: true }
})
