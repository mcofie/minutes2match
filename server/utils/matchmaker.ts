import { createClient } from '@supabase/supabase-js'
import { calculateCompatibility } from '~/composables/useCompatibility' // Use the unified engine
import { notifyDiscord, DiscordColors } from './discord'

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

    if (!targetUser.is_verified || !targetUser.is_active) {
        console.log('[Matchmaker] User not eligible for matching (unverified/inactive):', userId)
        return null
    }

    // 2. Fetch Vibe Answers for target user
    const { data: targetAnswers } = await supabase
        .from('vibe_answers')
        .select('question_key, answer_value')
        .eq('user_id', userId)

    // 3. Fetch Eligible Candidates
    // We filter by cross-gender or interested_in preference early for efficiency
    let candidateQuery = supabase
        .from('profiles')
        .select('*')
        .eq('is_verified', true)
        .eq('is_active', true)
        .neq('id', userId)

    if (targetUser.interested_in && targetUser.interested_in !== 'everyone') {
        candidateQuery = candidateQuery.eq('gender', targetUser.interested_in)
    } else {
        // Default to opposite gender if preference not set
        const opposite = targetUser.gender === 'male' ? 'female' : 'male'
        candidateQuery = candidateQuery.eq('gender', opposite)
    }

    const { data: candidates, error: candidateError } = await candidateQuery

    if (candidateError || !candidates || candidates.length === 0) {
        return { matched: false, count: 0 }
    }

    // 4. Fetch ALL Vibe Answers for candidates in one go (or batch if pool is huge)
    const candidateIds = candidates.map(c => c.id)
    const { data: allAnswers } = await supabase
        .from('vibe_answers')
        .select('user_id, question_key, answer_value')
        .in('user_id', candidateIds)

    const answersMap = new Map<string, any[]>()
    allAnswers?.forEach(ans => {
        const existing = answersMap.get(ans.user_id) || []
        existing.push({ question_key: ans.question_key, answer_value: ans.answer_value, answer: ans.answer_value })
        answersMap.set(ans.user_id, existing)
    })

    const targetFmtAnswers = (targetAnswers || []).map(a => ({ 
        question_key: a.question_key, 
        answer_value: a.answer_value, 
        answer: a.answer_value 
    }))

    // 5. Fetch Existing Matches to avoid duplicates
    const { data: existingMatches } = await supabase
        .from('matches')
        .select('user_1_id, user_2_id')
        .or(`user_1_id.eq.${userId},user_2_id.eq.${userId}`)

    const matchedPartnerIds = new Set<string>()
    existingMatches?.forEach(m => {
        matchedPartnerIds.add(m.user_1_id === userId ? m.user_2_id : m.user_1_id)
    })

    // 6. Algorithm Loop
    const results: any[] = []
    for (const candidate of candidates) {
        if (matchedPartnerIds.has(candidate.id)) continue

        const candAnswers = answersMap.get(candidate.id) || []
        const match = calculateCompatibility(targetUser as any, targetFmtAnswers, candidate as any, candAnswers)

        if (match.score >= minScore && match.warnings.length === 0) {
            results.push({
                user1: targetUser,
                user2: candidate,
                score: match.score,
                reasons: match.strengths,
                warnings: match.warnings
            })
        }
    }

    // Sort by best score
    results.sort((a, b) => b.score - a.score)

    if (results.length === 0) return { matched: false, count: 0 }

    // 7. Auto-Create Best Match
    // We only create ONE match automatically to avoid overwhelming the user
    const bestMatch = results[0]
    const UNLOCK_PRICE = 15.00

    // AI Explanation for the match
    const { generateMatchExplanation } = await import('./ai')
    const aiExplanation = await generateMatchExplanation(targetUser, bestMatch.user2, bestMatch.score)

    const { data: newMatch, error: insertError } = await supabase
        .from('matches')
        .insert({
            user_1_id: userId,
            user_2_id: bestMatch.user2.id,
            unlock_price: UNLOCK_PRICE,
            status: 'pending_payment',
            match_score: bestMatch.score,
            match_reasons: bestMatch.reasons,
            match_warnings: bestMatch.warnings,
            ai_analysis: aiExplanation,
            created_by_label: 'system_jit',
            expires_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single()

    if (insertError) {
        console.error('[Matchmaker JIT] Insert failed:', insertError)
        return { matched: false, count: 0 }
    }

    // 8. Notifications
    await notifyDiscord({
        title: '⚡ Dynamic JIT Match Created!',
        description: `A real-time match was triggered for **${targetUser.display_name}**.`,
        color: DiscordColors.match,
        fields: [
            { name: 'Match', value: `**${targetUser.display_name}** ↔ **${bestMatch.user2.display_name}**`, inline: true },
            { name: 'Score', value: `**${bestMatch.score}%**`, inline: true },
            { name: 'Strengths', value: bestMatch.reasons.join(', ') || 'General Balance', inline: false }
        ],
        footer: `M2M JIT Matchmaker • Triggered Mode`
    })

    // 9. Real-time User Alerts
    try {
        const { notifyUser } = await import('./notify')
        
        // Notify User A (Triggered User)
        await notifyUser(userId, `🔥 Great news, ${targetUser.display_name}! We just found a high-quality match for you with **${bestMatch.user2.display_name}** (${bestMatch.score}% compatibility). Check it out now!`, {
            type: 'match',
            matchId: newMatch.id,
            smsPriority: 'high'
        })

        // Notify User B (The Partner)
        await notifyUser(bestMatch.user2.id, `👋 Hi ${bestMatch.user2.display_name}! We just found a new match for you: meet **${targetUser.display_name}**! You have a strong ${bestMatch.score}% compatibility score.`, {
            type: 'match',
            matchId: newMatch.id,
            smsPriority: 'normal'
        })
        
        console.log(`[Matchmaker JIT] Sent notifications for match ${newMatch.id}`)
    } catch (notifyError) {
        console.error('[Matchmaker JIT] Failed to send user notifications:', notifyError)
    }

    return { matched: true, match: newMatch, score: bestMatch.score }
}
