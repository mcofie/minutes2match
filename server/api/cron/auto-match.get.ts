/**
 * Auto Match Cron Endpoint
 * GET /api/cron/auto-match
 * 
 * Automatically finds and matches users above the configured match threshold.
 * Uses the "Ultra-Tight" Compatibility Algorithm.
 * 
 * Call via: https://cron-job.org/en/ with Authorization: Bearer <CRON_SECRET>
 */

import { createClient } from '@supabase/supabase-js'
import { notifyDiscord, DiscordColors } from '~/server/utils/discord'
import { calculateCompatibility, type UserProfile, type VibeAnswer } from '~/utils/compatibility'

// ====================
// TYPES & INTERFACES
// ====================

interface CronUserProfile extends UserProfile {
    id: string
    display_name: string
    phone?: string
    is_verified?: boolean
}

interface MatchResult {
    user1: CronUserProfile
    user2: CronUserProfile
    score: number
    reasons: string[]
    warnings: string[]
}

function calculateMatchScore(
    u1: CronUserProfile,
    u2: CronUserProfile,
    ans1List: VibeAnswer[],
    ans2List: VibeAnswer[]
): { score: number; reasons: string[]; warnings: string[]; confidence: number; eligible: boolean } {
    const result = calculateCompatibility(u1, ans1List, u2, ans2List)
    return {
        score: result.score,
        reasons: result.strengths,
        warnings: result.warnings,
        confidence: result.confidence,
        eligible: result.eligibility.eligible
    }
}

// ====================
// MAIN HANDLER
// ====================

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const startTime = Date.now()

    const authHeader = getHeader(event, 'authorization')
    if (authHeader !== `Bearer ${config.cronSecret}`) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const supabaseUrl = config.supabaseUrl || process.env.SUPABASE_URL
    const supabaseServiceKey = config.supabaseServiceKey
    if (!supabaseUrl || !supabaseServiceKey) {
        throw createError({ statusCode: 500, message: 'Server configuration error' })
    }

    const supabase = createClient<any, 'm2m'>(supabaseUrl, supabaseServiceKey, {
        db: { schema: 'm2m' }
    })

    try {
        const { data: users, error: usersError } = await supabase
            .from('profiles')
            .select('*')
            .eq('is_verified', true)
            .eq('is_active', true)

        if (usersError) throw createError({ statusCode: 500, message: 'Failed to fetch users' })

        const { data: existingMatches, error: matchError } = await supabase
            .from('matches')
            .select('user_1_id, user_2_id')

        if (matchError) throw createError({ statusCode: 500, message: 'Failed to fetch matches' })

        const matchedPairs = new Set<string>()
        existingMatches?.forEach(m => {
            matchedPairs.add(`${m.user_1_id}-${m.user_2_id}`)
            matchedPairs.add(`${m.user_2_id}-${m.user_1_id}`)
        })

        const { data: vibeAnswers, error: vibeError } = await supabase
            .from('vibe_answers')
            .select('user_id, question_key, answer_value')

        const userVibeAnswers = new Map<string, VibeAnswer[]>()
        vibeAnswers?.forEach((row: any) => {
            const existing = userVibeAnswers.get(row.user_id) || []
            existing.push({ question_key: row.question_key, answer: row.answer_value })
            userVibeAnswers.set(row.user_id, existing)
        })

        const eligibleUsers = (users || []) as CronUserProfile[]

        const { data: autoMatchSetting } = await supabase
            .from('settings')
            .select('value')
            .eq('key', 'auto_match_min_score')
            .maybeSingle()

        const MIN_SCORE = Math.max(0, Math.min(100, Number((autoMatchSetting as any)?.value?.score ?? 75)))
        const potentialMatches: MatchResult[] = []
        const usedPairs = new Set<string>()

        const evaluatePair = (u1: any, u2: any) => {
            const pairKey = [u1.id, u2.id].sort().join('-')
            if (matchedPairs.has(`${u1.id}-${u2.id}`) || matchedPairs.has(`${u2.id}-${u1.id}`) || usedPairs.has(pairKey)) return

            const result = calculateMatchScore(u1, u2, userVibeAnswers.get(u1.id) || [], userVibeAnswers.get(u2.id) || [])

            if (result.score >= MIN_SCORE && result.eligible) {
                potentialMatches.push({ user1: u1, user2: u2, score: result.score, reasons: result.reasons, warnings: result.warnings })
                usedPairs.add(pairKey)
            }
        }

        for (let i = 0; i < eligibleUsers.length; i++) {
            for (let j = i + 1; j < eligibleUsers.length; j++) {
                evaluatePair(eligibleUsers[i], eligibleUsers[j])
            }
        }

        potentialMatches.sort((a, b) => b.score - a.score)

        const selectedMatches: MatchResult[] = []
        const usedUsers = new Set<string>()

        for (const match of potentialMatches) {
            if (!usedUsers.has(match.user1.id) && !usedUsers.has(match.user2.id)) {
                selectedMatches.push(match)
                usedUsers.add(match.user1.id)
                usedUsers.add(match.user2.id)
            }
        }

        const UNLOCK_PRICE = 15
        const matchesToInsert = selectedMatches.map(match => ({
            user_1_id: match.user1.id,
            user_2_id: match.user2.id,
            unlock_price: UNLOCK_PRICE,
            status: 'pending_payment',
            match_score: match.score,
            match_reasons: match.reasons,
            match_warnings: match.warnings,
            expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
        }))

        let createdCount = 0
        if (matchesToInsert.length > 0) {
            const { error: insertError } = await supabase.from('matches').insert(matchesToInsert)
            if (!insertError) createdCount = matchesToInsert.length
        }

        const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2)

        const matchDetailsText = selectedMatches.length > 0
            ? selectedMatches.slice(0, 10).map((m, i) => `${i + 1}. **${m.user1.display_name}** ↔ **${m.user2.display_name}** (${m.score}%)`).join('\n')
            : '_No matches created_'

        await notifyDiscord({
            title: '🤖 Auto Matchmaker Report (V2 Engine)',
            description: `Automatic matching job completed with Ultra-Tight logic.`,
            color: createdCount > 0 ? DiscordColors.match : DiscordColors.info,
            fields: [
                {
                    name: '📊 Statistics', value: [
                        `**Total Users Checked:** ${users?.length || 0}`,
                        `**Threshold:** ${MIN_SCORE}%`,
                        `**Potential Matches (${MIN_SCORE}%+):** ${potentialMatches.length}`,
                        `**Matches Created:** ${createdCount}`
                    ].join('\n'), inline: false
                },
                { name: '💕 New Matches', value: matchDetailsText, inline: false },
                { name: '⏱️ Runtime', value: `${elapsedTime} seconds`, inline: true }
            ],
            footer: `Auto Match Cron Job • ${new Date().toISOString()}`
        })

        return { success: true, summary: { totalUsers: users?.length || 0, potentialMatches: potentialMatches.length, matchesCreated: createdCount, runtime: `${elapsedTime}s` } }

    } catch (err: any) {
        await notifyDiscord({ title: '🚨 Auto Matchmaker Error', description: err.message || 'Unknown error occurred', color: DiscordColors.error })
        throw createError({ statusCode: 500, statusMessage: 'Auto Matching Job Failed', data: { error: err.message || err } })
    }
})
