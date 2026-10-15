/**
 * Auto Match Cron Endpoint
 * GET /api/cron/auto-match
 * 
 * Weekly matching: scores every pair of opted-in members who aren't matched yet this week,
 * keeps the pairs the rules allow above the minimum score, then picks pairs so the most people
 * get a good match (utils/pairing.ts). Members who missed out last week get priority.
 * New matches are announced: an AI "why you two" note and a message to both people.
 * 
 * Call via: https://cron-job.org/en/ with Authorization: Bearer <CRON_SECRET>
 */

import { createClient } from '@supabase/supabase-js'
import { notifyDiscord, DiscordColors } from '~/server/utils/discord'
import { calculateCompatibility, type UserProfile, type VibeAnswer } from '~/utils/compatibility'
import { unlockedMatchFields } from '~/utils/freeMatch'
import { currentMatchWeekStart, matchWeekKey } from '~/utils/matchWeek'
import { choosePairs, MISSED_LAST_WEEK_BOOST, type CandidatePair } from '~/utils/pairing'

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
    confidence: number
    breakdown: Record<string, number>
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
        // Everything is paged: Supabase returns at most 1,000 rows per request, and there are
        // more Vibe Check answers than that. Missing answers used to make members look unmatchable.
        const users = await fetchAllRows<CronUserProfile>(() => supabase
            .from('profiles')
            .select('*')
            .eq('is_verified', true)
            .eq('is_active', true)
            .gte('weekly_opt_in_until', new Date().toISOString())
            .order('id'))

        const existingMatches = await fetchAllRows<any>(() => supabase
            .from('matches')
            .select('user_1_id, user_2_id, created_at, status')
            .order('created_at'))

        const matchedPairs = new Set<string>()
        // One match per member per week: anyone already matched this week sits this run out
        const weekStart = currentMatchWeekStart().getTime()
        const lastWeekStart = weekStart - 7 * 24 * 60 * 60 * 1000
        const matchedThisWeek = new Set<string>()
        const matchedLastWeek = new Set<string>()
        existingMatches.forEach(m => {
            matchedPairs.add(`${m.user_1_id}-${m.user_2_id}`)
            matchedPairs.add(`${m.user_2_id}-${m.user_1_id}`)
            if (m.status === 'expired') return
            const at = new Date(m.created_at).getTime()
            if (at >= weekStart) {
                matchedThisWeek.add(m.user_1_id)
                matchedThisWeek.add(m.user_2_id)
            } else if (at >= lastWeekStart) {
                matchedLastWeek.add(m.user_1_id)
                matchedLastWeek.add(m.user_2_id)
            }
        })

        // Members who opted in last week but weren't matched get priority this week
        const missedLastWeek = new Set<string>()
        try {
            const lastWeekRows = await fetchAllRows<any>(() => supabase
                .from('weekly_opt_ins')
                .select('user_id, opted_out_at')
                .eq('week_start', matchWeekKey(new Date(lastWeekStart)))
                .order('user_id'))
            lastWeekRows.forEach(r => { if (!r.opted_out_at && !matchedLastWeek.has(r.user_id)) missedLastWeek.add(r.user_id) })
        } catch {
            // weekly_opt_ins arrives with migration 075; without it there's simply no priority
        }

        const vibeAnswers = await fetchAllRows<any>(() => supabase
            .from('vibe_answers')
            .select('user_id, question_key, answer_value, dimension')
            .order('user_id')
            .order('question_key'))

        const userVibeAnswers = new Map<string, VibeAnswer[]>()
        vibeAnswers.forEach((row: any) => {
            const existing = userVibeAnswers.get(row.user_id) || []
            // dimension ties older question variants (love_language_v2 …) to what they measure
            existing.push({ question_key: row.question_key, answer: row.answer_value, dimension: row.dimension })
            userVibeAnswers.set(row.user_id, existing)
        })

        const eligibleUsers = users.filter(u => !matchedThisWeek.has(u.id))

        const { data: autoMatchSetting } = await supabase
            .from('settings')
            .select('value')
            .eq('key', 'auto_match_min_score')
            .maybeSingle()

        const MIN_SCORE = Math.max(0, Math.min(100, Number((autoMatchSetting as any)?.value?.score ?? 75)))

        // Score every pair; keep the ones the rules allow
        const candidates: CandidatePair<MatchResult>[] = []
        for (let i = 0; i < eligibleUsers.length; i++) {
            for (let j = i + 1; j < eligibleUsers.length; j++) {
                const u1 = eligibleUsers[i]
                const u2 = eligibleUsers[j]
                if (matchedPairs.has(`${u1.id}-${u2.id}`)) continue
                const result = calculateCompatibility(u1, userVibeAnswers.get(u1.id) || [], u2, userVibeAnswers.get(u2.id) || [])
                if (result.score < MIN_SCORE || !result.eligibility.eligible) continue
                const boost = (missedLastWeek.has(u1.id) ? MISSED_LAST_WEEK_BOOST : 0) + (missedLastWeek.has(u2.id) ? MISSED_LAST_WEEK_BOOST : 0)
                candidates.push({
                    a: u1.id,
                    b: u2.id,
                    weight: result.score + boost,
                    data: { user1: u1, user2: u2, score: result.score, reasons: result.strengths, warnings: result.warnings, confidence: result.confidence, breakdown: result.breakdown }
                })
            }
        }

        // Pick pairs so the most people get a good match (each person at most once)
        const selectedMatches = choosePairs(candidates).map(c => c.data!).sort((x, y) => y.score - x.score)

        let createdCount = 0
        let notifiedCount = 0
        if (selectedMatches.length > 0) {
            const { data: created, error: insertError } = await supabase
                .from('matches')
                .insert(selectedMatches.map(match => ({
                    user_1_id: match.user1.id,
                    user_2_id: match.user2.id,
                    ...unlockedMatchFields(),
                    match_score: match.score,
                    match_reasons: match.reasons,
                    match_warnings: match.warnings,
                    match_breakdown: match.breakdown,
                    match_confidence: match.confidence,
                    created_by_label: 'weekly_run'
                })))
                .select('id, user_1_id, user_2_id, match_score, match_reasons, ai_analysis')

            if (insertError) throw insertError
            createdCount = created?.length || 0

            // Tell both people (and write the "why you two" note), a few at a time
            const byId = new Map(users.map(u => [u.id, u]))
            const queue = [...(created || [])]
            const worker = async () => {
                for (let m = queue.shift(); m; m = queue.shift()) {
                    const res = await announceMatch(supabase, m, { user1: byId.get(m.user_1_id), user2: byId.get(m.user_2_id) })
                    notifiedCount += res.notified
                }
            }
            await Promise.all([worker(), worker(), worker()])
        }

        const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2)

        const matchDetailsText = selectedMatches.length > 0
            ? selectedMatches.slice(0, 10).map((m, i) => `${i + 1}. **${m.user1.display_name}** ↔ **${m.user2.display_name}** (${m.score}%)`).join('\n')
            : '_No matches created_'

        await notifyDiscord({
            title: '🤖 Weekly matching report',
            description: 'Automatic weekly matching finished.',
            color: createdCount > 0 ? DiscordColors.match : DiscordColors.info,
            fields: [
                {
                    name: '📊 Statistics', value: [
                        `**Opted in:** ${users.length} (${eligibleUsers.length} not yet matched this week)`,
                        `**Threshold:** ${MIN_SCORE}%`,
                        `**Eligible pairs:** ${candidates.length}`,
                        `**Matches created:** ${createdCount} (${notifiedCount} people notified)`,
                        `**Priority (missed last week):** ${missedLastWeek.size}`
                    ].join('\n'), inline: false
                },
                { name: '💕 New Matches', value: matchDetailsText, inline: false },
                { name: '⏱️ Runtime', value: `${elapsedTime} seconds`, inline: true }
            ],
            footer: `Auto Match Cron Job • ${new Date().toISOString()}`
        })

        return { success: true, summary: { optedIn: users.length, eligiblePairs: candidates.length, matchesCreated: createdCount, notified: notifiedCount, runtime: `${elapsedTime}s` } }

    } catch (err: any) {
        await notifyDiscord({ title: '🚨 Auto Matchmaker Error', description: err.message || 'Unknown error occurred', color: DiscordColors.error })
        throw createError({ statusCode: 500, statusMessage: 'Auto Matching Job Failed', data: { error: err.message || err } })
    }
})
