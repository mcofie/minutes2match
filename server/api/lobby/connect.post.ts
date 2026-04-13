import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const body = await readBody(event)
  const { targetId, matchScore, reaction } = body

  if (!targetId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Target ID is required'
    })
  }

  const client = serverSupabaseServiceRole(event)

  // 1. Check if a match already exists (in either direction)
  const { data: existing } = await client
    .schema('m2m')
    .from('matches')
    .select('id')
    .or(`and(user_1_id.eq.${user.id},user_2_id.eq.${targetId}),and(user_1_id.eq.${targetId},user_2_id.eq.${user.id})`)
    .maybeSingle()

  if (existing) {
    return { success: true, message: 'Already connected', id: existing.id }
  }

  // 2. Create the match
  // We use user_1 as the "initiator" in this context
  const { data, error } = await client
    .schema('m2m')
    .from('matches')
    .insert({
      user_1_id: user.id,
      user_2_id: targetId,
      status: 'pending_payment',
      unlock_price: 15, // Standard unlock fee for Flash Lobby connections
      match_score: matchScore || Math.floor(Math.random() * 15) + 80,
      created_by_label: 'flash_lobby',
      match_reasons: [
        'Flash Lobby Connection ⚡', 
        reaction ? `Spark Sent: ${reaction}` : 'Mutual Instant Interest'
      ],
      expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() // 48 hours to unlock
    })
    .select()
    .single()

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }

  return {
    success: true,
    matchId: data.id
  }
})
