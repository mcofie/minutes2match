/**
 * Auto Match Cron Endpoint
 * GET /api/cron/auto-match
 * 
 * Automatically finds and matches users with 70%+ match scores.
 * Rules:
 * - Only specific user pairs that are already matched are excluded (users CAN have multiple matches)
 * - Male's age must be >= female's age
 * - All existing matching algorithm rules apply
 * 
 * Sends a detailed report to Discord when complete.
 * 
 * Call via: https://cron-job.org/en/ with Authorization: Bearer <CRON_SECRET>
 */

import { createClient } from '@supabase/supabase-js'
import { notifyDiscord, DiscordColors } from '~/server/utils/discord'

// ====================
// TYPES & INTERFACES
// ====================

interface VibeAnswer {
    question_key: string
    answer: string
}

interface UserProfile {
    id: string
    display_name: string
    gender: 'male' | 'female'
    interested_in?: 'male' | 'female' | 'everyone'
    intent?: string
    location?: string
    religion?: string
    genotype?: string
    birth_date?: string
    phone?: string
    is_verified?: boolean
    dating_persona?: string
    dealbreakers?: Record<string, string[]>
    min_age?: number
    max_age?: number
}

interface MatchResult {
    user1: UserProfile
    user2: UserProfile
    score: number
    reasons: string[]
    warnings: string[]
}

// ====================
// COMPATIBILITY LOGIC (Server-side version of useCompatibility)
// ====================

const DIMENSION_WEIGHTS: Record<string, number> = {
    love_language: 15,
    communication: 15,
    life_goals: 12,
    social: 10,
    pace: 8,
    lifestyle: 5,
    dealbreakers: 10,
    finance: 5,
    ambition: 5,
    dating: 3,
    affection: 3,
    culture: 2
}

const COMPATIBILITY_MAP: Record<string, Record<string, string[]>> = {
    'love_language': {
        'Words of Affirmation - Tell me you love me 💬': ['Words of Affirmation - Tell me you love me 💬', 'Quality Time - Give me your undivided attention ⏰'],
        'Acts of Service - Do things for me 🛠️': ['Acts of Service - Do things for me 🛠️', 'Quality Time - Give me your undivided attention ⏰'],
        'Receiving Gifts - Surprise me with something 🎁': ['Receiving Gifts - Surprise me with something 🎁', 'Acts of Service - Do things for me 🛠️'],
        'Quality Time - Give me your undivided attention ⏰': ['Quality Time - Give me your undivided attention ⏰', 'Words of Affirmation - Tell me you love me 💬', 'Physical Touch - Hold me, hug me 🫂'],
        'Physical Touch - Hold me, hug me 🫂': ['Physical Touch - Hold me, hug me 🫂', 'Quality Time - Give me your undivided attention ⏰']
    },
    'conflict_style': {
        'Talk it out immediately - Let\'s resolve this now 🗣️': ['Talk it out immediately - Let\'s resolve this now 🗣️', 'Find a quick compromise - Let\'s meet in the middle 🤝'],
        'Take space first - I need time to process 🧘': ['Take space first - I need time to process 🧘', 'Write it out - Texting is easier 📝'],
        'Find a quick compromise - Let\'s meet in the middle 🤝': ['Find a quick compromise - Let\'s meet in the middle 🤝', 'Talk it out immediately - Let\'s resolve this now 🗣️'],
        'Avoid confrontation - It\'ll blow over 😶': ['Avoid confrontation - It\'ll blow over 😶', 'Take space first - I need time to process 🧘'],
        'Write it out - Texting is easier 📝': ['Write it out - Texting is easier 📝', 'Take space first - I need time to process 🧘']
    },
    'social_energy': {
        'Full homebody - My couch is my bestie 🛋️': ['Full homebody - My couch is my bestie 🛋️', 'Mostly introverted - Small gatherings only 🏠'],
        'Mostly introverted - Small gatherings only 🏠': ['Mostly introverted - Small gatherings only 🏠', 'Balanced - Depends on my mood ⚖️', 'Full homebody - My couch is my bestie 🛋️'],
        'Balanced - Depends on my mood ⚖️': ['Balanced - Depends on my mood ⚖️', 'Mostly introverted - Small gatherings only 🏠', 'Mostly extroverted - I love being out 🌟'],
        'Mostly extroverted - I love being out 🌟': ['Mostly extroverted - I love being out 🌟', 'Balanced - Depends on my mood ⚖️', 'Life of the party - Where\'s the next event? 🦋'],
        'Life of the party - Where\'s the next event? 🦋': ['Life of the party - Where\'s the next event? 🦋', 'Mostly extroverted - I love being out 🌟']
    },
    'life_priority': {
        'Building my career and wealth 💼': ['Building my career and wealth 💼', 'Making an impact in my community 🌱'],
        'Starting or growing a family 👨‍👩‍👧': ['Starting or growing a family 👨‍👩‍👧', 'Finding inner peace and balance 🧘'],
        'Traveling and experiencing life 🌍': ['Traveling and experiencing life 🌍', 'Finding inner peace and balance 🧘'],
        'Finding inner peace and balance 🧘': ['Finding inner peace and balance 🧘', 'Starting or growing a family 👨‍👩‍👧', 'Traveling and experiencing life 🌍'],
        'Making an impact in my community 🌱': ['Making an impact in my community 🌱', 'Building my career and wealth 💼', 'Finding inner peace and balance 🧘']
    },
    'relationship_pace': {
        'Take it slow - Let\'s be friends first 🐢': ['Take it slow - Let\'s be friends first 🐢', 'Go with the flow - See where it goes 🌊'],
        'Go with the flow - See where it goes 🌊': ['Go with the flow - See where it goes 🌊', 'Take it slow - Let\'s be friends first 🐢', 'Move with intention - I know what I want 🎯'],
        'Move with intention - I know what I want 🎯': ['Move with intention - I know what I want 🎯', 'Go with the flow - See where it goes 🌊', 'Move fast if it feels right - Life is short 🚀'],
        'Move fast if it feels right - Life is short 🚀': ['Move fast if it feels right - Life is short 🚀', 'Move with intention - I know what I want 🎯']
    }
}

const PERSONA_COMPATIBILITY: Record<string, string[]> = {
    power_player: ['power_player', 'intellectual'],
    romantic: ['romantic', 'adventurer'],
    adventurer: ['adventurer', 'social_butterfly', 'romantic'],
    intellectual: ['intellectual', 'power_player', 'homebody'],
    social_butterfly: ['social_butterfly', 'adventurer'],
    homebody: ['homebody', 'romantic', 'intellectual']
}

// ====================
// HELPER FUNCTIONS
// ====================

function calculateAge(birthDate: string): number {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--
    }
    return age
}

function calculateVibeCompatibility(
    user1Answers: VibeAnswer[],
    user2Answers: VibeAnswer[]
): { vibeScore: number; strengths: string[]; warnings: string[] } {
    const answers1 = new Map(user1Answers.map(a => [a.question_key, a.answer]))
    const answers2 = new Map(user2Answers.map(a => [a.question_key, a.answer]))

    let vibePoints = 0
    let maxVibePoints = 0
    const strengths: string[] = []
    const warnings: string[] = []

    for (const [key, compatMap] of Object.entries(COMPATIBILITY_MAP)) {
        const answer1 = answers1.get(key)
        const answer2 = answers2.get(key)

        if (answer1 && answer2) {
            const weight = DIMENSION_WEIGHTS[key] || 5
            maxVibePoints += weight

            if (answer1 === answer2) {
                vibePoints += weight
                strengths.push(getStrengthMessage(key, 'exact'))
            } else if (compatMap[answer1]?.includes(answer2)) {
                vibePoints += weight * 0.7
                strengths.push(getStrengthMessage(key, 'compatible'))
            } else {
                warnings.push(getWarningMessage(key))
            }
        }
    }

    const vibeScore = maxVibePoints > 0 ? Math.round((vibePoints / maxVibePoints) * 100) : 50

    return { vibeScore, strengths: strengths.slice(0, 3), warnings: warnings.slice(0, 2) }
}

function getStrengthMessage(key: string, type: 'exact' | 'compatible'): string {
    const messages: Record<string, Record<string, string>> = {
        love_language: { exact: 'Same love language! 💕', compatible: 'Compatible love languages' },
        conflict_style: { exact: 'Same communication style! 🗣️', compatible: 'Compatible communication styles' },
        social_energy: { exact: 'Same social energy! 🎉', compatible: 'Balanced social preferences' },
        life_priority: { exact: 'Same life priorities! 🎯', compatible: 'Aligned life goals' },
        relationship_pace: { exact: 'Same relationship pace! 💫', compatible: 'Compatible pace expectations' }
    }
    return messages[key]?.[type] || 'Good match on this dimension'
}

function getWarningMessage(key: string): string {
    const warnings: Record<string, string> = {
        love_language: 'Different love languages',
        conflict_style: 'Different conflict styles',
        social_energy: 'Different social energy levels',
        life_priority: 'Different life priorities',
        relationship_pace: 'Different relationship pace'
    }
    return warnings[key] || 'Different preferences'
}

function calculateMatchScore(
    u1: UserProfile,
    u2: UserProfile,
    u1Answers: VibeAnswer[],
    u2Answers: VibeAnswer[]
): { score: number; reasons: string[]; warnings: string[] } {
    let score = 0
    const reasons: string[] = []
    const warnings: string[] = []

    // 1. Gender / Interest Logic (Mutual)
    const u1WantsU2 = !u1.interested_in || u1.interested_in === 'everyone' || u1.interested_in === u2.gender
    const u2WantsU1 = !u2.interested_in || u2.interested_in === 'everyone' || u2.interested_in === u1.gender

    if (!u1WantsU2 || !u2WantsU1) {
        return { score: 0, reasons: [], warnings: ['Gender Mismatch'] }
    }

    // 2. DEALBREAKER CHECKS
    const u1Dealbreakers = u1.dealbreakers || {}
    const u2Dealbreakers = u2.dealbreakers || {}
    const age1 = u1.birth_date ? calculateAge(u1.birth_date) : 25
    const age2 = u2.birth_date ? calculateAge(u2.birth_date) : 25

    // Check genotype dealbreakers
    if (u1Dealbreakers.genotype?.length && u2.genotype && !u1Dealbreakers.genotype.includes(u2.genotype)) {
        return { score: 0, reasons: [], warnings: ['Dealbreaker: Genotype'] }
    }
    if (u2Dealbreakers.genotype?.length && u1.genotype && !u2Dealbreakers.genotype.includes(u1.genotype)) {
        return { score: 0, reasons: [], warnings: ['Dealbreaker: Genotype'] }
    }

    // Check intent dealbreakers
    if (u1Dealbreakers.intent?.length && u2.intent && !u1Dealbreakers.intent.includes(u2.intent)) {
        return { score: 0, reasons: [], warnings: ['Dealbreaker: Intent'] }
    }
    if (u2Dealbreakers.intent?.length && u1.intent && !u2Dealbreakers.intent.includes(u1.intent)) {
        return { score: 0, reasons: [], warnings: ['Dealbreaker: Intent'] }
    }

    // Check religion dealbreakers
    if (u1Dealbreakers.religion?.length && u2.religion && !u1Dealbreakers.religion.includes(u2.religion)) {
        return { score: 0, reasons: [], warnings: ['Dealbreaker: Religion'] }
    }
    if (u2Dealbreakers.religion?.length && u1.religion && !u2Dealbreakers.religion.includes(u1.religion)) {
        return { score: 0, reasons: [], warnings: ['Dealbreaker: Religion'] }
    }

    // Age range dealbreakers
    if (u1.min_age && u1.max_age && (age2 < u1.min_age || age2 > u1.max_age)) {
        return { score: 0, reasons: [], warnings: ['Dealbreaker: Age Range'] }
    }
    if (u2.min_age && u2.max_age && (age1 < u2.min_age || age1 > u2.max_age)) {
        return { score: 0, reasons: [], warnings: ['Dealbreaker: Age Range'] }
    }

    // Opposite gender bonus
    if (u1.gender !== u2.gender) score += 15

    // 3. AGE RULE - Male's age must be >= female's age
    // This is a KEY requirement from the user
    let maleAge: number, femaleAge: number
    if (u1.gender === 'male' && u2.gender === 'female') {
        maleAge = age1
        femaleAge = age2
    } else if (u1.gender === 'female' && u2.gender === 'male') {
        maleAge = age2
        femaleAge = age1
    } else {
        // Same gender - skip this check
        maleAge = femaleAge = age1
    }

    if (u1.gender !== u2.gender && maleAge < femaleAge) {
        // Male is younger than female - skip this match
        return { score: 0, reasons: [], warnings: ['Age Rule: Male must be older or same age'] }
    }

    // Age gap scoring
    const gap = Math.abs(age1 - age2)
    if (gap <= 3) { score += 10; reasons.push('Close Age') }
    else if (gap <= 7) { score += 5 }
    else if (gap > 10) { score -= 5 }

    // 4. Genotype Compatibility (CRITICAL)
    if (u1.genotype && u2.genotype) {
        const g1 = u1.genotype
        const g2 = u2.genotype

        if ((g1 === 'SS' && g2 !== 'AA') || (g2 === 'SS' && g1 !== 'AA')) {
            score -= 100
            warnings.push('Medical Risk (SS)')
        } else if ((g1.includes('S') || g1.includes('C')) && (g2.includes('S') || g2.includes('C'))) {
            score -= 40
            warnings.push('Genotype Risk')
        } else if (g1 === 'AA' || g2 === 'AA') {
            score += 5
            reasons.push('Safe Genotype')
        }
    }

    // 5. Intent (Goals)
    if (u1.intent && u2.intent) {
        const serious = ['marriage', 'serious']
        const casual = ['casual', 'friendship']

        if (u1.intent === u2.intent) {
            score += 15
            reasons.push('Same Goals')
        } else if (serious.includes(u1.intent) && serious.includes(u2.intent)) {
            score += 8
        } else if ((serious.includes(u1.intent) && casual.includes(u2.intent)) ||
            (casual.includes(u1.intent) && serious.includes(u2.intent))) {
            score -= 20
            warnings.push('Mismatched Goals')
        }
    }

    // 6. Persona Synergy
    if (u1.dating_persona && u2.dating_persona) {
        const p1 = u1.dating_persona
        const p2 = u2.dating_persona
        if (PERSONA_COMPATIBILITY[p1]?.includes(p2) || PERSONA_COMPATIBILITY[p2]?.includes(p1)) {
            score += 10
            reasons.push('Great Vibe')
        } else if (p1 === p2) {
            score += 5
            reasons.push('Similar Vibe')
        }
    }

    // 7. Religion
    if (u1.religion && u2.religion && u1.religion !== 'None' && u2.religion !== 'None') {
        if (u1.religion === u2.religion) {
            score += 8
            reasons.push('Shared Faith')
        }
    }

    // 8. Location
    if (u1.location && u2.location && u1.location === u2.location) {
        score += 7
        reasons.push('Same City')
    }

    // 9. Vibe Answers Compatibility (up to 30 bonus points)
    if (u1Answers.length > 0 && u2Answers.length > 0) {
        const vibeResult = calculateVibeCompatibility(u1Answers, u2Answers)
        const vibeBonus = Math.round(vibeResult.vibeScore * 0.3)
        score += vibeBonus

        if (vibeResult.strengths.length > 0) {
            reasons.push(...vibeResult.strengths.slice(0, 2))
        }
        if (vibeResult.warnings.length > 0) {
            warnings.push(...vibeResult.warnings.slice(0, 1))
        }

        if (vibeBonus >= 20) {
            reasons.unshift('💕 High Vibe Match')
        } else if (vibeBonus >= 10) {
            reasons.unshift('✨ Good Vibe Match')
        }
    }

    return {
        score: Math.max(0, Math.min(score, 100)),
        reasons: reasons.slice(0, 5),
        warnings: warnings.slice(0, 3)
    }
}

// ====================
// MAIN HANDLER
// ====================

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const startTime = Date.now()

    // Simple API key check for cron security
    const authHeader = getHeader(event, 'authorization')
    if (authHeader !== `Bearer ${config.cronSecret}`) {
        console.log('[AutoMatch Cron] Unauthorized access attempt')
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = config.supabaseServiceKey

    if (!supabaseUrl || !supabaseServiceKey) {
        throw createError({ statusCode: 500, message: 'Server configuration error' })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        db: { schema: 'm2m' }
    })

    console.log('[AutoMatch Cron] Starting automatic matching job...')

    try {
        // 1. Fetch all verified users
        const { data: users, error: usersError } = await supabase
            .from('profiles')
            .select('*')
            .eq('is_verified', true)

        if (usersError) {
            console.error('[AutoMatch Cron] Failed to fetch users:', usersError)
            throw createError({ statusCode: 500, message: 'Failed to fetch users' })
        }

        console.log(`[AutoMatch Cron] Found ${users?.length || 0} verified users`)

        // 2. Fetch existing matches to exclude
        const { data: existingMatches, error: matchError } = await supabase
            .from('matches')
            .select('user_1_id, user_2_id')

        if (matchError) {
            console.error('[AutoMatch Cron] Failed to fetch existing matches:', matchError)
            throw createError({ statusCode: 500, message: 'Failed to fetch matches' })
        }

        const matchedPairs = new Set<string>()

        existingMatches?.forEach(m => {
            // Track both directions of the pair
            matchedPairs.add(`${m.user_1_id}-${m.user_2_id}`)
            matchedPairs.add(`${m.user_2_id}-${m.user_1_id}`)
        })

        console.log(`[AutoMatch Cron] Found ${existingMatches?.length || 0} existing match pairs`)

        // 3. Fetch all vibe answers
        const { data: vibeAnswers, error: vibeError } = await supabase
            .from('vibe_answers')
            .select('user_id, question_key, answer')

        if (vibeError) {
            console.error('[AutoMatch Cron] Failed to fetch vibe answers:', vibeError)
        }

        const userVibeAnswers = new Map<string, VibeAnswer[]>()
        vibeAnswers?.forEach((row: any) => {
            const existing = userVibeAnswers.get(row.user_id) || []
            existing.push({ question_key: row.question_key, answer: row.answer })
            userVibeAnswers.set(row.user_id, existing)
        })

        // 4. All verified users are eligible - we only exclude specific pairs that already exist
        const eligibleUsers = users || []
        console.log(`[AutoMatch Cron] ${eligibleUsers.length} verified users available for matching`)

        // 5. Find all potential matches with 70%+ score
        const MIN_SCORE = 70
        const potentialMatches: MatchResult[] = []
        const usedPairs = new Set<string>()

        for (let i = 0; i < eligibleUsers.length; i++) {
            for (let j = i + 1; j < eligibleUsers.length; j++) {
                const u1 = eligibleUsers[i] as UserProfile
                const u2 = eligibleUsers[j] as UserProfile

                // Skip if already matched or in this batch
                const pairKey = [u1.id, u2.id].sort().join('-')
                if (matchedPairs.has(`${u1.id}-${u2.id}`) || usedPairs.has(pairKey)) {
                    continue
                }

                const u1Answers = userVibeAnswers.get(u1.id) || []
                const u2Answers = userVibeAnswers.get(u2.id) || []

                const result = calculateMatchScore(u1, u2, u1Answers, u2Answers)

                if (result.score >= MIN_SCORE && result.warnings.length === 0) {
                    potentialMatches.push({
                        user1: u1,
                        user2: u2,
                        score: result.score,
                        reasons: result.reasons,
                        warnings: result.warnings
                    })
                }
            }
        }

        // Sort by score descending
        potentialMatches.sort((a, b) => b.score - a.score)

        console.log(`[AutoMatch Cron] Found ${potentialMatches.length} potential matches with 70%+ score`)

        // 6. Greedy selection - ensure each user is only matched once
        const selectedMatches: MatchResult[] = []
        const usedUsers = new Set<string>()

        for (const match of potentialMatches) {
            const u1Id = match.user1.id
            const u2Id = match.user2.id

            if (!usedUsers.has(u1Id) && !usedUsers.has(u2Id)) {
                selectedMatches.push(match)
                usedUsers.add(u1Id)
                usedUsers.add(u2Id)
            }
        }

        console.log(`[AutoMatch Cron] Selected ${selectedMatches.length} matches after deduplication`)

        // 7. Create the matches in database
        const UNLOCK_PRICE = 15 // Default unlock price
        let createdCount = 0
        const createdMatches: { user1: string; user2: string; score: number }[] = []

        for (const match of selectedMatches) {
            const { error: insertError } = await supabase
                .from('matches')
                .insert({
                    user_1_id: match.user1.id,
                    user_2_id: match.user2.id,
                    unlock_price: UNLOCK_PRICE,
                    status: 'pending_payment',
                    match_score: match.score,
                    match_reasons: match.reasons,
                    match_warnings: match.warnings
                })

            if (!insertError) {
                createdCount++
                createdMatches.push({
                    user1: match.user1.display_name || 'Unknown',
                    user2: match.user2.display_name || 'Unknown',
                    score: match.score
                })
            } else {
                console.error(`[AutoMatch Cron] Failed to insert match:`, insertError)
            }
        }

        const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2)

        // 8. Send Discord report
        const matchDetailsText = createdMatches.length > 0
            ? createdMatches.slice(0, 10).map((m, i) => `${i + 1}. **${m.user1}** ↔ **${m.user2}** (${m.score}%)`).join('\n')
            : '_No matches created_'

        const moreText = createdMatches.length > 10
            ? `\n_...and ${createdMatches.length - 10} more_`
            : ''

        await notifyDiscord({
            title: '🤖 Auto Matchmaker Report',
            description: `Automatic matching job completed successfully.`,
            color: createdCount > 0 ? DiscordColors.match : DiscordColors.info,
            fields: [
                {
                    name: '📊 Statistics', value: [
                        `**Total Users Checked:** ${users?.length || 0}`,
                        `**Eligible Users:** ${eligibleUsers.length}`,
                        `**Potential Matches (70%+):** ${potentialMatches.length}`,
                        `**Matches Created:** ${createdCount}`
                    ].join('\n'), inline: false
                },
                { name: '💕 New Matches', value: matchDetailsText + moreText, inline: false },
                { name: '⏱️ Runtime', value: `${elapsedTime} seconds`, inline: true }
            ],
            footer: `Auto Match Cron Job • ${new Date().toISOString()}`
        })

        console.log(`[AutoMatch Cron] Job completed: ${createdCount} matches created in ${elapsedTime}s`)

        return {
            success: true,
            summary: {
                totalUsers: users?.length || 0,
                eligibleUsers: eligibleUsers.length,
                potentialMatches: potentialMatches.length,
                matchesCreated: createdCount,
                runtime: `${elapsedTime}s`
            },
            matches: createdMatches
        }

    } catch (err: any) {
        console.error('[AutoMatch Cron] Error:', err)

        // Send error notification to Discord
        await notifyDiscord({
            title: '🚨 Auto Matchmaker Error',
            description: err.message || 'Unknown error occurred',
            color: DiscordColors.error
        })

        throw createError({
            statusCode: 500,
            message: err.message || 'Auto matching failed'
        })
    }
})
