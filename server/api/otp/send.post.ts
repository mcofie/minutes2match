/**
 * Zend OTP - Send OTP Server Route
 * POST /api/otp/send
 * 
 * Generates OTP, stores in Supabase, and sends via Zend SMS (with sender ID)
 */

import { createClient } from '@supabase/supabase-js'
import { sendSMS } from '~/server/utils/sms'

export default defineEventHandler(async (event) => {
    // Rate limit: 3 OTP requests per minute per IP
    enforceRateLimit(event, {
        maxRequests: 3,
        windowSeconds: 60,
        prefix: 'otp-send'
    })

    const { phone, provider } = await readBody(event)

    if (!phone) {
        throw createError({
            statusCode: 400,
            message: 'Missing required field: phone'
        })
    }

    const config = useRuntimeConfig()

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

    let otpRecord: { id: string } | null = null
    const message = `Your Minutes 2 Match verification code is: ${code}. Expires in 5 minutes.`

    try {
        // Clean up old expired/used codes for this phone (housekeeping)
        await supabaseAdmin
            .schema('m2m')
            .from('otp_codes')
            .delete()
            .eq('phone', normalizedPhone)
            .or(`used.eq.true,expires_at.lt.${new Date().toISOString()}`)

        // Insert a NEW OTP row (don't upsert/overwrite!)
        // This allows multiple valid codes to coexist briefly,
        // so if auto-failover sends a backup code, the original remains valid too.
        const { data: record, error: insertError } = await supabaseAdmin
            .schema('m2m')
            .from('otp_codes')
            .insert({
                phone: normalizedPhone,
                code,
                expires_at: expiresAt.toISOString(),
                used: false
            })
            .select('id')
            .single()

        if (insertError) {
            console.error('[OTP] Failed to store OTP in Supabase:', {
                message: insertError.message,
                details: insertError.details,
                hint: insertError.hint,
                code: insertError.code
            })
            throw new Error(`Failed to store verification code: ${insertError.message}`)
        }

        otpRecord = record

        // Send via unified SMS orchestrator
        const smsResult = await sendSMS(normalizedPhone, message, {
            provider: provider, // Allows explicit fallback to 'zend'
            priority: 'urgent'
        })

        console.log(`[OTP] Sent to ${normalizedPhone} via ${smsResult.provider}, DB ID: ${otpRecord.id}`)
        return {
            success: true,
            otpId: otpRecord.id,
            expiresAt: expiresAt.toISOString(),
            provider: smsResult.provider
        }
    } catch (error: any) {
        console.error(`[OTP] Send failed for ${normalizedPhone} via ${provider || 'primary provider'}:`, error?.message)
        throw createError({
            statusCode: 500,
            message: `Failed to send verification code: ${error?.data?.message || error?.message || 'Unknown error'}`
        })
    }
})
