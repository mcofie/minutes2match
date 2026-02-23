/**
 * Compatibility Scoring Algorithm
 * 
 * Calculates match scores based on vibe check answers,
 * profile data, and weighted dimensions.
 */

export interface VibeAnswer {
    question_key: string
    answer: string
}

export interface UserProfile {
    id: string
    gender: 'male' | 'female'
    interested_in: 'male' | 'female' | 'everyone'
    intent: string
    location: string
    religion?: string
    genotype?: string
    birth_date?: string
    dating_persona?: string
    occupation?: string
    badges?: string[]
    dealbreakers?: string[]
    min_age?: number
    max_age?: number
}

export interface CompatibilityResult {
    score: number // 0-100
    breakdown: {
        vibeMatch: number // 0-40 points
        goalsMatch: number // 0-20 points  
        lifestyleMatch: number // 0-20 points
        maturityMatch: number // 0-10 points
        interestMatch: number // 0-10 points
    }
    strengths: string[]
    warnings: string[]
}

// Question dimension weights for Vibe Match (Total should normalize to 40)
const DIMENSION_WEIGHTS: Record<string, number> = {
    love_language: 10,
    conflict_style: 5, // Lowered slightly to boost priorities
    life_priority: 12, // Increased - fundamental alignment
    social_energy: 8,  // Important for day-to-day sync
    relationship_pace: 5
}

// Compatible answers mapping
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
    }
}

const hasGenotypeRisk = (g1: string, g2: string) => {
    const riskTraits = ['AS', 'SS', 'AC', 'SC'];
    if (!riskTraits.includes(g1) || !riskTraits.includes(g2)) return false;

    // SS is critical risk with anyone carrying a trait
    if (g1 === 'SS' || g2 === 'SS') return true;

    // AS + AS, AS + AC etc are risky
    return true;
}

export const useCompatibility = () => {

    const calculateCompatibility = (
        u1: UserProfile,
        ans1List: VibeAnswer[],
        u2: UserProfile,
        ans2List: VibeAnswer[]
    ): CompatibilityResult => {

        const strengths: string[] = []
        const warnings: string[] = []
        const breakdown = { vibeMatch: 0, goalsMatch: 0, lifestyleMatch: 0, maturityMatch: 0, interestMatch: 0 }
        let malus = 0

        // 1. HARD FILTER: GENDER & INTEREST (Hard 0 if mismatch)
        const u1InterestedInU2 = !u1.interested_in || u1.interested_in === 'everyone' || u1.interested_in === u2.gender
        const u2InterestedInU1 = !u2.interested_in || u2.interested_in === 'everyone' || u2.interested_in === u1.gender

        if (!u1InterestedInU2 || !u2InterestedInU1) {
            return { score: 0, breakdown, strengths: [], warnings: ['Gender Preference Mismatch'] }
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
                if (a1 === a2) {
                    vibePoints += weight
                } else if (COMPATIBILITY_MAP[key]?.[a1]?.includes(a2)) {
                    vibePoints += weight * 0.5 // Lowered partial credit for tighter results
                }
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
                malus += 15 // Heavy penalty for mismatching deep intent
                warnings.push('Conflict in relationship goals')
            }
        }

        // Religion
        if (u1.religion && u2.religion && u1.religion === u2.religion) {
            breakdown.goalsMatch += 8
            strengths.push('Shared Belief System 🙏')
        }

        // 4. LIFESTYLE & CAREER SYNERGY (20 pts)
        // Persona 
        if (u1.dating_persona && u2.dating_persona) {
            if (u1.dating_persona === u2.dating_persona) {
                breakdown.lifestyleMatch += 10
            } else {
                breakdown.lifestyleMatch += 5
            }
        }

        // Career Synergy
        if (u1.occupation && u2.occupation) {
            const occ1 = u1.occupation.toLowerCase()
            const occ2 = u2.occupation.toLowerCase()
            if (occ1 === occ2) {
                breakdown.lifestyleMatch += 5
                strengths.push('Same professional world 💼')
            } else if (isCompatibleProfession(occ1, occ2)) {
                breakdown.lifestyleMatch += 3
                strengths.push('Career Synergy')
            }
        }

        // Distance / Location 
        if (u1.location && u2.location && u1.location === u2.location) {
            breakdown.lifestyleMatch += 5
            strengths.push(`Local Connection (${u1.location}) 📍`)
        }

        // 5. MATURITY & AGE (10 pts)
        if (u1.birth_date && u2.birth_date) {
            const age1 = calculateAge(u1.birth_date)
            const age2 = calculateAge(u2.birth_date)
            const ageGap = Math.abs(age1 - age2)

            const maleAge = u1.gender === 'male' ? age1 : age2
            const femaleAge = u1.gender === 'female' ? age1 : age2

            // Tight rule: male preference to be older
            if (maleAge > femaleAge) {
                breakdown.maturityMatch += 8
                if (maleAge - femaleAge <= 5) breakdown.maturityMatch += 2
            } else if (maleAge === femaleAge) {
                breakdown.maturityMatch += 6
            } else {
                malus += 20 // Stricter penalty for male being younger
                warnings.push('Age dynamic outside typical preference')
            }

            // Strict cross-check of age range settings
            if (checkAgeViolation(u1, age2) || checkAgeViolation(u2, age1)) {
                malus += 30
                warnings.push('Outside preferred age range')
            }

            if (ageGap > 10) {
                malus += 15
                warnings.push('Significant age difference')
            }
        }

        // 6. INTEREST SYNERGY (10 pts)
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

        // 7. DEALBREAKERS (HARD PENALTIES)
        if (u1.genotype && u2.genotype) {
            if (hasGenotypeRisk(u1.genotype, u2.genotype)) {
                malus += 80 // Critical risk 
                warnings.push('⚠️ Critical Genotype Incompatibility')
            }
        }

        // Cross-referencing explicit dealbreakers
        const db1 = Array.isArray(u1.dealbreakers) ? u1.dealbreakers : []
        const db2 = Array.isArray(u2.dealbreakers) ? u2.dealbreakers : []

        if (db1.length && b2.length) {
            if (db1.some(d => b2.includes(d))) {
                malus += 50
                warnings.push('Matched User A\'s dealbreaker')
            }
        }
        if (db2.length && b1.length) {
            if (db2.some(d => b1.includes(d))) {
                malus += 50
                warnings.push('Matched User B\'s dealbreaker')
            }
        }

        const rawScore = breakdown.vibeMatch + breakdown.goalsMatch + breakdown.lifestyleMatch + breakdown.maturityMatch + breakdown.interestMatch
        const finalScore = Math.max(0, Math.min(100, Math.round(rawScore - malus)))

        return {
            score: finalScore,
            breakdown,
            strengths: strengths.slice(0, 5),
            warnings: warnings.slice(0, 3)
        }
    }

    const calculateAge = (birthDate: string): number => {
        const today = new Date()
        const birth = new Date(birthDate)
        let age = today.getFullYear() - birth.getFullYear()
        if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) {
            age--
        }
        return age
    }

    const checkAgeViolation = (user: UserProfile, actualAge: number) => {
        if (user.min_age && actualAge < user.min_age) return true
        if (user.max_age && actualAge > user.max_age) return true
        return false
    }

    const isCompatibleProfession = (p1: string, p2: string) => {
        const technology = ['tech', 'software', 'dev', 'engineer', 'it', 'cyber']
        const legalFinance = ['law', 'fin', 'bank', 'acc', 'analyst', 'audit']
        const health = ['med', 'nurse', 'doc', 'pharm']

        const check = (list: string[]) => list.some(k => p1.includes(k)) && list.some(k => p2.includes(k))
        return check(technology) || check(legalFinance) || check(health)
    }

    const getCompatibilityTier = (score: number) => {
        if (score >= 90) return { tier: 'Divine Connection', emoji: '✨', color: 'text-pink-600' }
        if (score >= 80) return { tier: 'High Affinity', emoji: '🔥', color: 'text-rose-500' }
        if (score >= 70) return { tier: 'Strong Potential', emoji: '🌟', color: 'text-orange-500' }
        if (score >= 60) return { tier: 'Good Alignment', emoji: '👍', color: 'text-blue-500' }
        if (score >= 50) return { tier: 'Explorable', emoji: '🤝', color: 'text-stone-500' }
        return { tier: 'Challenging Match', emoji: '⚠️', color: 'text-stone-400' }
    }

    return {
        calculateCompatibility,
        getCompatibilityTier
    }
}
