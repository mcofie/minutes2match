/**
 * Cron Component: Profile Completion Reminders
 * GET /api/cron/remind-profiles
 * 
 * Automatically identifies and reminds users with incomplete profiles.
 */

import { createClient } from '@supabase/supabase-js'
import { notifyDiscord, DiscordColors } from '~/server/utils/discord'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()

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
        // REQUIRED_FIELDS based on dashboard logic
        const REQUIRED_FIELDS = ['display_name', 'photo_url', 'birth_date', 'gender', 'dating_persona']

        // Fetch users (verified but might have shallow profiles)
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, phone, display_name, photo_url, birth_date, gender, dating_persona, created_at')
            .eq('is_verified', true)

        if (error) throw error

        // Filter for incomplete (missing 2+ fields)
        const incomplete = (profiles || []).filter(p => {
            const missing = REQUIRED_FIELDS.filter(f => !p[f as keyof typeof p])
            return missing.length >= 2
        })

        if (incomplete.length === 0) return { success: true, sent: 0 }

        // Setup Hubtel
        const authToken = Buffer.from(`${config.hubtelClientId}:${config.hubtelClientSecret}`).toString('base64')
        let sentCount = 0

        for (const profile of incomplete) {
            const message = `Hi ${profile.display_name || 'there'}! Your Minutes2Match profile is incomplete. Complete it now to find your best matches: minutes2match.com/me`

            try {
                await $fetch('https://smsc.hubtel.com/v1/messages/send', {
                    method: 'POST',
                    headers: { 'Authorization': `Basic ${authToken}`, 'Content-Type': 'application/json' },
                    body: { From: 'M2Match', To: profile.phone, Content: message }
                })

                // Log history
                await supabase.from('sms_history').insert({
                    recipient_id: profile.id,
                    recipient_phone: profile.phone,
                    message,
                    status: 'sent',
                    broadcast_id: 'cron-profile-reminder'
                })
                sentCount++
            } catch (e) {
                console.error(`Failed reminder for ${profile.phone}`)
            }
        }

        await notifyDiscord({
            title: '⏰ Profile Completion Reminders',
            description: `Sent ${sentCount} automated SMS reminders for incomplete profiles.`,
            color: DiscordColors.info
        })

        return { success: true, sent: sentCount }

    } catch (err: any) {
        throw createError({ statusCode: 500, message: err.message })
    }
})
