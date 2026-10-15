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
        db.from('vibe_answers').select('question_key, answer_value, dimension').eq('user_id', callerId),
    ])
    const match = matchRes.data
    if (matchRes.error || !match) throw createError({ statusCode: 404, message: 'Match not found' })

    // Round 2: their profile and answers
    const partnerId = match.user_1_id === callerId ? match.user_2_id : match.user_1_id
    const [partnerRes, partnerAnswersRes] = await Promise.all([
        db.from('profiles').select('*').eq('id', partnerId).maybeSingle(),
        db.from('vibe_answers').select('question_key, answer_value, dimension').eq('user_id', partnerId),
    ])

    let partner: any = null
    if (partnerRes.data) {
        // Only what a match may see (no admin notes, genotype, etc.)
        partner = { ...toPartnerProfile(partnerRes.data), vibeAnswers: partnerAnswersRes.data || [] }
    }

    // Private, per-member data: browsers may reuse it briefly, shared caches never
    setResponseHeader(event, 'Cache-Control', 'private, max-age=0, must-revalidate')

    // Admin-only notes and the other person's private feedback stay on the server
    const side = match.user_1_id === callerId ? 'user_1' : 'user_2'
    const myFeedback = match[`${side}_feedback`] || null
    const {
        feedback_notes, feedback_updated_by, user_notes, selection_note,
        user_1_feedback, user_2_feedback, user_1_feedback_at, user_2_feedback_at,
        ...memberMatch
    } = match

    const dateIdeas = await loadDateIdeas(db, matchId, callerId)

    return {
        match: { ...memberMatch, my_feedback: myFeedback },
        dateIdeas,
        me: meRes.data || null,
        myAnswers: myAnswersRes.data || [],
        partner,
    }
})

/**
 * The date idea catalogue (with partner offers), this pair's reactions and everyone's totals.
 * Returns null if the date_ideas tables don't exist yet (migration 079); the page then uses the built-in list.
 */
async function loadDateIdeas(db: any, matchId: string, callerId: string) {
    const ideasRes = await db
        .from('date_ideas')
        .select('*, venue:partner_venues(name, discount_label, website_url, is_active, expires_at)')
        .eq('is_active', true)
        .order('sort_order')
    if (ideasRes.error) return null

    const now = Date.now()
    const catalog = (ideasRes.data || []).map((row: any) => {
        const live = row.venue?.is_active && (!row.venue.expires_at || new Date(row.venue.expires_at).getTime() > now)
        return { ...row, venue: live ? row.venue : null }
    })

    const [pairRes, allRes] = await Promise.all([
        db.from('date_idea_reactions').select('user_id, idea_id, reaction').eq('match_id', matchId),
        db.from('date_idea_reactions').select('idea_id, reaction').limit(5000)
    ])

    const myReactions: Record<string, string> = {}
    const hidden = new Set<string>()
    for (const r of pairRes.data || []) {
        if (r.user_id === callerId) myReactions[r.idea_id] = r.reaction
        if (r.reaction === 'not_for_us') hidden.add(r.idea_id)
    }

    const stats: Record<string, { went: number; keen: number; notForUs: number }> = {}
    for (const r of allRes.data || []) {
        const s = (stats[r.idea_id] ||= { went: 0, keen: 0, notForUs: 0 })
        if (r.reaction === 'went') s.went++
        else if (r.reaction === 'keen') s.keen++
        else s.notForUs++
    }

    return { catalog, myReactions, hidden: [...hidden], stats }
}
