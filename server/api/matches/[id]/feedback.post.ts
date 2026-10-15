import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

/**
 * POST /api/matches/:id/feedback  { answer }
 * A member says how their introduction went. Only the two people in the match can answer,
 * each for themselves. Their answers also fill in the summary (feedback_status) shown to admins,
 * unless an admin has already set it by hand.
 */
const ANSWERS = ['going_well', 'chatting', 'not_a_fit', 'no_reply'] as const
type Answer = typeof ANSWERS[number]

// Both people's answers → one summary. "Not a fit" from either wins; otherwise the most positive
const summarise = (answers: (Answer | null)[]): string | null => {
  const given = answers.filter(Boolean) as Answer[]
  if (!given.length) return null
  if (given.includes('not_a_fit')) return 'unmatched'
  if (given.includes('going_well')) return 'dating'
  if (given.includes('chatting')) return 'connected'
  return 'no_response'
}

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const callerId = (user as any)?.id || (user as any)?.sub
  if (!callerId) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const matchId = getRouterParam(event, 'id')
  if (!matchId || !/^[0-9a-f-]{36}$/i.test(matchId)) throw createError({ statusCode: 400, message: 'Invalid match' })

  const { answer } = (await readBody<{ answer?: string }>(event)) || {}
  if (!answer || !ANSWERS.includes(answer as Answer)) throw createError({ statusCode: 400, message: 'Invalid answer' })

  const db = serverSupabaseServiceRole(event).schema('m2m') as any
  const { data: match } = await db
    .from('matches')
    .select('id, user_1_id, user_2_id, user_1_feedback, user_2_feedback, feedback_updated_by')
    .eq('id', matchId)
    .or(`user_1_id.eq.${callerId},user_2_id.eq.${callerId}`)
    .maybeSingle()
  if (!match) throw createError({ statusCode: 404, message: 'Match not found' })

  const side = match.user_1_id === callerId ? 'user_1' : 'user_2'
  const now = new Date().toISOString()
  const update: Record<string, any> = { [`${side}_feedback`]: answer, [`${side}_feedback_at`]: now }

  if (!match.feedback_updated_by) {
    const other = side === 'user_1' ? match.user_2_feedback : match.user_1_feedback
    const summary = summarise([answer as Answer, other])
    if (summary) {
      update.feedback_status = summary
      update.feedback_updated_at = now
    }
  }

  const { error } = await db.from('matches').update(update).eq('id', matchId)
  if (error) throw createError({ statusCode: 500, message: 'Could not save your answer' })

  return { success: true, answer }
})
