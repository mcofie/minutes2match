/**
 * Zend OTP - Verify OTP Server Route
 * POST /api/otp/verify
 * 
 * Verifies OTP via Supabase (since we now send manual SMS with sender ID)
 */

import { createClient } from '@supabase/supabase-js'

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

    try {
        // Verify against Supabase m2m.otp_codes table
        const { data: otpData, error: otpError } = await supabaseAdmin
            .schema('m2m')
            .from('otp_codes')
            .select('*')
            .eq('id', otpId)
            .eq('code', code)
            .eq('used', false)
            .gt('expires_at', new Date().toISOString())
            .single()

        if (otpError || !otpData) {
            console.error(`[OTP] Verification failed for ${otpId}:`, otpError?.message)
            return {
                valid: false,
                error: 'Invalid or expired code'
            }
        }

        // Mark OTP as used
        await supabaseAdmin
            .schema('m2m')
            .from('otp_codes')
            .update({ used: true })
            .eq('id', otpId)

        console.log(`[OTP] Verified successfully for ${otpId}`)
        return {
            valid: true,
            message: 'OTP verified successfully'
        }
    } catch (error: any) {
        console.error(`[OTP] Error during verification for ${otpId}:`, error?.message)
        return {
            valid: false,
            error: 'Verification failed'
        }
    }
})
