/**
 * Auto Match Cron Endpoint
 * GET /api/cron/auto-match
 * 
 * Automatically finds and matches users with 70%+ match scores.
 * Uses the "Ultra-Tight" Compatibility Algorithm.
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
    occupation?: string
    badges?: string[]
    dealbreakers?: string[]
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
// COMPATIBILITY ENGINE (Ultra-Tight V2)
// ====================

const DIMENSION_WEIGHTS: Record<string, number> = {
    love_language: 10,
    conflict_style: 5,
    life_priority: 12,
    social_energy: 8,
    relationship_pace: 5
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
        'Full homebody - My couch is my bestie 🛋️': ['Full homebody - My couch is my bestie  Couch is my bestie 🛋️', 'Mostly introverted - Small gatherings only 🏠'],
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
    }
}

function calculateAge(birthDate: string): number {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) {
        age--
    }
    return age
}

function hasGenotypeRisk(g1: string, g2: string) {
    const riskTraits = ['AS', 'SS', 'AC', 'SC'];
    if (!riskTraits.includes(g1) || !riskTraits.includes(g2)) return false;
    if (g1 === 'SS' || g2 === 'SS') return true;
    return true;
}

function isCompatibleProfession(p1: string, p2: string) {
    const technology = ['tech', 'software', 'dev', 'engineer', 'it', 'cyber']
    const legalFinance = ['law', 'fin', 'bank', 'acc', 'analyst', 'audit']
    const health = ['med', 'nurse', 'doc', 'pharm']
    const check = (list: string[]) => list.some(k => p1.includes(k)) && list.some(k => p2.includes(k))
    return check(technology) || check(legalFinance) || check(health)
}

function calculateMatchScore(
    u1: UserProfile,
    u2: UserProfile,
    ans1List: VibeAnswer[],
    ans2List: VibeAnswer[]
): { score: number; reasons: string[]; warnings: string[] } {

    const strengths: string[] = []
    const warnings: string[] = []
    const breakdown = { vibeMatch: 0, goalsMatch: 0, lifestyleMatch: 0, maturityMatch: 0, interestMatch: 0 }
    let malus = 0

    // 1. HARD FILTER: GENDER & INTEREST
    const u1InterestedInU2 = !u1.interested_in || u1.interested_in === 'everyone' || u1.interested_in === u2.gender
    const u2InterestedInU1 = !u2.interested_in || u2.interested_in === 'everyone' || u2.interested_in === u1.gender

    if (!u1InterestedInU2 || !u2InterestedInU1) {
        return { score: 0, reasons: [], warnings: ['Gender Preference Mismatch'] }
    }

    const answers1 = new Map(ans1List.map(a => [a.question_key, a.answer]))
    const answers2 = new Map(ans2List.map(a => [a.question_key, a.answer]))

    // 2. VIBE MATCH (40 pts)
    let vibePoints = 0
    let maxVibeWeight = 0
    for (const [key, weight] of Object.entries(DIMENSION_WEIGHTS)) {
        const a1 = answers1.get(key)
        const a2 = answers2.get(key)
        if (a1 && a2) {
            maxVibeWeight += weight
            if (a1 === a2) vibePoints += weight
            else if (COMPATIBILITY_MAP[key]?.[a1]?.includes(a2)) vibePoints += weight * 0.5
        }
    }
    breakdown.vibeMatch = maxVibeWeight > 0 ? Math.round((vibePoints / maxVibeWeight) * 40) : 0
    if (breakdown.vibeMatch > 32) strengths.push('Deep Vibe Alignment ✨')

    // 3. GOALS & INTENT (20 pts)
    if (u1.intent && u2.intent) {
        if (u1.intent === u2.intent) {
            breakdown.goalsMatch += 12
            strengths.push('Shared Lifecycle Intent 💍')
        } else if ((u1.intent === 'marriage' && u2.intent === 'serious') || (u1.intent === 'serious' && u2.intent === 'marriage')) {
            breakdown.goalsMatch += 6
        } else {
            malus += 15
            warnings.push('Conflict in relationship goals')
        }
    }
    if (u1.religion && u2.religion && u1.religion === u2.religion) {
        breakdown.goalsMatch += 8
        strengths.push('Shared Belief System 🙏')
    }

    // 4. LIFESTYLE & CAREER (20 pts)
    if (u1.dating_persona && u2.dating_persona) {
        breakdown.lifestyleMatch += (u1.dating_persona === u2.dating_persona) ? 10 : 5
    }
    if (u1.occupation && u2.occupation) {
        const occ1 = u1.occupation.toLowerCase(), occ2 = u2.occupation.toLowerCase()
        if (occ1 === occ2) { breakdown.lifestyleMatch += 5; strengths.push('Same professional world 💼'); }
        else if (isCompatibleProfession(occ1, occ2)) { breakdown.lifestyleMatch += 3; strengths.push('Career Synergy'); }
    }
    if (u1.location && u2.location && u1.location === u2.location) {
        breakdown.lifestyleMatch += 5
        strengths.push(`Local Connection (${u1.location}) 📍`)
    }

    // 5. MATURITY & AGE (10 pts)
    if (u1.birth_date && u2.birth_date) {
        const age1 = calculateAge(u1.birth_date), age2 = calculateAge(u2.birth_date)
        const maleAge = u1.gender === 'male' ? age1 : age2
        const femaleAge = u1.gender === 'female' ? age1 : age2
        const ageGap = Math.abs(age1 - age2)

        if (maleAge > femaleAge) {
            breakdown.maturityMatch += 8
            if (maleAge - femaleAge <= 5) breakdown.maturityMatch += 2
        } else if (maleAge === femaleAge) {
            breakdown.maturityMatch += 6
        } else {
            malus += 20
            warnings.push('Age dynamic outside typical preference')
        }

        if ((u1.min_age && age2 < u1.min_age) || (u1.max_age && age2 > u1.max_age) ||
            (u2.min_age && age1 < u2.min_age) || (u2.max_age && age1 > u2.max_age)) {
            malus += 30
            warnings.push('Outside preferred age range')
        }
        if (ageGap > 10) { malus += 15; warnings.push('Significant age difference'); }
    }

    // 6. INTERESTS (10 pts)
    const b1 = Array.isArray(u1.badges) ? u1.badges : []
    const b2 = Array.isArray(u2.badges) ? u2.badges : []
    if (b1.length && b2.length) {
        const common = b1.filter(b => b2.includes(b))
        if (common.length >= 3) {
            breakdown.interestMatch = 10
            strengths.push('Numerous shared hobbies 🎨')
        } else if (common.length >= 1) {
            breakdown.interestMatch = 5
        }
    }

    // 7. DEALBREAKERS
    if (u1.genotype && u2.genotype && hasGenotypeRisk(u1.genotype, u2.genotype)) {
        malus += 80
        warnings.push('⚠️ Critical Genotype Incompatibility')
    }
    const db1 = Array.isArray(u1.dealbreakers) ? u1.dealbreakers : []
    const db2 = Array.isArray(u2.dealbreakers) ? u2.dealbreakers : []
    if (db1.length && b2.length && db1.some(d => b2.includes(d))) { malus += 50; warnings.push('Matched User A\'s dealbreaker'); }
    if (db2.length && b1.length && db2.some(d => b1.includes(d))) { malus += 50; warnings.push('Matched User B\'s dealbreaker'); }

    const rawScore = breakdown.vibeMatch + breakdown.goalsMatch + breakdown.lifestyleMatch + breakdown.maturityMatch + breakdown.interestMatch
    const finalScore = Math.max(0, Math.min(100, Math.round(rawScore - malus)))

    return {
        score: finalScore,
        reasons: strengths.slice(0, 5),
        warnings: warnings.slice(0, 3)
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

        const eligibleUsers = (users || []) as UserProfile[]
        const males = eligibleUsers.filter(u => u.gender === 'male')
        const females = eligibleUsers.filter(u => u.gender === 'female')

        const MIN_SCORE = 75 // Increased for cron for better quality auto-matches
        const potentialMatches: MatchResult[] = []
        const usedPairs = new Set<string>()

        const evaluatePair = (u1: any, u2: any) => {
            const pairKey = [u1.id, u2.id].sort().join('-')
            if (matchedPairs.has(`${u1.id}-${u2.id}`) || matchedPairs.has(`${u2.id}-${u1.id}`) || usedPairs.has(pairKey)) return

            const result = calculateMatchScore(u1, u2, userVibeAnswers.get(u1.id) || [], userVibeAnswers.get(u2.id) || [])

            if (result.score >= MIN_SCORE && result.warnings.length === 0) {
                potentialMatches.push({ user1: u1, user2: u2, score: result.score, reasons: result.reasons, warnings: result.warnings })
                usedPairs.add(pairKey)
            }
        }

        // Cross-gender primarily
        for (const male of males) {
            for (const female of females) {
                evaluatePair(male, female)
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
            match_warnings: match.warnings
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
                        `**Potential Matches (75%+):** ${potentialMatches.length}`,
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
