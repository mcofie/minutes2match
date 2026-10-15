import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

/**
 * GET /api/matches/my-feedback
 *
 * The caller's own "how's it going?" answer for each of their matches, as { [matchId]: answer }.
 * Members can't read the feedback columns directly (migration 077), and never see the other person's.
 */
export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    const callerId = (user as any)?.id || (user as any)?.sub
    if (!callerId) throw createError({ statusCode: 401, message: 'Unauthorized' })

    const db = serverSupabaseServiceRole(event).schema('m2m') as any
    const { data, error } = await db
        .from('matches')
        .select('id, user_1_id, user_1_feedback, user_2_feedback')
        .or(`user_1_id.eq.${callerId},user_2_id.eq.${callerId}`)
    if (error) throw createError({ statusCode: 500, message: 'Could not load feedback' })

    setResponseHeader(event, 'Cache-Control', 'private, max-age=0, must-revalidate')
    const mine: Record<string, string> = {}
    for (const m of data || []) {
        const answer = m.user_1_id === callerId ? m.user_1_feedback : m.user_2_feedback
        if (answer) mine[m.id] = answer
    }
    return mine
})
