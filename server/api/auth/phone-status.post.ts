// Tells the landing page whether a phone number already has an account,
// so returning members are sent to OTP login instead of the Vibe Check.
// Returns no credentials - login still requires the OTP.

import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    // Rate limit to slow down phone-number enumeration
    enforceRateLimit(event, {
        maxRequests: 10,
        windowSeconds: 60,
        prefix: 'phone-status'
    })

    const body = await readBody(event)
    const config = useRuntimeConfig()

    const phone = typeof body?.phone === 'string' ? body.phone : ''
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 9 || digits.length > 15) {
        throw createError({ statusCode: 400, statusMessage: 'A valid phone number is required' })
    }

    const normalizedPhone = normalizeGhanaPhone(phone)

    const supabaseAdmin = createClient(
        config.supabaseUrl || process.env.SUPABASE_URL || '',
        config.supabaseServiceKey || '',
        { auth: { persistSession: false } }
    )

    const { count, error } = await supabaseAdmin
        .schema('m2m')
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('phone', normalizedPhone)

    if (error) {
        console.error('[PhoneStatus] Lookup failed:', error)
        throw createError({ statusCode: 500, statusMessage: 'Could not check phone number' })
    }

    return { registered: (count ?? 0) > 0 }
})
