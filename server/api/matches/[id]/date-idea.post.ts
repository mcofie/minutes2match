import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

/**
 * POST /api/matches/:id/date-idea  { ideaId, reaction }
 * A member reacts to a date idea suggested for their match: 'went', 'keen' (sounds fun),
 * 'not_for_us' (hides it for the pair), or null to take their reaction back.
 * Only the two people in the match can react.
 */
const REACTIONS = ['went', 'keen', 'not_for_us'] as const

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const callerId = (user as any)?.id || (user as any)?.sub
  if (!callerId) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const matchId = getRouterParam(event, 'id')
  if (!matchId || !/^[0-9a-f-]{36}$/i.test(matchId)) throw createError({ statusCode: 400, message: 'Invalid match' })

  const { ideaId, reaction } = (await readBody<{ ideaId?: string; reaction?: string | null }>(event)) || {}
  if (!ideaId || !/^[a-z0-9-]+$/.test(ideaId)) throw createError({ statusCode: 400, message: 'Invalid idea' })
  if (reaction !== null && !REACTIONS.includes(reaction as any)) throw createError({ statusCode: 400, message: 'Invalid reaction' })

  const db = serverSupabaseServiceRole(event).schema('m2m') as any
  const { data: match } = await db
    .from('matches')
    .select('id')
    .eq('id', matchId)
    .or(`user_1_id.eq.${callerId},user_2_id.eq.${callerId}`)
    .maybeSingle()
  if (!match) throw createError({ statusCode: 404, message: 'Match not found' })

  const key = { match_id: matchId, user_id: callerId, idea_id: ideaId }
  const { error } = reaction === null
    ? await db.from('date_idea_reactions').delete().match(key)
    : await db.from('date_idea_reactions').upsert({ ...key, reaction, created_at: new Date().toISOString() }, { onConflict: 'match_id,user_id,idea_id' })

  if (error) {
    console.error('[Date idea] Save failed:', error)
    throw createError({ statusCode: 500, message: 'Could not save that' })
  }
  return { success: true, ideaId, reaction }
})
