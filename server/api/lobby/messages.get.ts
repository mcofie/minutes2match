import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { matchId } = getQuery(event)
  if (!matchId) {
    throw createError({ statusCode: 400, statusMessage: 'matchId is required' })
  }

  const client = serverSupabaseServiceRole(event)

  const { data, error } = await client
    .schema('m2m')
    .from('lobby_messages')
    .select('id, sender_id, text, created_at')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { 
    messages: (data || []).map(m => ({
      id: m.id,
      role: m.sender_id === user.id ? 'me' : 'them',
      text: m.text,
      timestamp: m.created_at
    }))
  }
})
