import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { matchId, text } = await readBody(event)

  if (!matchId || !text) {
    throw createError({ statusCode: 400, statusMessage: 'matchId and text are required' })
  }

  const client = serverSupabaseServiceRole(event)

  const { data, error } = await client
    .schema('m2m')
    .from('lobby_messages')
    .insert({
      match_id: matchId,
      sender_id: user.id,
      text: text
    })
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { success: true, message: data }
})
