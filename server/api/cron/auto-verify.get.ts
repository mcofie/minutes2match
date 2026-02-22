/**
 * Cron Component: Verified Badge Auto-Approval
 * GET /api/cron/auto-verify
 * 
 * Automatically verifies users who meet the criteria:
 * 1. Has a phone number
 * 2. Has a non-placeholder photo
 * 3. Complete basic profile info
 */

import { createClient } from '@supabase/supabase-js'
import { notifyDiscord, DiscordColors } from '~/server/utils/discord'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const startTime = Date.now()

    // Header protection
    const authHeader = getHeader(event, 'authorization')
    if (authHeader !== `Bearer ${config.cronSecret}`) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const supabaseUrl = config.supabaseUrl || process.env.SUPABASE_URL
    const supabaseServiceKey = config.supabaseServiceKey
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
        db: { schema: 'm2m' }
    })

    try {
        // Fetch users who are NOT verified but might be eligible
        const { data: users, error } = await supabase
            .from('profiles')
            .select('id, display_name, phone, photo_url, gender, birth_date, location, is_verified')
            .eq('is_verified', false)

        if (error) throw error

        const eligibleUsers = (users || []).filter(u => {
            // Logic for auto-verification
            const hasPhone = !!u.phone;
            const hasPhoto = u.photo_url && !u.photo_url.includes('placeholder');
            const hasBasicInfo = u.display_name && u.gender && u.birth_date && u.location;

            return hasPhone && hasPhoto && hasBasicInfo;
        })

        if (eligibleUsers.length === 0) {
            return { success: true, verified: 0, message: 'No eligible users for auto-verification' }
        }

        const eligibleIds = eligibleUsers.map(u => u.id)

        // Perform bulk update
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ is_verified: true, updated_at: new Date().toISOString() })
            .in('id', eligibleIds)

        if (updateError) throw updateError

        const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2)

        await notifyDiscord({
            title: '✅ Auto-Verification Report',
            description: `Successfully auto-verified ${eligibleUsers.length} users.`,
            color: DiscordColors.success,
            fields: [
                { name: 'Users Verified', value: eligibleUsers.map(u => `• ${u.display_name || u.phone}`).join('\n').substring(0, 1000), inline: false },
                { name: 'Runtime', value: `${elapsedTime}s`, inline: true }
            ]
        })

        return {
            success: true,
            verifiedCount: eligibleUsers.length,
            users: eligibleUsers.map(u => u.display_name)
        }

    } catch (err: any) {
        console.error('[AutoVerify] Error:', err)
        await notifyDiscord({
            title: '🚨 Auto-Verification Failed',
            description: err.message,
            color: DiscordColors.error
        })
        throw createError({ statusCode: 500, message: 'Auto-verification task failed' })
    }
})
