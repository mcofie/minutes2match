import { createClient } from '@supabase/supabase-js'
import { extractPreferencesFromBio } from '~/server/utils/ai'

/**
 * Endpoint to trigger AI preference extraction for a user
 * POST /api/ai/extract-preferences
 * Body: { userId: string }
 */
export default defineEventHandler(async (event) => {
    const body = await readBody<{ userId: string }>(event)
    const { userId } = body

    if (!userId) {
        throw createError({ statusCode: 400, message: 'Missing userId' })
    }

    const config = useRuntimeConfig()
    const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey, {
        db: { schema: 'm2m' }
    })

    // Fetch user bio
    const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('about_me')
        .eq('id', userId)
        .single()

    if (fetchError || !profile) {
        throw createError({ statusCode: 404, message: 'Profile not found' })
    }

    if (!profile.about_me) {
        return { success: true, message: 'No bio to extract from' }
    }

    // Extract preferences via AI
    const extracted = await extractPreferencesFromBio(profile.about_me)

    if (extracted) {
        // Update profile with extracted preferences
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ preferences_extracted: extracted } as any)
            .eq('id', userId)

        if (updateError) {
            console.error('[AI] Update error:', updateError)
            throw createError({ statusCode: 500, message: 'Failed to save extracted preferences' })
        }

        return { success: true, data: extracted }
    }

    return { success: false, message: 'AI extraction returned null' }
})
