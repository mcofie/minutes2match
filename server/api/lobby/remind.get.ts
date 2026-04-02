import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) return { hasReminder: false }

  const query = getQuery(event)
  const lobbyId = query.lobbyId as string

  // Robust UUID validation for all inputs to prevent 22P02 errors
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  if (!user.id || !uuidRegex.test(user.id)) return { hasReminder: false }
  if (!lobbyId || !uuidRegex.test(lobbyId)) return { hasReminder: false }

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
