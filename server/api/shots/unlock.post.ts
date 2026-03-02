/**
 * Unlock a Shot (Target reveals who shot their shot)
 * POST /api/shots/unlock
 * 
 * Public endpoint - target clicks "Unlock" to see who's interested.
 * Notifies the shooter via SMS that their shot was seen.
 */

import { createClient } from '@supabase/supabase-js'
import { notifyDiscord, DiscordColors } from '~/server/utils/discord'

export default defineEventHandler(async (event) => {
    const { token } = await readBody(event)

    if (!token) {
        throw createError({ statusCode: 400, message: 'Missing token' })
    }

    const config = useRuntimeConfig()
    const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey, {
        db: { schema: 'm2m' }
    })

    const { data: shot } = await supabase
        .from('shots')
        .select('*')
        .eq('target_token', token)
        .maybeSingle()

    if (!shot) {
        throw createError({ statusCode: 404, message: 'Shot not found' })
    }

    if (shot.status === 'unlocked') {
        // Already unlocked, just return the data
        return {
            success: true,
            shooterName: shot.shooter_name,
            shooterPhone: shot.shooter_phone,
            message: shot.message,
            alreadyUnlocked: true
        }
    }

    if (shot.payment_status !== 'success') {
        throw createError({ statusCode: 402, message: 'Payment not confirmed' })
    }

    // Unlock the shot
    const now = new Date().toISOString()
    await supabase
        .from('shots')
        .update({ status: 'unlocked', unlocked_at: now })
        .eq('id', shot.id)

    // Notify the shooter via SMS
    const shooterMessage = `${shot.target_name} just saw your shot on Minutes2Match! 🎯 They know you're interested. Good luck! 💫`
    try {
        await $fetch('/api/send-sms', {
            method: 'POST',
            body: { to: shot.shooter_phone, message: shooterMessage }
        })
        console.log(`[Shot] Shooter notified: ${shot.shooter_phone}`)
    } catch (e) {
        console.error('[Shot] Failed to notify shooter:', e)
    }

    // Discord
    await notifyDiscord({
        title: '🎯 Shot Unlocked!',
        description: `${shot.target_name} unlocked ${shot.shooter_name}'s shot`,
        color: DiscordColors.match,
    })

    return {
        success: true,
        shooterName: shot.shooter_name,
        shooterPhone: shot.shooter_phone,
        message: shot.message,
        alreadyUnlocked: false
    }
})
