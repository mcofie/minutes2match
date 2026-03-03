/**
 * Zend OTP - Send OTP Server Route
 * POST /api/otp/send
 * 
 * Generates OTP, stores in Supabase, and sends via Zend SMS (with sender ID)
 */

import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    // Rate limit: 3 OTP requests per minute per IP
    enforceRateLimit(event, {
        maxRequests: 3,
        windowSeconds: 60,
        prefix: 'otp-send'
    })

    const { phone } = await readBody(event)

    if (!phone) {
        throw createError({
            statusCode: 400,
            message: 'Missing required field: phone'
        })
    }

    const config = useRuntimeConfig()

    if (!config.zendApiKey) {
        throw createError({
            statusCode: 500,
            message: 'Zend API key not configured'
        })
    }

    const normalizedPhone = normalizeGhanaPhone(phone)

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    // Store OTP in Supabase
    const supabaseUrl = config.supabaseUrl || process.env.SUPABASE_URL
    const supabaseServiceKey = config.supabaseServiceKey || process.env.SUPABASE_SERVICE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('[OTP] Supabase configuration missing:', { hasUrl: !!supabaseUrl, hasKey: !!supabaseServiceKey })
        throw createError({
            statusCode: 500,
            message: 'Internal configuration error'
        })
    }

    const supabaseAdmin = createClient(
        supabaseUrl,
        supabaseServiceKey,
        { auth: { persistSession: false } }
    )

    try {
        // Upsert the OTP (replaces existing one for this phone since phone is UNIQUE)
        const { data: otpRecord, error: upsertError } = await supabaseAdmin
            .schema('m2m')
            .from('otp_codes')
            .upsert({
                phone: normalizedPhone,
                code,
                expires_at: expiresAt.toISOString(),
                used: false
            }, { onConflict: 'phone' })
            .select('id')
            .single()

        if (upsertError) {
            console.error('[OTP] Failed to store OTP in Supabase:', {
                message: upsertError.message,
                details: upsertError.details,
                hint: upsertError.hint,
                code: upsertError.code
            })
            throw new Error(`Failed to store verification code: ${upsertError.message}`)
        }

        // Send via Zend SMS (includes sender_id: "Mins2Match")
        const message = `Your Minutes 2 Match verification code is: ${code}. Expires in 5 minutes.`
        await sendZendSMS(config.zendApiKey, normalizedPhone, message, {
            priority: 'urgent',
            deliveryPriority: 'speed'
        })

        console.log(`[OTP] Sent to ${normalizedPhone}, DB ID: ${otpRecord.id}`)
        return {
            success: true,
            otpId: otpRecord.id,
            expiresAt: expiresAt.toISOString()
        }
    } catch (error: any) {
        console.error(`[OTP] Failed to send to ${normalizedPhone}:`, error?.message)
        console.error(`[OTP] Full error:`, JSON.stringify(error?.data || error?.response || error, null, 2))
        throw createError({
            statusCode: 500,
            message: `Failed to send verification code: ${error?.data?.message || error?.message || 'Unknown error'}`
        })
    }
})
