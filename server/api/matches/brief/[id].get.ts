import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

/**
 * GET /api/matches/brief/:id
 *
 * Everything the match brief needs in one round trip: the match, the caller's profile and
 * Vibe Check answers, and their match's profile and answers. Only the two people in the match
 * can read it. The queries run in parallel on the server, close to the database.
 */
export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    const callerId = (user as any)?.id || (user as any)?.sub
    if (!callerId) throw createError({ statusCode: 401, message: 'Unauthorized' })

    const matchId = getRouterParam(event, 'id')
    if (!matchId || !/^[0-9a-f-]{36}$/i.test(matchId)) throw createError({ statusCode: 400, message: 'Invalid match' })

    const db = serverSupabaseServiceRole(event).schema('m2m') as any

    // Round 1: the match (scoped to the caller), plus the caller's own profile and answers
    const [matchRes, meRes, myAnswersRes] = await Promise.all([
        db.from('matches').select('*').eq('id', matchId).or(`user_1_id.eq.${callerId},user_2_id.eq.${callerId}`).maybeSingle(),
        db.from('profiles').select('*').eq('id', callerId).maybeSingle(),
        db.from('vibe_answers').select('question_key, answer_value').eq('user_id', callerId),
    ])
    const match = matchRes.data
    if (matchRes.error || !match) throw createError({ statusCode: 404, message: 'Match not found' })

    // Round 2: their profile and answers
    const partnerId = match.user_1_id === callerId ? match.user_2_id : match.user_1_id
    const [partnerRes, partnerAnswersRes] = await Promise.all([
        db.from('profiles').select('*').eq('id', partnerId).maybeSingle(),
        db.from('vibe_answers').select('question_key, answer_value').eq('user_id', partnerId),
    ])

    let partner: any = null
    if (partnerRes.data) {
        // Internal fields a match never needs
        const { telegram_id, weekly_opt_in_until, ...rest } = partnerRes.data
        partner = { ...rest, vibeAnswers: partnerAnswersRes.data || [] }
    }

    // Private, per-member data: browsers may reuse it briefly, shared caches never
    setResponseHeader(event, 'Cache-Control', 'private, max-age=0, must-revalidate')

    return {
        match,
        me: meRes.data || null,
        myAnswers: myAnswersRes.data || [],
        partner,
    }
})
