import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) return { hasReminder: false }

  const query = getQuery(event)
  const lobbyId = query.lobbyId as string

  if (!lobbyId) return { hasReminder: false }

  const service = serverSupabaseServiceRole(event)
  
  const { data: existing } = await service
    .schema('m2m')
    .from('flash_lobby_reminders')
    .select('id')
    .eq('user_id', user.id)
    .eq('lobby_id', lobbyId)
    .maybeSingle()

  return { hasReminder: !!existing }
})
