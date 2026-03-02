/**
 * Shot Hints — Mystery Question Pool
 * 
 * The shooter picks 3 questions from a randomly shuffled set of 6
 * and answers them as clues for the target to guess who's interested.
 */

export interface ShotQuestion {
    id: string
    emoji: string
    question: string
    placeholder: string
}

const QUESTION_POOL: ShotQuestion[] = [
    { id: 'zodiac', emoji: '♈', question: "What's my zodiac sign?", placeholder: 'e.g. Libra ♎' },
    { id: 'met', emoji: '📍', question: 'Where might you have seen me?', placeholder: 'e.g. At church, at work, on campus...' },
    { id: 'food', emoji: '🍕', question: "What's my favorite food?", placeholder: 'e.g. Jollof rice all day' },
    { id: 'song', emoji: '🎵', question: 'A song that describes me', placeholder: 'e.g. "Fall" by Davido' },
    { id: 'height', emoji: '📏', question: 'Am I taller or shorter than you?', placeholder: 'e.g. Definitely taller 😏' },
    { id: 'friends', emoji: '👯', question: 'How would my friends describe me?', placeholder: 'e.g. Funny, caring, a bit stubborn' },
    { id: 'color', emoji: '🎨', question: "What's my favorite color?", placeholder: 'e.g. Black everything' },
    { id: 'work', emoji: '💼', question: 'What do I do for a living?', placeholder: 'e.g. I work in tech' },
    { id: 'hobby', emoji: '🏃', question: "What's my favorite hobby?", placeholder: 'e.g. Gym and Netflix, obviously' },
    { id: 'joke', emoji: '😂', question: "Share a joke only I'd get", placeholder: 'e.g. Remember that time at...' },
    { id: 'movie', emoji: '🎬', question: "What's my all-time favorite movie?", placeholder: 'e.g. The Notebook (don\'t judge me)' },
    { id: 'superpower', emoji: '⚡', question: 'If I had a superpower, what would it be?', placeholder: 'e.g. Mind reading 🤫' },
    { id: 'travel', emoji: '✈️', question: "Where's my dream travel destination?", placeholder: 'e.g. Bali or Dubai' },
    { id: 'pet_peeve', emoji: '😤', question: "What's my biggest pet peeve?", placeholder: 'e.g. People who chew loudly' },
    { id: 'love_lang', emoji: '💝', question: "What's my love language?", placeholder: 'e.g. Quality time, no question' },
    { id: 'morning', emoji: '🌅', question: 'Am I a morning person or night owl?', placeholder: 'e.g. Night owl, 100%' },
    { id: 'nickname', emoji: '🏷️', question: 'Give me a nickname', placeholder: 'e.g. Mr. Smooth 😎' },
    { id: 'emoji', emoji: '😎', question: 'Which emoji best represents me?', placeholder: 'e.g. 🔥 obviously' },
    { id: 'drink', emoji: '🥤', question: "What's my go-to drink?", placeholder: 'e.g. Sobolo with lots of ice' },
    { id: 'animal', emoji: '🐾', question: 'If I were an animal, what would I be?', placeholder: 'e.g. A lion — bold and proud' },
]

/**
 * Get N random questions from the pool (shuffled)
 */
export function getRandomQuestions(count: number = 6): ShotQuestion[] {
    const shuffled = [...QUESTION_POOL].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
}

/**
 * Composable for managing shot hints in the form
 */
export function useShotHints() {
    // Generate 6 random questions for the shooter to choose from
    const availableQuestions = ref<ShotQuestion[]>(getRandomQuestions(6))

    // Track which questions the user has selected (max 3)
    const selectedHints = ref<{ question: ShotQuestion; answer: string }[]>([])

    const isSelected = (questionId: string) => {
        return selectedHints.value.some(h => h.question.id === questionId)
    }

    const toggleQuestion = (question: ShotQuestion) => {
        const existingIndex = selectedHints.value.findIndex(h => h.question.id === question.id)

        if (existingIndex !== -1) {
            // Deselect
            selectedHints.value.splice(existingIndex, 1)
        } else if (selectedHints.value.length < 3) {
            // Select (max 3)
            selectedHints.value.push({ question, answer: '' })
        }
    }

    const updateAnswer = (questionId: string, answer: string) => {
        const hint = selectedHints.value.find(h => h.question.id === questionId)
        if (hint) hint.answer = answer
    }

    const reshuffleQuestions = () => {
        availableQuestions.value = getRandomQuestions(6)
        selectedHints.value = []
    }

    const isComplete = computed(() => {
        return selectedHints.value.length === 3 && selectedHints.value.every(h => h.answer.trim().length > 0)
    })

    // Format hints for API submission
    const formattedHints = computed(() => {
        return selectedHints.value.map(h => ({
            question: h.question.question,
            answer: h.answer.trim(),
            emoji: h.question.emoji,
            id: h.question.id
        }))
    })

    return {
        availableQuestions,
        selectedHints,
        isSelected,
        toggleQuestion,
        updateAnswer,
        reshuffleQuestions,
        isComplete,
        formattedHints
    }
}
