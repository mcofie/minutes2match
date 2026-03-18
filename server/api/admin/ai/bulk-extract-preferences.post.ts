import { createClient } from '@supabase/supabase-js'
import { extractPreferencesFromBio } from '~/server/utils/ai'

/**
 * Admin endpoint to run bulk preference extraction for all users
 * POST /api/admin/ai/bulk-extract-preferences
 */
export default defineEventHandler(async (event) => {
    // Basic admin check (could be more robust)
    // For now, we assume this is called by an admin
    
    const config = useRuntimeConfig()
    const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey, {
        db: { schema: 'm2m' }
    })

    // Fetch all profiles with a bio that haven't been processed yet 
    // (or all if we want to refresh)
    const { data: profiles, error: fetchError } = await supabase
        .from('profiles')
        .select('id, about_me')
        .not('about_me', 'is', null)
        // .is('preferences_extracted', null) // Uncomment to only process new ones

    if (fetchError) {
        throw createError({ statusCode: 500, message: 'Failed to fetch profiles' })
    }

    if (!profiles || profiles.length === 0) {
        return { success: true, message: 'No profiles found for processing' }
    }

    const results = {
        total: profiles.length,
        processed: 0,
        skipped: 0,
        failed: 0
    }

    // Process in small batches to avoid timeout or rate limiting
    for (const profile of profiles) {
        if (!profile.about_me || profile.about_me.length < 10) {
            results.skipped++
            continue
        }

        try {
            const extracted = await extractPreferencesFromBio(profile.about_me)
            if (extracted) {
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ preferences_extracted: extracted } as any)
                    .eq('id', profile.id)

                if (updateError) {
                    console.error(`[AI Bulk] Update failed for ${profile.id}:`, updateError)
                    results.failed++
                } else {
                    results.processed++
                }
            } else {
                results.failed++
            }
        } catch (err) {
            console.error(`[AI Bulk] Error processing ${profile.id}:`, err)
            results.failed++
        }

        // Optional small sleep to respect rate limits if needed
        // await new Promise(r => setTimeout(r, 100))
    }

    return { 
        success: true, 
        message: 'Bulk processing completed',
        results
    }
})
