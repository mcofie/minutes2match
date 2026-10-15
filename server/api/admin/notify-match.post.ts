import { createClient } from '@supabase/supabase-js'

/**
 * Announce a match an admin just made: write the "why you two" note and message both people.
 * POST /api/admin/notify-match
 * Body: { matchId } (preferred), or { user1Id, user2Id } to find their match.
 * Admins only (it sends SMS).
 */
export default defineEventHandler(async (event) => {
  await requireAdminAccess(event)
  const { matchId, user1Id, user2Id } = (await readBody(event)) || {}

  const config = useRuntimeConfig()
  const db = createClient(config.supabaseUrl, config.supabaseServiceKey, { db: { schema: 'm2m' } })

  let query = db.from('matches').select('id, user_1_id, user_2_id, match_score, match_reasons, ai_analysis')
  if (matchId) {
    query = query.eq('id', matchId)
  } else if (user1Id && user2Id) {
    query = query.or(`and(user_1_id.eq.${user1Id},user_2_id.eq.${user2Id}),and(user_1_id.eq.${user2Id},user_2_id.eq.${user1Id})`)
  } else {
    throw createError({ statusCode: 400, message: 'Pass matchId, or user1Id and user2Id' })
  }

  const { data: match } = await query.order('created_at', { ascending: false }).limit(1).maybeSingle()
  if (!match) throw createError({ statusCode: 404, message: 'Match not found' })

  const result = await announceMatch(db, match)
  return { success: true, ...result }
})
