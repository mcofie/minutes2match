/**
 * Paystack Payment Initialization
 * POST /api/paystack/initialize
 * 
 * Initializes a Paystack transaction and returns authorization URL
 */

import { createClient } from '@supabase/supabase-js'

interface InitializePaymentBody {
    email: string
    amount: number // Amount in GHS (cedis)
    callback_url?: string
    metadata?: {
        purpose: 'event_ticket' | 'match_unlock' | 'subscription'
        userId?: string
        eventId?: string
        matchId?: string
    }
}

export default defineEventHandler(async (event) => {
    console.log('[Paystack] Initialize payment request received')
    const body = await readBody<InitializePaymentBody>(event)
    console.log('[Paystack] Request body:', { email: body.email, amount: body.amount, metadata: body.metadata })

    if (!body.email || !body.amount) {
        throw createError({
            statusCode: 400,
            message: 'Missing required fields: email, amount'
        })
    }

    const config = useRuntimeConfig()

    if (!config.paystackSecretKey) {
        throw createError({
            statusCode: 500,
            message: 'Paystack credentials not configured'
        })
    }

    // Debug: Log key info (only prefix for security)
    console.log('[Paystack] Key prefix:', config.paystackSecretKey.substring(0, 10) + '...')
    console.log('[Paystack] Key length:', config.paystackSecretKey.length)


    // Check for "First Match Free" or "Active Subscription" eligibility
    if (body.metadata?.purpose === 'match_unlock' && body.metadata.userId && body.metadata.matchId) {
        try {
            const supabaseUrl = config.supabaseUrl
            const supabaseServiceKey = config.supabaseServiceKey
            const supabase = createClient(supabaseUrl, supabaseServiceKey, {
                db: { schema: 'm2m' }
            })

            // Fetch user profile and subscription status
            const { data: profile } = await supabase
                .from('profiles')
                .select('has_used_free_unlock')
                .eq('id', body.metadata.userId)
                .single()

            const { data: subscription } = await supabase
                .from('subscriptions')
                .select('status, end_date')
                .eq('user_id', body.metadata.userId)
                .eq('status', 'active')
                .gt('end_date', new Date().toISOString())
                .maybeSingle()

            // 1. Check Subscription
            if (subscription) {
                console.log(`[Paystack] User ${body.metadata.userId} has active subscription. Unlocking match ${body.metadata.matchId} immediately.`)
                await unlockMatch(body.metadata.matchId, body.metadata.userId)
                return {
                    status: true,
                    message: 'Match unlocked via subscription',
                    data: {
                        authorization_url: `${config.public.baseUrl}/me?unlocked=true`, // Redirect back to profile
                        access_code: 'SUBSCRIPTION_UNLOCK',
                        reference: `SUB_UNLOCK_${Date.now()}`
                    },
                    type: 'subscription_unlock'
                }
            }

            // 2. Check First Match Free
            if (profile && !profile.has_used_free_unlock) {
                console.log(`[Paystack] User ${body.metadata.userId} using First Match Free. Unlocking match ${body.metadata.matchId} immediately.`)

                // Unlock match
                await unlockMatch(body.metadata.matchId, body.metadata.userId)

                // Mark free unlock as used
                await supabase
                    .from('profiles')
                    .update({ has_used_free_unlock: true })
                    .eq('id', body.metadata.userId)

                return {
                    status: true,
                    message: 'Match unlocked via free trial',
                    data: {
                        authorization_url: `${config.public.baseUrl}/me?unlocked=true`, // Redirect back to profile
                        access_code: 'FREE_UNLOCK',
                        reference: `FREE_UNLOCK_${Date.now()}`
                    },
                    type: 'free_unlock'
                }
            }
        } catch (error) {
            console.error('[Paystack] Error checking unlock eligibility:', error)
            // Continue to normal payment flow if check fails
        }
    }

    try {
        const response = await $fetch<{
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
                email: body.email,
                amount: Math.round(body.amount * 100), // Convert to pesewas
                currency: 'GHS',
                callback_url: body.callback_url || `${config.public.baseUrl}/payment/callback`,
                metadata: body.metadata
            }
        })

        if (!response.status) {
            throw new Error(response.message)
        }

        const paymentData = {
            authorization_url: response.data.authorization_url,
            reference: response.data.reference,
            access_code: response.data.access_code
        }

        // Create pending payment record immediately using service role
        // This MUST succeed before user is redirected to Paystack
        const supabaseUrl = config.supabaseUrl
        const supabaseServiceKey = config.supabaseServiceKey

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('[Paystack] Missing Supabase configuration - supabaseUrl:', !!supabaseUrl, 'supabaseServiceKey:', !!supabaseServiceKey)
            throw createError({
                statusCode: 500,
                message: 'Server configuration error: Supabase not configured'
            })
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            db: { schema: 'm2m' }
        })

        const { error: insertError } = await supabase
            .from('payments')
            .insert({
                user_id: body.metadata?.userId,
                amount: body.amount,
                currency: 'GHS',
                provider: 'paystack',
                provider_ref: paymentData.reference,
                purpose: body.metadata?.purpose || 'match_unlock', // 'subscription' will pass through here if strictly typed in DB constraint? Need to update DB constraint check?
                status: 'pending',
                metadata: body.metadata
            })

        if (insertError) {
            console.error('[Paystack] Failed to create payment record:', insertError)
            throw createError({
                statusCode: 500,
                message: 'Failed to create payment record'
            })
        }
        console.log('[Paystack] Created pending payment record:', paymentData.reference)

        return paymentData
    } catch (error: any) {
        console.error('Paystack Initialize Error:', {
            message: error.message,
            data: error.data,
            statusCode: error.statusCode,
            body: {
                email: body.email,
                amount: body.amount,
                metadata: body.metadata
            }
        })
        throw createError({
            statusCode: 500,
            message: `Failed to initialize payment: ${error.data?.message || error.message || 'Unknown error'}`
        })
    }
})

