import { isOptedInThisWeek, currentMatchWeekStart } from '~/utils/matchWeek'
import { unlockedMatchFields } from '~/utils/freeMatch'
import { createClient } from '@supabase/supabase-js'
import { calculateCompatibility } from '~/utils/compatibility'
import { notifyDiscord, DiscordColors } from './discord'
import { fetchAllRows } from './adminData'
import { announceMatch } from './matchAnnounce'

/**
 * Shared Matching Utility for Minutes 2 Match
 * Powers both the Daily Cron and the Just-In-Time (JIT) Triggered Matching.
 */

export interface MatchCandidate {
    id: string
    display_name: string
    gender: 'male' | 'female'
    interested_in?: 'male' | 'female' | 'everyone'
    intent?: string
    location?: string
    religion?: string
    genotype?: string
    birth_date?: string
    dating_persona?: string
    occupation?: string
    badges?: string[]
    dealbreakers?: any
    min_age?: number
    max_age?: number
    preferences_extracted?: any
}

/**
 * Finds potential matches for a specific user against the entire verified pool.
 * @param userId The ID of the user to find matches for
 * @param minScore Minimum score threshold (default 75)
 */
export async function runTargetedMatching(userId: string, minScore = 75) {
    if (!userId || userId === 'undefined') {
        console.warn('[Matchmaker] Aborting: Invalid userId provided (undefined)')
        return null
    }
    const config = useRuntimeConfig()
    const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey, {
        db: { schema: 'm2m' }
    })

    // 1. Fetch the Target User
    const { data: targetUser, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

    if (userError || !targetUser) {
        console.error('[Matchmaker] Target user not found:', userId)
        return null
    }

    if (!targetUser.is_verified || !targetUser.is_active || !isOptedInThisWeek(targetUser.weekly_opt_in_until)) {
        console.log('[Matchmaker] User not eligible for matching (unverified/inactive):', userId)
        return null
    }

    // One match per member per week: stop if this member already has this week's match
    const weekStart = currentMatchWeekStart().toISOString()
    const { count: targetThisWeek } = await supabase
        .from('matches')
        .select('id', { count: 'exact', head: true })
        .or(`user_1_id.eq.${userId},user_2_id.eq.${userId}`)
        .gte('created_at', weekStart)
    if ((targetThisWeek || 0) > 0) {
        console.log('[Matchmaker] Already matched this week:', userId)
        return { matched: false, count: 0, reason: 'already_matched_this_week' }
    }

    // 2. Fetch Vibe Answers for target user
    const { data: targetAnswers } = await supabase
        .from('vibe_answers')
        .select('question_key, answer_value, dimension')
        .eq('user_id', userId)

    // 3. Fetch Eligible Candidates
    // We filter by cross-gender or interested_in preference early for efficiency
    let candidateQuery = supabase
        .from('profiles')
        .select('*')
        .eq('is_verified', true)
        .eq('is_active', true)
        .gte('weekly_opt_in_until', new Date().toISOString())
        .neq('id', userId)

    if (targetUser.interested_in && targetUser.interested_in !== 'everyone') {
        candidateQuery = candidateQuery.eq('gender', targetUser.interested_in)
    } else {
        // Default to opposite gender if preference not set
        const opposite = targetUser.gender === 'male' ? 'female' : 'male'
        candidateQuery = candidateQuery.eq('gender', opposite)
    }

    candidateQuery = candidateQuery.or(`interested_in.eq.everyone,interested_in.eq.${targetUser.gender},interested_in.is.null`)

    const { data: allCandidates, error: candidateError } = await candidateQuery

    if (candidateError || !allCandidates || allCandidates.length === 0) {
        return { matched: false, count: 0 }
    }

    // ...and never give someone a second match this week through somebody else's trigger
    const { data: thisWeeksMatches } = await supabase
        .from('matches')
        .select('user_1_id, user_2_id')
        .gte('created_at', weekStart)
    const matchedThisWeek = new Set<string>()
    thisWeeksMatches?.forEach(m => { matchedThisWeek.add(m.user_1_id); matchedThisWeek.add(m.user_2_id) })
    const candidates = allCandidates.filter(c => !matchedThisWeek.has(c.id))
    if (candidates.length === 0) return { matched: false, count: 0 }

    // 4. Candidates' Vibe Answers, in batches: an .in() with hundreds of ids makes a very long URL,
    //    and each response is capped at 1,000 rows
    const candidateIds = candidates.map(c => c.id)
    const allAnswers: any[] = []
    for (let i = 0; i < candidateIds.length; i += 50) {
        const ids = candidateIds.slice(i, i + 50)
        allAnswers.push(...await fetchAllRows<any>(() => supabase
            .from('vibe_answers')
            .select('user_id, question_key, answer_value, dimension')
            .in('user_id', ids)
            .order('user_id')
            .order('question_key')))
    }

    const answersMap = new Map<string, any[]>()
    allAnswers.forEach(ans => {
        const existing = answersMap.get(ans.user_id) || []
        existing.push({ question_key: ans.question_key, answer_value: ans.answer_value, answer: ans.answer_value, dimension: ans.dimension })
        answersMap.set(ans.user_id, existing)
    })

    const targetFmtAnswers = (targetAnswers || []).map(a => ({
        question_key: a.question_key,
        answer_value: a.answer_value,
        answer: a.answer_value,
        dimension: a.dimension
    }))

    // 5. Existing matches, so nobody is introduced to the same person twice
    const { data: existingMatches } = await supabase
        .from('matches')
        .select('user_1_id, user_2_id')
        .or(`user_1_id.eq.${userId},user_2_id.eq.${userId}`)

    const matchedPartnerIds = new Set<string>()
    existingMatches?.forEach(m => {
        matchedPartnerIds.add(m.user_1_id === userId ? m.user_2_id : m.user_1_id)
    })

    // 6. Score everyone the rules allow
    const results: any[] = []
    for (const candidate of candidates) {
        if (matchedPartnerIds.has(candidate.id)) continue

        const candAnswers = answersMap.get(candidate.id) || []
        const match = calculateCompatibility(targetUser as any, targetFmtAnswers, candidate as any, candAnswers)

        if (match.score >= minScore && match.eligibility.eligible) {
            results.push({
                user1: targetUser,
                user2: candidate,
                score: match.score,
                reasons: match.strengths,
                warnings: match.warnings,
                confidence: match.confidence,
                breakdown: match.breakdown
            })
        }
    }

    results.sort((a, b) => b.score - a.score)
    if (results.length === 0) return { matched: false, count: 0 }

    // 7. A second look at close calls: when the top few are within a few points, let the AI choose
    //    between them as a matchmaker would. The rules already filtered them; this only reorders.
    let best = results[0]
    let selectionNote: string | null = null
    const closeCalls = results.filter(r => best.score - r.score <= 5).slice(0, 3)
    if (closeCalls.length > 1) {
        const { pickBestCandidate } = await import('./ai')
        const pick = await pickBestCandidate(targetUser, closeCalls.map(r => ({ profile: r.user2, score: r.score, reasons: r.reasons, warnings: r.warnings })))
        if (pick) {
            best = closeCalls[pick.index]
            selectionNote = `AI picked ${best.user2.display_name} from ${closeCalls.length} close candidates: ${pick.reason}`
        }
    }

    const { data: newMatch, error: insertError } = await supabase
        .from('matches')
        .insert({
            user_1_id: userId,
            user_2_id: best.user2.id,
            ...unlockedMatchFields(),
            match_score: best.score,
            match_reasons: best.reasons,
            match_warnings: best.warnings,
            match_breakdown: best.breakdown,
            match_confidence: best.confidence,
            selection_note: selectionNote,
            created_by_label: 'system_jit'
        })
        .select()
        .single()

    if (insertError) {
        console.error('[Matchmaker JIT] Insert failed:', insertError)
        return { matched: false, count: 0 }
    }

    // 8. Admin heads-up
    await notifyDiscord({
        title: '⚡ On-the-spot match',
        description: `A match was made for **${targetUser.display_name}** as soon as they were ready.`,
        color: DiscordColors.match,
        fields: [
            { name: 'Match', value: `**${targetUser.display_name}** ↔ **${best.user2.display_name}**`, inline: true },
            { name: 'Score', value: `**${best.score}%**`, inline: true },
            { name: 'Confidence', value: `**${best.confidence || 0}%**`, inline: true },
            { name: 'Strengths', value: best.reasons.join(', ') || 'General balance', inline: false },
            ...(selectionNote ? [{ name: 'AI pick', value: selectionNote, inline: false }] : [])
        ],
        footer: 'M2M matchmaker · on the spot'
    })

    // 9. "Why you two" note and messages to both people
    await announceMatch(supabase, newMatch, { user1: targetUser, user2: best.user2 })

    return { matched: true, match: newMatch, score: best.score }
}
