/**
 * Persona Assignment Composable
 * Calculates dating persona based on Vibe Check answers
 */

export interface Persona {
    id: string
    name: string
    emoji: string
    description: string
    color: string
    keywords: string[]
}

export const personas: Record<string, Persona> = {
    power_player: {
        id: 'power_player',
        name: 'The Power Player',
        emoji: '👔',
        description: 'Ambitious and driven. You value success and look for a partner who matches your energy.',
        color: '#1a1a2e',
        keywords: ['career', 'networking', 'ambitious', 'success', 'driven']
    },
    romantic: {
        id: 'romantic',
        name: 'The Romantic',
        emoji: '💕',
        description: 'Heart on your sleeve. You believe in soulmates and deep emotional connections.',
        color: '#9F4A4A',
        keywords: ['love', 'connection', 'emotional', 'soulmate', 'feelings']
    },
    adventurer: {
        id: 'adventurer',
        name: 'The Adventurer',
        emoji: '🌍',
        description: 'Life is an adventure. You need someone who can keep up with your spontaneous spirit.',
        color: '#2E8B57',
        keywords: ['travel', 'spontaneous', 'thrill', 'adventure', 'explore']
    },
    intellectual: {
        id: 'intellectual',
        name: 'The Intellectual',
        emoji: '📚',
        description: 'Mind over matter. Deep conversations and intellectual compatibility are everything.',
        color: '#4A5568',
        keywords: ['knowledge', 'conversation', 'debate', 'curious', 'learning']
    },
    social_butterfly: {
        id: 'social_butterfly',
        name: 'The Social Butterfly',
        emoji: '🦋',
        description: 'Life of the party. You thrive in social settings and need someone equally outgoing.',
        color: '#D4AF37',
        keywords: ['party', 'friends', 'social', 'outgoing', 'fun']
    },
    homebody: {
        id: 'homebody',
        name: 'The Homebody',
        emoji: '🏠',
        description: 'Comfort is key. Netflix, home-cooked meals, and quality time with your person.',
        color: '#8B7355',
        keywords: ['home', 'cozy', 'comfort', 'relax', 'peaceful']
    }
}

export const usePersona = () => {
    // Cast to any to allow schema() method - Supabase types don't include it by default
    const supabase = useSupabaseClient() as any

    /**
     * Calculate persona based on user's vibe answers
     */
    const calculatePersona = (answers: Record<string, string>): Persona => {
        const scores: Record<string, number> = {}

        // Initialize scores
        Object.keys(personas).forEach(key => {
            scores[key] = 0
        })

        // Score each answer against persona keywords
        Object.values(answers).forEach(answer => {
            const lowerAnswer = answer.toLowerCase()

            Object.entries(personas).forEach(([personaKey, persona]) => {
                persona.keywords.forEach(keyword => {
                    if (lowerAnswer.includes(keyword)) {
                        scores[personaKey] += 1
                    }
                })
            })
        })

        // Find highest scoring persona
        let maxScore = 0
        let assignedPersona = 'romantic' // Default

        Object.entries(scores).forEach(([key, score]) => {
            if (score > maxScore) {
                maxScore = score
                assignedPersona = key
            }
        })

        return personas[assignedPersona]
    }

    /**
     * Get user's answers and calculate persona
     */
    const getPersonaForUser = async (userId: string): Promise<Persona | null> => {
        const { data: vibeAnswers, error } = await supabase
            .schema('m2m')
            .from('vibe_answers')
            .select('question_key, answer_value')
            .eq('user_id', userId)

        if (error || !vibeAnswers) {
            console.error('Failed to fetch vibe answers:', error)
            return null
        }

        const answers: Record<string, string> = {}
        vibeAnswers.forEach(({ question_key, answer_value }: { question_key: string, answer_value: string }) => {
            answers[question_key] = answer_value
        })

        return calculatePersona(answers)
    }

    /**
     * Save persona to user profile
     */
    const savePersona = async (userId: string, personaId: string) => {
        const { error } = await supabase
            .schema('m2m')
            .from('profiles')
            .update({ dating_persona: personaId })
            .eq('id', userId)

        if (error) {
            console.error('Failed to save persona:', error)
            throw new Error('Failed to save persona')
        }
    }

    return {
        personas,
        calculatePersona,
        getPersonaForUser,
        savePersona
    }
}
