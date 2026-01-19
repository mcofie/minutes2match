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
}

export interface CompatibilityResult {
    score: number // 0-100
    breakdown: {
        vibeMatch: number // 0-40 points
        valuesMatch: number // 0-30 points  
        lifestyleMatch: number // 0-20 points
        dealbreakers: number // 0-10 points (negative for conflicts)
    }
    strengths: string[]
    warnings: string[]
}

// Question dimension weights
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

// Compatible answers mapping (which answers go well together)
const COMPATIBILITY_MAP: Record<string, Record<string, string[]>> = {
    // Love Language - Perfect match if same, partial if complementary
    'love_language': {
        'Words of Affirmation - Tell me you love me 💬': ['Words of Affirmation - Tell me you love me 💬', 'Quality Time - Give me your undivided attention ⏰'],
        'Acts of Service - Do things for me 🛠️': ['Acts of Service - Do things for me 🛠️', 'Quality Time - Give me your undivided attention ⏰'],
        'Receiving Gifts - Surprise me with something 🎁': ['Receiving Gifts - Surprise me with something 🎁', 'Acts of Service - Do things for me 🛠️'],
        'Quality Time - Give me your undivided attention ⏰': ['Quality Time - Give me your undivided attention ⏰', 'Words of Affirmation - Tell me you love me 💬', 'Physical Touch - Hold me, hug me 🫂'],
        'Physical Touch - Hold me, hug me 🫂': ['Physical Touch - Hold me, hug me 🫂', 'Quality Time - Give me your undivided attention ⏰']
    },

    // Conflict Style - Similar styles work better
    'conflict_style': {
        'Talk it out immediately - Let\'s resolve this now 🗣️': ['Talk it out immediately - Let\'s resolve this now 🗣️', 'Find a quick compromise - Let\'s meet in the middle 🤝'],
        'Take space first - I need time to process 🧘': ['Take space first - I need time to process 🧘', 'Write it out - Texting is easier 📝'],
        'Find a quick compromise - Let\'s meet in the middle 🤝': ['Find a quick compromise - Let\'s meet in the middle 🤝', 'Talk it out immediately - Let\'s resolve this now 🗣️'],
        'Avoid confrontation - It\'ll blow over 😶': ['Avoid confrontation - It\'ll blow over 😶', 'Take space first - I need time to process 🧘'],
        'Write it out - Texting is easier 📝': ['Write it out - Texting is easier 📝', 'Take space first - I need time to process 🧘']
    },

    // Social Energy - Opposites don't attract here
    'social_energy': {
        'Full homebody - My couch is my bestie 🛋️': ['Full homebody - My couch is my bestie 🛋️', 'Mostly introverted - Small gatherings only 🏠'],
        'Mostly introverted - Small gatherings only 🏠': ['Mostly introverted - Small gatherings only 🏠', 'Balanced - Depends on my mood ⚖️', 'Full homebody - My couch is my bestie 🛋️'],
        'Balanced - Depends on my mood ⚖️': ['Balanced - Depends on my mood ⚖️', 'Mostly introverted - Small gatherings only 🏠', 'Mostly extroverted - I love being out 🌟'],
        'Mostly extroverted - I love being out 🌟': ['Mostly extroverted - I love being out 🌟', 'Balanced - Depends on my mood ⚖️', 'Life of the party - Where\'s the next event? 🦋'],
        'Life of the party - Where\'s the next event? 🦋': ['Life of the party - Where\'s the next event? 🦋', 'Mostly extroverted - I love being out 🌟']
    },

    // Life Priority - Similar priorities work best
    'life_priority': {
        'Building my career and wealth 💼': ['Building my career and wealth 💼', 'Making an impact in my community 🌱'],
        'Starting or growing a family 👨‍👩‍👧': ['Starting or growing a family 👨‍👩‍👧', 'Finding inner peace and balance 🧘'],
        'Traveling and experiencing life 🌍': ['Traveling and experiencing life 🌍', 'Finding inner peace and balance 🧘'],
        'Finding inner peace and balance 🧘': ['Finding inner peace and balance 🧘', 'Starting or growing a family 👨‍👩‍👧', 'Traveling and experiencing life 🌍'],
        'Making an impact in my community 🌱': ['Making an impact in my community 🌱', 'Building my career and wealth 💼', 'Finding inner peace and balance 🧘']
    },

    // Relationship Pace
    'relationship_pace': {
        'Take it slow - Let\'s be friends first 🐢': ['Take it slow - Let\'s be friends first 🐢', 'Go with the flow - See where it goes 🌊'],
        'Go with the flow - See where it goes 🌊': ['Go with the flow - See where it goes 🌊', 'Take it slow - Let\'s be friends first 🐢', 'Move with intention - I know what I want 🎯'],
        'Move with intention - I know what I want 🎯': ['Move with intention - I know what I want 🎯', 'Go with the flow - See where it goes 🌊', 'Move fast if it feels right - Life is short 🚀'],
        'Move fast if it feels right - Life is short 🚀': ['Move fast if it feels right - Life is short 🚀', 'Move with intention - I know what I want 🎯']
    }
}

// Dealbreaker combinations (genotype incompatibilities)
const GENOTYPE_INCOMPATIBLE: [string, string][] = [
    ['AS', 'AS'],
    ['AS', 'SS'],
    ['SS', 'SS'],
    ['SS', 'AC'],
    ['AS', 'AC']
]

export const useCompatibility = () => {

    /**
     * Calculate compatibility score between two users
     */
    const calculateCompatibility = (
        user1: UserProfile,
        user1Answers: VibeAnswer[],
        user2: UserProfile,
        user2Answers: VibeAnswer[]
    ): CompatibilityResult => {

        const breakdown = {
            vibeMatch: 0,
            valuesMatch: 0,
            lifestyleMatch: 0,
            dealbreakers: 0
        }

        const strengths: string[] = []
        const warnings: string[] = []

        // Convert answers to maps for easy lookup
        const answers1 = new Map(user1Answers.map(a => [a.question_key, a.answer]))
        const answers2 = new Map(user2Answers.map(a => [a.question_key, a.answer]))

        // 1. Calculate Vibe Match (Core Questions)
        let vibePoints = 0
        let maxVibePoints = 0

        for (const [key, compatMap] of Object.entries(COMPATIBILITY_MAP)) {
            const answer1 = answers1.get(key)
            const answer2 = answers2.get(key)

            if (answer1 && answer2) {
                const weight = DIMENSION_WEIGHTS[key] || 5
                maxVibePoints += weight

                // Exact match = 100% of weight
                if (answer1 === answer2) {
                    vibePoints += weight
                    strengths.push(getStrengthMessage(key, 'exact'))
                }
                // Compatible match = 70% of weight
                else if (compatMap[answer1]?.includes(answer2)) {
                    vibePoints += weight * 0.7
                    strengths.push(getStrengthMessage(key, 'compatible'))
                }
                // Incompatible = 0 points + warning
                else {
                    warnings.push(getWarningMessage(key, answer1, answer2))
                }
            }
        }

        breakdown.vibeMatch = maxVibePoints > 0 ? Math.round((vibePoints / maxVibePoints) * 40) : 20

        // 2. Check Intent Alignment (30 points max)
        if (user1.intent === user2.intent) {
            breakdown.valuesMatch = 30
            strengths.push('You both want the same thing 💍')
        } else if (
            (user1.intent === 'marriage' && user2.intent === 'serious') ||
            (user1.intent === 'serious' && user2.intent === 'marriage')
        ) {
            breakdown.valuesMatch = 24
            strengths.push('Similar relationship goals')
        } else if (user1.intent === 'casual' || user2.intent === 'casual') {
            breakdown.valuesMatch = 15
            warnings.push('Different relationship intentions')
        } else {
            breakdown.valuesMatch = 18
        }

        // 3. Lifestyle compatibility (location, religion) - 20 points max
        if (user1.location === user2.location) {
            breakdown.lifestyleMatch += 10
            strengths.push(`Both in ${user1.location} 📍`)
        } else {
            breakdown.lifestyleMatch += 5
        }

        if (user1.religion && user2.religion && user1.religion === user2.religion) {
            breakdown.lifestyleMatch += 10
            strengths.push('Same faith background 🙏')
        } else if (!user1.religion || !user2.religion) {
            breakdown.lifestyleMatch += 7
        } else {
            breakdown.lifestyleMatch += 3
            warnings.push('Different religious backgrounds')
        }

        // 4. Dealbreakers Check - Can reduce score by up to 10 points
        breakdown.dealbreakers = 10

        // Genotype compatibility check
        if (user1.genotype && user2.genotype) {
            const isIncompatible = GENOTYPE_INCOMPATIBLE.some(
                ([a, b]) =>
                    (user1.genotype === a && user2.genotype === b) ||
                    (user1.genotype === b && user2.genotype === a)
            )
            if (isIncompatible) {
                breakdown.dealbreakers = 0
                warnings.push('⚠️ Genotype incompatibility detected')
            }
        }

        // Age gap check (if birth dates available)
        if (user1.birth_date && user2.birth_date) {
            const age1 = calculateAge(user1.birth_date)
            const age2 = calculateAge(user2.birth_date)
            const ageGap = Math.abs(age1 - age2)

            if (ageGap > 10) {
                breakdown.dealbreakers -= 3
                warnings.push(`${ageGap} year age difference`)
            }
        }

        // Calculate final score
        const totalScore =
            breakdown.vibeMatch +
            breakdown.valuesMatch +
            breakdown.lifestyleMatch +
            breakdown.dealbreakers

        return {
            score: Math.max(0, Math.min(100, totalScore)),
            breakdown,
            strengths: strengths.slice(0, 5), // Top 5 strengths
            warnings: warnings.slice(0, 3) // Top 3 warnings
        }
    }

    /**
     * Get a quick compatibility tier (for display)
     */
    const getCompatibilityTier = (score: number): { tier: string; emoji: string; color: string } => {
        if (score >= 90) return { tier: 'Perfect Match', emoji: '💖', color: 'text-pink-500' }
        if (score >= 80) return { tier: 'Strong Match', emoji: '🔥', color: 'text-orange-500' }
        if (score >= 70) return { tier: 'Good Match', emoji: '✨', color: 'text-yellow-500' }
        if (score >= 60) return { tier: 'Decent Match', emoji: '👍', color: 'text-blue-500' }
        if (score >= 50) return { tier: 'Worth Exploring', emoji: '🤔', color: 'text-stone-500' }
        return { tier: 'Low Match', emoji: '😬', color: 'text-stone-400' }
    }

    // Helper functions
    const calculateAge = (birthDate: string): number => {
        const today = new Date()
        const birth = new Date(birthDate)
        let age = today.getFullYear() - birth.getFullYear()
        const monthDiff = today.getMonth() - birth.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--
        }
        return age
    }

    const getStrengthMessage = (key: string, type: 'exact' | 'compatible'): string => {
        const messages: Record<string, Record<string, string>> = {
            love_language: {
                exact: 'Same love language! 💕',
                compatible: 'Compatible love languages'
            },
            conflict_style: {
                exact: 'Same communication style! 🗣️',
                compatible: 'Compatible communication styles'
            },
            social_energy: {
                exact: 'Same social energy! 🎉',
                compatible: 'Balanced social preferences'
            },
            life_priority: {
                exact: 'Same life priorities! 🎯',
                compatible: 'Aligned life goals'
            },
            relationship_pace: {
                exact: 'Same relationship pace! 💫',
                compatible: 'Compatible pace expectations'
            }
        }
        return messages[key]?.[type] || 'Good match on this dimension'
    }

    const getWarningMessage = (key: string, answer1: string, answer2: string): string => {
        const warnings: Record<string, string> = {
            love_language: 'Different love languages - may need to learn each other\'s',
            conflict_style: 'Different conflict styles - communication is key',
            social_energy: 'Different social energy levels',
            life_priority: 'Different life priorities',
            relationship_pace: 'Different relationship pace expectations'
        }
        return warnings[key] || 'Difference in preferences'
    }

    return {
        calculateCompatibility,
        getCompatibilityTier,
        DIMENSION_WEIGHTS
    }
}
