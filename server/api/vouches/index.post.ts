/**
 * Create a Vouch
 * POST /api/vouches
 * 
 * Public endpoint - no auth required.
 * Creates a vouch record and sends SMS to both friends.
 */

import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { notifyDiscord, DiscordColors } from '~/server/utils/discord'
import { enforceRateLimit } from '~/server/utils/rateLimiter'

export default defineEventHandler(async (event) => {
    // Rate limit: 3 vouches per hour per IP
    enforceRateLimit(event, {
        maxRequests: 3,
        windowSeconds: 3600,
        prefix: 'vouch'
    })

    const body = await readBody(event)

    const { matcherName, matcherPhone, matcherEmail, friendAName, friendAPhone, friendBName, friendBPhone, matcherNote } = body

    // Validate required fields
    if (!matcherName || !matcherPhone || !friendAName || !friendAPhone || !friendBName || !friendBPhone) {
        throw createError({
            statusCode: 400,
            message: 'Missing required fields'
        })
    }

    // Validate phone formats (basic Ghana phone format)
    const phoneRegex = /^(\+?233|0)\d{9}$/
    if (!phoneRegex.test(friendAPhone) || !phoneRegex.test(friendBPhone)) {
        throw createError({
            statusCode: 400,
            message: 'Invalid phone number format'
        })
    }

    // Prevent vouching yourself or same person
    if (friendAPhone === friendBPhone) {
        throw createError({
            statusCode: 400,
            message: 'Friend A and Friend B must be different people'
        })
    }

    const config = useRuntimeConfig()
    const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey, {
        db: { schema: 'm2m' }
    })

    // Generate unique tokens for friend links
    const friendAToken = crypto.randomUUID()
    const friendBToken = crypto.randomUUID()
    const baseUrl = config.public.baseUrl || 'https://minutes2match.com'

    try {
        // Create the vouch record
        const { data: vouch, error } = await supabase
            .from('vouches')
            .insert({
                matcher_name: matcherName,
                matcher_phone: matcherPhone,
                matcher_email: matcherEmail || null,
                friend_a_name: friendAName,
                friend_a_phone: friendAPhone,
                friend_a_token: friendAToken,
                friend_b_name: friendBName,
                friend_b_phone: friendBPhone,
                friend_b_token: friendBToken,
                matcher_note: matcherNote || null
            })
            .select()
            .single()

        if (error) {
            console.error('[Vouch] Failed to create vouch:', error)
            throw createError({ statusCode: 500, message: 'Failed to create vouch' })
        }

        // Send SMS to Friend A
        const friendALink = `${baseUrl}/vouch/${friendAToken}`
        const friendAMessage = `Hey ${friendAName}! Your friend ${matcherName} thinks you'd be great with someone special 💫 Tap to see who: ${friendALink}`

        try {
            await $fetch('/api/send-sms', {
                method: 'POST',
                body: { to: friendAPhone, message: friendAMessage }
            })
            console.log(`[Vouch] SMS sent to Friend A: ${friendAPhone}`)
        } catch (smsError) {
            console.error('[Vouch] Failed to SMS Friend A:', smsError)
        }

        // Send SMS to Friend B
        const friendBLink = `${baseUrl}/vouch/${friendBToken}`
        const friendBMessage = `Hey ${friendBName}! Your friend ${matcherName} thinks you'd be great with someone special 💫 Tap to see who: ${friendBLink}`

        try {
            await $fetch('/api/send-sms', {
                method: 'POST',
                body: { to: friendBPhone, message: friendBMessage }
            })
            console.log(`[Vouch] SMS sent to Friend B: ${friendBPhone}`)
        } catch (smsError) {
            console.error('[Vouch] Failed to SMS Friend B:', smsError)
        }

        // Discord notification
        await notifyDiscord({
            title: '🤝 New Vouch Created',
            color: DiscordColors.match,
            fields: [
                { name: 'Matcher', value: matcherName, inline: true },
                { name: 'Friend A', value: friendAName, inline: true },
                { name: 'Friend B', value: friendBName, inline: true },
            ]
        })

        return {
            success: true,
            vouchId: vouch.id,
            message: 'Vouch created! Both friends will receive an SMS.'
        }
    } catch (err: any) {
        if (err.statusCode) throw err
        console.error('[Vouch] Error:', err)
        throw createError({ statusCode: 500, message: 'Something went wrong' })
    }
})
