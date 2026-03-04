/**
 * Admin: Resend SMS for a Vouch
 * POST /api/admin/vouches/resend-sms
 * 
 * Resends the SMS for either friend A, friend B, or both.
 */

import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { vouchId, target } = body // target: 'a' | 'b' | 'both'

    if (!vouchId || !target) {
        throw createError({ statusCode: 400, message: 'Missing vouchId or target' })
    }

    const config = useRuntimeConfig()
    const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey, {
        db: { schema: 'm2m' }
    })

    const { data: vouch, error } = await supabase
        .from('vouches')
        .select('*')
        .eq('id', vouchId)
        .single()

    if (error || !vouch) {
        throw createError({ statusCode: 404, message: 'Vouch not found' })
    }

    const baseUrl = config.public?.baseUrl || 'https://minutes2match.com'
    const results: string[] = []

    const sendFriendSMS = async (name: string, phone: string, token: string) => {
        const link = `${baseUrl}/vouch/${token}`
        const message = `Hey ${name}! Your friend ${vouch.matcher_name} thinks you'd be a great match with someone special. Tap to see: ${link}`

        await $fetch('/api/send-sms', {
            method: 'POST',
            body: { to: phone, message }
        })
        results.push(`SMS sent to ${name} (${phone})`)
    }

    try {
        if (target === 'a' || target === 'both') {
            if (!vouch.friend_a_accepted) {
                await sendFriendSMS(vouch.friend_a_name, vouch.friend_a_phone, vouch.friend_a_token)
            } else {
                results.push(`${vouch.friend_a_name} already accepted — skipped`)
            }
        }

        if (target === 'b' || target === 'both') {
            if (!vouch.friend_b_accepted) {
                await sendFriendSMS(vouch.friend_b_name, vouch.friend_b_phone, vouch.friend_b_token)
            } else {
                results.push(`${vouch.friend_b_name} already accepted — skipped`)
            }
        }

        return { success: true, results }
    } catch (smsError: any) {
        console.error('[Admin] Failed to resend vouch SMS:', smsError)
        throw createError({ statusCode: 500, message: 'Failed to send SMS' })
    }
})
