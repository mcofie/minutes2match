import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * AI helpers for Minutes 2 Match (Google Gemini).
 * The model comes from runtime config (GEMINI_MODEL), so a retired model is a config change, not a code change.
 * Scoring itself stays rule-based (utils/compatibility.ts); AI only reads bios, explains matches,
 * and takes a second look at close calls.
 */

export const getGeminiModel = (options: { json?: boolean } = {}) => {
    const config = useRuntimeConfig()
    const apiKey = config.geminiApiKey

    if (!apiKey) {
        console.warn('[Gemini] GEMINI_API_KEY is missing from runtime config. Check your .env or nuxt.config.ts')
        return null
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    return genAI.getGenerativeModel({
        model: (config.geminiModel as string) || 'gemini-3.5-flash-lite',
        ...(options.json ? { generationConfig: { responseMimeType: 'application/json' } } : {})
    })
}

// Set when Gemini says the quota is used up, so batch jobs can stop instead of failing every item
let quotaHitAt = 0
const noteQuotaError = (error: any) => {
    const text = String(error?.message || error?.statusMessage || error || '')
    if (error?.status === 429 || error?.statusCode === 429 || /\b429\b|quota|RESOURCE_EXHAUSTED/i.test(text)) quotaHitAt = Date.now()
}
/** True if Gemini reported its quota used up since `since` (ms timestamp) */
export const aiQuotaHitSince = (since: number) => quotaHitAt >= since

/** Pulls the first JSON object out of a model reply (tolerates stray markdown fences) */
const parseJsonReply = (text: string) => {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null
}

// ---------- Embeddings: compare bios by meaning ----------

export const EMBEDDING_DIMS = 256

/** Embeds texts for similarity comparison. Returns null when AI is unavailable. */
export const embedTexts = async (texts: string[]): Promise<number[][] | null> => {
    const config = useRuntimeConfig()
    const apiKey = config.geminiApiKey
    if (!apiKey || !texts.length) return null
    const model = (config.geminiEmbeddingModel as string) || 'gemini-embedding-001'

    try {
        const res: any = await $fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:batchEmbedContents`, {
            method: 'POST',
            query: { key: apiKey },
            body: {
                requests: texts.map(text => ({
                    model: `models/${model}`,
                    content: { parts: [{ text }] },
                    taskType: 'SEMANTIC_SIMILARITY',
                    outputDimensionality: EMBEDDING_DIMS
                }))
            }
        })
        const vectors = (res?.embeddings || []).map((e: any) => e.values as number[])
        return vectors.length === texts.length ? vectors.map(normalizeVector) : null
    } catch (error) {
        noteQuotaError(error)
        console.error('[Gemini] Embedding error:', error)
        return null
    }
}

// Truncated embeddings aren't unit length; normalise so a dot product is cosine similarity
const normalizeVector = (v: number[]) => {
    const norm = Math.sqrt(v.reduce((sum, x) => sum + x * x, 0)) || 1
    return v.map(x => Number((x / norm).toFixed(5)))
}

/**
 * Two vectors per member: what they're looking for, and how they describe themselves.
 * Built from the extracted traits when there are some, otherwise from the bio itself.
 */
export const buildBioEmbeddings = async (bio: string, extracted: any) => {
    const list = (...parts: (string[] | undefined)[]) => parts.flatMap(p => p || []).filter(Boolean).join(', ')
    const seeking = list(extracted?.seeking?.attributes, extracted?.seeking?.lifestyle)
    const self = list(extracted?.self?.personality, extracted?.self?.values, extracted?.self?.lifestyle)
    const vectors = await embedTexts([
        seeking ? `Looking for a partner who is: ${seeking}` : bio,
        self ? `I am: ${self}` : bio
    ])
    if (!vectors) return null
    return {
        seeking: vectors[0],
        self: vectors[1],
        model: (useRuntimeConfig().geminiEmbeddingModel as string) || 'gemini-embedding-001',
        dims: EMBEDDING_DIMS,
        created_at: new Date().toISOString()
    }
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
    const model = getGeminiModel({ json: true })
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
        return parseJsonReply(result.response.text())
    } catch (error) {
        noteQuotaError(error)
        console.error('AI Profile Audit Error:', error)
        return null
    }
}

/**
 * Extracts structured preferences and traits from a user's bio/about_me text.
 * Used to power advanced matchmaking based on text-embedded preferences.
 */
export const extractPreferencesFromBio = async (bio: string) => {
    const model = getGeminiModel({ json: true })
    if (!model || !bio || bio.length < 10) return null

    const prompt = `
        You are an expert matchmaker for "Minutes 2 Match", a premium matchmaking service.
        Analyze the following user bio and extract structured preferences and self-traits.
        Be objective and only extract what is explicitly or very strongly implied.
        
        BIO: "${bio}"

        Respond ONLY in JSON format with this structure:
        {
            "seeking": {
                "attributes": string[], // physical or personality traits they want (e.g. ["tall", "ambitious", "kind"])
                "dealbreakers": string[], // clear must-NOT-haves (e.g. ["smoker", "unemployed", "lazy"])
                "lifestyle": string[] // shared habits (e.g. ["active", "homebody", "traveler"])
            },
            "self": {
                "personality": string[], // how they describe themselves (e.g. ["introverted", "funny", "serious"])
                "values": string[], // things they care about (e.g. ["family-oriented", "career-driven", "faith-based"])
                "lifestyle": string[] // what they do (e.g. ["hiker", "foodie", "reader"])
            }
        }
    `

    try {
        const result = await model.generateContent(prompt)
        return parseJsonReply(result.response.text())
    } catch (error) {
        noteQuotaError(error)
        console.error('AI Preference Extraction Error:', error)
        return null
    }
}

/**
 * Generates a warm, insightful explanation of why two users were matched.
 * Focuses on shared values, complementary personas, and 'synergy'.
 */
export const generateMatchExplanation = async (user1: any, user2: any, score: number, reasons: string[] = []) => {
    const model = getGeminiModel()
    if (!model) return null

    const describe = (u: any) => [
        `- First name: ${(u.display_name || '').split(' ')[0] || 'Member'}`,
        `- Intent: ${u.intent || 'not given'}`,
        `- Persona: ${u.dating_persona || 'not given'}`,
        `- Interests: ${(u.interests || []).join(', ') || 'not given'}`,
        `- Bio traits: ${JSON.stringify(u.preferences_extracted?.self || {})}`,
        `- Looking for: ${JSON.stringify(u.preferences_extracted?.seeking || {})}`
    ].join('\n')

    const prompt = `
        You are a warm, perceptive matchmaker for "Minutes 2 Match".
        Two members were introduced with a compatibility score of ${score}%.
        What our scoring found: ${reasons.join('; ') || 'a good overall balance'}.

        PERSON A:
${describe(user1)}

        PERSON B:
${describe(user2)}

        Write 2-3 short sentences on why they might click. Only use what's given above; don't invent facts,
        don't mention the score, and don't use markdown. Start directly with the explanation.
    `

    try {
        const result = await model.generateContent(prompt)
        return result.response.text().trim() || null
    } catch (error) {
        noteQuotaError(error)
        console.error('AI Match Explanation Error:', error)
        return null
    }
}

/**
 * A second look at close calls: given one member and their top few eligible candidates
 * (already scored and filtered by the rules), pick the one most likely to work and say why.
 * The rules stay the gatekeeper; this only reorders candidates that already passed.
 */
export const pickBestCandidate = async (target: any, candidates: { profile: any; score: number; reasons: string[]; warnings: string[] }[]) => {
    if (candidates.length < 2) return null
    const model = getGeminiModel({ json: true })
    if (!model) return null

    const describe = (u: any) => ({
        intent: u.intent || null,
        age: u.birth_date ? new Date().getFullYear() - new Date(u.birth_date).getFullYear() : null,
        persona: u.dating_persona || null,
        interests: u.interests || [],
        bio: (u.about_me || '').slice(0, 400) || null,
        traits: u.preferences_extracted?.self || null,
        looking_for: u.preferences_extracted?.seeking || null
    })

    const prompt = `
        You are an experienced matchmaker for "Minutes 2 Match". Our rule-based scorer already checked
        dealbreakers and ranked these candidates for one member. Read the details as a human matchmaker would
        and pick the candidate most likely to lead to a real connection with them.

        MEMBER: ${JSON.stringify(describe(target))}

        CANDIDATES:
        ${candidates.map((c, i) => `${i}: ${JSON.stringify({ ...describe(c.profile), score: c.score, strengths: c.reasons, watch_outs: c.warnings })}`).join('\n        ')}

        Respond ONLY as JSON: {"index": number, "reason": "one sentence for our admin team"}
    `

    try {
        const result = await model.generateContent(prompt)
        const parsed = parseJsonReply(result.response.text())
        const index = Number(parsed?.index)
        if (!Number.isInteger(index) || index < 0 || index >= candidates.length) return null
        return { index, reason: String(parsed?.reason || '').slice(0, 300) }
    } catch (error) {
        noteQuotaError(error)
        console.error('AI Candidate Pick Error:', error)
        return null
    }
}
