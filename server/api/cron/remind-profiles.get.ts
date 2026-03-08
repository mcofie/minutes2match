/**
 * Cron Component: Profile Completion Reminders
 * GET /api/cron/remind-profiles
 * 
 * Automatically identifies and reminds users with incomplete profiles.
 */

import { createClient } from '@supabase/supabase-js'
import { notifyDiscord, DiscordColors } from '~/server/utils/discord'
import { sendSMS } from '~/server/utils/sms'

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
        const PROFILE_REMINDER_UUID = '5f8e5d0b-2d5d-4d3c-bd3c-3c4d5e6f7a8b'
        const NUDGE_INTERVAL_DAYS = 7
        const MAX_BATCH_SIZE = 25

        // REQUIRED_FIELDS based on dashboard logic
        const REQUIRED_FIELDS = ['display_name', 'photo_url', 'birth_date', 'gender', 'dating_persona']

        console.log('[Profile Reminder] Starting scan...')

        // 1. Fetch users (verified but might have shallow profiles)
        const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('id, phone, display_name, photo_url, birth_date, gender, dating_persona, created_at')
            .eq('is_verified', true)

        if (profileError) throw profileError

        // Filter for incomplete (missing 2+ fields)
        const allIncomplete = (profiles || []).filter(p => {
            const missing = REQUIRED_FIELDS.filter(f => !p[f as keyof typeof p])
            return missing.length >= 2
        })

        if (allIncomplete.length === 0) return { success: true, sent: 0 }

        // 2. Frequency Capping: Fetch recent nudges for this campaign
        const { data: recentHistory } = await supabase
            .from('sms_history')
            .select('recipient_id, created_at')
            .eq('broadcast_id', PROFILE_REMINDER_UUID)

        const lastNudgeMap = new Map<string, number>()
        recentHistory?.forEach(h => {
            if (h.recipient_id) {
                const time = new Date(h.created_at).getTime()
                const current = lastNudgeMap.get(h.recipient_id) || 0
                if (time > current) lastNudgeMap.set(h.recipient_id, time)
            }
        })

        const now = Date.now()
        let candidates = allIncomplete.filter(p => {
            const lastTime = lastNudgeMap.get(p.id)
            if (!lastTime) return true
            const daysSince = (now - lastTime) / (1000 * 60 * 60 * 24)
            return daysSince >= NUDGE_INTERVAL_DAYS
        })

        // 3. Batching: Process a small amount to stay safe on timeouts
        const batch = candidates.slice(0, MAX_BATCH_SIZE)
        if (batch.length === 0) return { success: true, sent: 0, reason: 'Frequency capped' }

        let sentCount = 0

        for (const profile of batch) {
            const firstName = (profile.display_name || 'there').split(' ')[0]
            const message = `Hi ${firstName}! Your Minutes2Match profile is incomplete. Complete it now to find your best matches: minutes2match.com/me`

            try {
                // Use unified sendSMS for Hubtel support + Zend fallback
                await sendSMS(profile.phone, message, { priority: 'normal' })

                // Log history using a valid UUID for broadcast_id
                // @ts-ignore
                await supabase.from('sms_history').insert({
                    recipient_id: profile.id,
                    recipient_phone: profile.phone,
                    recipient_name: profile.display_name,
                    message,
                    status: 'sent',
                    broadcast_id: PROFILE_REMINDER_UUID
                })
                sentCount++
                console.log(`[Profile Reminder] Sent to ${profile.phone}`)
            } catch (e: any) {
                console.error(`[Profile Reminder] Failed for ${profile.phone}:`, e.message)
            }
        }

        if (sentCount > 0) {
            await notifyDiscord({
                title: '⏰ Profile Completion Reminders',
                description: `Sent ${sentCount} automated SMS reminders for incomplete profiles.`,
                color: DiscordColors.info,
                fields: [
                    { name: 'Remaining Candidates', value: String(candidates.length - sentCount), inline: true }
                ]
            })
        }

        return {
            success: true,
            sent: sentCount,
            total_incomplete: allIncomplete.length,
            batch_size: batch.length
        }

    } catch (err: any) {
        throw createError({ statusCode: 500, message: err.message })
    }
})
