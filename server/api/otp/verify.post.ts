/**
 * Zend OTP - Verify OTP Server Route
 * POST /api/otp/verify
 * 
 * Verifies OTP via Supabase (since we now send manual SMS with sender ID)
 */

import { createClient } from '@supabase/supabase-js'
import { consumeOtp } from '~/server/utils/otpCheck'

export default defineEventHandler(async (event) => {
    // Rate limit: 5 verify attempts per minute per IP
    enforceRateLimit(event, {
        maxRequests: 5,
        windowSeconds: 60,
        prefix: 'otp-verify'
    })

    const { otpId, code } = await readBody(event)

    if (!otpId || !code) {
        throw createError({
            statusCode: 400,
            message: 'Missing required fields: otpId, code'
        })
    }

    const config = useRuntimeConfig()

    const supabaseAdmin = createClient(
        config.supabaseUrl || process.env.SUPABASE_URL || '',
        config.supabaseServiceKey || '',
        { auth: { persistSession: false } }
    )

    // Look up which phone this code was sent to, then check it with the shared attempt-limited check
    const { data: sent } = await supabaseAdmin.schema('m2m').from('otp_codes').select('phone').eq('id', otpId).maybeSingle()
    if (!sent?.phone) return { valid: false, error: 'That code has expired. Request a new one.' }
    try {
        await consumeOtp(supabaseAdmin, sent.phone, String(code))
        return { valid: true, message: 'OTP verified successfully' }
    } catch (error: any) {
        return { valid: false, error: error?.message || 'Verification failed' }
    }
})
