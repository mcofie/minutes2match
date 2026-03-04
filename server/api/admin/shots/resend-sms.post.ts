/**
 * Admin: Resend SMS for a Shot
 * POST /api/admin/shots/resend-sms
 * 
 * Resends the target SMS for a shot.
 * Requires admin auth (service role key used server-side).
 */

import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { shotId } = body

    if (!shotId) {
        throw createError({ statusCode: 400, message: 'Missing shotId' })
    }

    const config = useRuntimeConfig()
    const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey, {
        db: { schema: 'm2m' }
    })

    // Fetch the shot
    const { data: shot, error } = await supabase
        .from('shots')
        .select('*')
        .eq('id', shotId)
        .single()

    if (error || !shot) {
        throw createError({ statusCode: 404, message: 'Shot not found' })
    }

    if (shot.payment_status !== 'success') {
        throw createError({ statusCode: 400, message: 'Cannot resend SMS — payment not confirmed' })
    }

    const baseUrl = config.public?.baseUrl || 'https://minutes2match.com'
    const targetLink = `${baseUrl}/shot/${shot.target_token}`
    const targetMessage = `Hey ${shot.target_name}! Someone is interested in you. They've shot their shot on Minutes2Match. Tap to find out who: ${targetLink}`

    try {
        await $fetch('/api/send-sms', {
            method: 'POST',
            body: { to: shot.target_phone, message: targetMessage }
        })

        return { success: true, message: `SMS resent to ${shot.target_phone}` }
    } catch (smsError: any) {
        console.error('[Admin] Failed to resend shot SMS:', smsError)
        throw createError({ statusCode: 500, message: 'Failed to send SMS' })
    }
})
