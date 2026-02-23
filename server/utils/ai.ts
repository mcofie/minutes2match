import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * AI Utility for Minutes 2 Match
 * Currently using Google's Gemini 1.5 Flash for speed/efficiency.
 */

export const getGeminiModel = () => {
    const config = useRuntimeConfig()
    const apiKey = config.geminiApiKey

    if (!apiKey) {
        console.warn('[Gemini] GEMINI_API_KEY is missing from runtime config. Check your .env or nuxt.config.ts')
        return null
    }

    console.log('[Gemini] Model initialized successfully with API Key.')

    const genAI = new GoogleGenerativeAI(apiKey)
    // Using gemini-pro as it has the widest availability and stability across v1/v1beta
    return genAI.getGenerativeModel({ model: "gemini-pro" })
}

/**
 * Analyzes a user profile for quality and coherence.
 */
export const auditProfileWithAI = async (profile: {
    display_name: string | null
    occupation: string | null
    dating_persona: string | null
    badges: string[] | null
    vibe_answers: Array<{ question: string, answer: string }> | null
}) => {
    const model = getGeminiModel()
    if (!model) return null

    const prompt = `
        You are an expert profile quality auditor for "Minutes 2 Match", a premium matchmaking service.
        Analyze the following user profile and provide a quality evaluation.
        
        USER DATA:
        - Name: ${profile.display_name || 'N/A'}
        - Occupation: ${profile.occupation || 'N/A'}
        - Dating Persona: ${profile.dating_persona || 'N/A'}
        - Personal Tags/Badges: ${profile.badges?.join(', ') || 'None'}
        - Vibe Check Answers:
          ${profile.vibe_answers?.map(a => `- Q: ${a.question} | A: ${a.answer}`).join('\n') || 'None'}

        CRITERIA:
        1. Coherence: Does the persona match the vibe answers and occupation?
        2. Effort: Do the answers look thoughtful or generic/lazy?
        3. Risk: Does this look like a fake or bot profile?

        Respond ONLY in JSON format with this structure:
        {
            "coherence_score": number (0-100),
            "effort_score": number (0-100),
            "flags": string[],
            "summary": "Brief explanation of your finding (max 2 sentences)"
        }
    `

    try {
        const result = await model.generateContent(prompt)
        const responseText = result.response.text()

        // Clean markdown if AI includes it
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0])
        }
        return null
    } catch (error) {
        console.error('AI Profile Audit Error:', error)
        return null
    }
}
