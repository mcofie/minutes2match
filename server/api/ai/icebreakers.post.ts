import { getGeminiModel } from '~/server/utils/ai';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { matchName, sharedInterests, matchBio, matchVibe } = body;

    if (!matchName) {
        throw createError({ statusCode: 400, message: 'Match name is required' });
    }

    try {
        const model = getGeminiModel();
        if (!model) return generateLocalIcebreakers(matchName, sharedInterests, matchVibe);

        const prompt = `
        You are an expert dating coach. I just matched with someone on a dating app called Minutes2Match.
        Their name is ${matchName}.
        ${sharedInterests?.length ? `We have the following shared interests: ${sharedInterests.join(', ')}.` : ''}
        ${matchBio ? `Their bio says: "${matchBio}"` : ''}
        ${matchVibe ? `Their personality vibe is: "${matchVibe}"` : ''}

        Generate exactly 3 short, charming, and highly personalized icebreaker messages I can send them. 
        NO hashtags. Keep them natural, slightly flirty but respectful. Limit to 1-2 short sentences maximum per icebreaker.
        Format your response as a JSON array of strings, e.g. ["Icebreaker 1", "Icebreaker 2", "Icebreaker 3"].
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        try {
            const parsed = JSON.parse(responseText.match(/\[.*\]/s)?.[0] || '[]');
            if (parsed.length >= 3) {
                return { icebreakers: parsed.slice(0, 3) };
            }
        } catch (e) {
            console.error('[AI Icebreaker] Failed to parse JSON response:', responseText);
        }
        
    } catch (error) {
        console.error('[AI Icebreaker] Error generating via Gemini:', error);
    }

    // Fallback if AI fails or no API key
    return generateLocalIcebreakers(matchName, sharedInterests, matchVibe);
});

function generateLocalIcebreakers(name: string, interests: string[], vibe: string) {
    const fallbacks = [];
    
    if (interests && interests.length > 0) {
        fallbacks.push(`Hi ${name}! I saw we both love ${interests[0]}. What's your favorite thing about it?`);
        if (interests.length > 1) {
            fallbacks.push(`Hey ${name}! Between ${interests[0]} and ${interests[1]}, which one takes up more of your weekends?`);
        }
    } else {
        fallbacks.push(`Hey ${name}! 👋 What's been the highlight of your week so far?`);
    }

    if (vibe) {
        fallbacks.push(`Hi ${name}! Your profile gives off major "${vibe}" energy. Love it. What are you up to today?`);
    } else {
        fallbacks.push(`Hi ${name}! What's your go-to way to unwind after a long day?`);
    }

    return { icebreakers: fallbacks.slice(0, 3) };
}
