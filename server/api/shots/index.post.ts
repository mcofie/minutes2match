/**
 * Create a Shot (Shoot Your Shot)
 * POST /api/shots
 * 
 * Public endpoint - no auth required.
 * Creates a shot record, initiates Paystack payment.
 * SMS is sent AFTER payment confirms (via webhook).
 */

import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { enforceRateLimit } from '~/server/utils/rateLimiter'

export default defineEventHandler(async (event) => {
    // Rate limit: 5 shots per hour per IP
    enforceRateLimit(event, {
        maxRequests: 5,
        windowSeconds: 3600,
        prefix: 'shot'
    })

    const body = await readBody(event)
    const { shooterName, shooterPhone, shooterEmail, targetName, targetPhone, message, hints } = body

    // Validate required fields
    if (!shooterName || !shooterPhone || !shooterEmail || !targetName || !targetPhone) {
        throw createError({
            statusCode: 400,
            message: 'Missing required fields'
        })
    }

    // Validate hints — must be array of 3 with question & answer
    if (!Array.isArray(hints) || hints.length !== 3) {
        throw createError({
            statusCode: 400,
            message: 'Please pick and answer exactly 3 mystery clues'
        })
    }
    for (const hint of hints) {
        if (!hint.question || !hint.answer || typeof hint.answer !== 'string' || hint.answer.trim().length === 0) {
            throw createError({
                statusCode: 400,
                message: 'All 3 mystery clues must have answers'
            })
        }
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(shooterEmail)) {
        throw createError({ statusCode: 400, message: 'Invalid email address' })
    }

    // Validate phones
    const phoneRegex = /^(\+?233|0)\d{9}$/
    if (!phoneRegex.test(targetPhone)) {
        throw createError({ statusCode: 400, message: 'Invalid target phone number' })
    }

    // Can't shoot your own shot at yourself
    if (shooterPhone === targetPhone) {
        throw createError({ statusCode: 400, message: 'You cannot shoot your shot at yourself' })
    }

    const config = useRuntimeConfig()
    const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey, {
        db: { schema: 'm2m' }
    })

    // Get configurable fee from settings
    let shotFee = 15 // default
    try {
        const { data: setting } = await supabase
            .from('settings')
            .select('value')
            .eq('key', 'shoot_your_shot_fee')
            .single()

        if (setting?.value?.amount) {
            shotFee = setting.value.amount
        }
    } catch (e) {
        console.warn('[Shot] Failed to fetch fee setting, using default:', shotFee)
    }

    // Generate unique token for target link
    const targetToken = crypto.randomUUID()

    try {
        // Create the shot record
        const { data: shot, error } = await supabase
            .from('shots')
            .insert({
                shooter_name: shooterName,
                shooter_phone: shooterPhone,
                shooter_email: shooterEmail,
                target_name: targetName,
                target_phone: targetPhone,
                target_token: targetToken,
                message: message || null,
                hints: hints.map((h: any) => ({ question: h.question, answer: h.answer.trim(), emoji: h.emoji || '🔮', id: h.id })),
                amount_paid: shotFee,
                status: 'awaiting_payment'
            })
            .select()
            .single()

        if (error) {
            console.error('[Shot] Failed to create shot:', error)
            throw createError({ statusCode: 500, message: `Failed to create shot: ${error.message}` })
        }

        // Initialize Paystack payment
        const baseUrl = config.public.baseUrl || 'https://minutes2match.com'

        const paystackResponse = await $fetch<{
            status: boolean
            message: string
            data: {
                authorization_url: string
                access_code: string
                reference: string
            }
        }>('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.paystackSecretKey}`,
                'Content-Type': 'application/json'
            },
            body: {
                email: shooterEmail,
                amount: Math.round(shotFee * 100), // pesewas
                currency: 'GHS',
                callback_url: `${baseUrl}/payment/shot-callback`,
                metadata: {
                    purpose: 'shoot_your_shot',
                    shotId: shot.id,
                    shooterName,
                    targetName,
                    targetPhone
                }
            }
        })

        if (!paystackResponse.status) {
            throw new Error(paystackResponse.message)
        }

        // Save payment reference to shot record
        await supabase
            .from('shots')
            .update({ payment_ref: paystackResponse.data.reference })
            .eq('id', shot.id)

        // Also create a payments record
        await supabase
            .from('payments')
            .insert({
                amount: shotFee,
                currency: 'GHS',
                provider: 'paystack',
                provider_ref: paystackResponse.data.reference,
                purpose: 'shoot_your_shot',
                status: 'pending',
                metadata: {
                    purpose: 'shoot_your_shot',
                    shotId: shot.id,
                    shooterName,
                    shooterEmail,
                    targetName
                }
            })

        return {
            success: true,
            shotId: shot.id,
            paymentUrl: paystackResponse.data.authorization_url,
            reference: paystackResponse.data.reference
        }
    } catch (err: any) {
        if (err.statusCode) throw err
        console.error('[Shot] Error:', err)
        throw createError({ statusCode: 500, message: 'Something went wrong' })
    }
})
