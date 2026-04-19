/**
 * Paystack Payment Initialization
 * POST /api/paystack/initialize
 * 
 * Initializes a Paystack transaction and returns authorization URL
 */

import { createClient } from '@supabase/supabase-js'
import { notifyPaymentInitiated, notifyFlashLobbySuperConnectCompleted, notifyMatchUnlocked } from '~/server/utils/discord'
import { fullyUnlockMatch, unlockMatch } from '~/server/utils/match'

interface InitializePaymentBody {
    email: string
    amount: number // Amount in GHS (cedis)
    callback_url?: string
    metadata?: {
        purpose: 'event_ticket' | 'match_unlock' | 'subscription' | 'shoot_your_shot' | 'spark_deck' | 'wallet_topup'
        userId?: string
        eventId?: string
        matchId?: string
        shippingDetails?: {
           name: string
           phone: string
           address: string
        }
        superConnect?: boolean
        unlockBoth?: boolean
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

    // Initialize Supabase for eligibility checks
    const supabaseUrl = config.supabaseUrl
    const supabaseServiceKey = config.supabaseServiceKey
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        db: { schema: 'm2m' }
    })

    // Check for "Active Subscription", wallet credits, or "First Match Free" eligibility
    if (body.metadata?.purpose === 'match_unlock' && body.metadata.userId && body.metadata.matchId) {
        try {
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
                console.log(`[Paystack] User ${body.metadata.userId} has active subscription. Resolving match ${body.metadata.matchId} immediately.`)
                if (body.metadata.unlockBoth || body.metadata.superConnect) {
                    await fullyUnlockMatch(body.metadata.matchId, body.metadata.userId, 0)

                    const { data: match } = await supabase
                        .from('matches')
                        .select(`
                            id,
                            user_1_id,
                            user_2_id,
                            user_1:profiles!matches_user_1_id_fkey(display_name),
                            user_2:profiles!matches_user_2_id_fkey(display_name)
                        `)
                        .eq('id', body.metadata.matchId)
                        .maybeSingle()

                    if (match) {
                        await notifyMatchUnlocked({
                            user1Name: (match as any).user_1?.display_name || 'User 1',
                            user2Name: (match as any).user_2?.display_name || 'User 2',
                            matchId: body.metadata.matchId,
                            fullyUnlocked: true
                        })

                        if (body.metadata.superConnect) {
                            await notifyFlashLobbySuperConnectCompleted({
                                senderName: match.user_1_id === body.metadata.userId
                                    ? ((match as any).user_1?.display_name || 'Someone')
                                    : ((match as any).user_2?.display_name || 'Someone'),
                                receiverName: match.user_1_id === body.metadata.userId
                                    ? ((match as any).user_2?.display_name || 'Someone')
                                    : ((match as any).user_1?.display_name || 'Someone'),
                                lobbyName: 'Flash Lobby',
                                matchId: body.metadata.matchId
                            })
                        }
                    }
                } else {
                    await unlockMatch(body.metadata.matchId, body.metadata.userId, 0)
                }
                return {
                    status: true,
                    message: 'Match unlocked via subscription',
                    data: {
                        authorization_url: `${config.public.baseUrl}/me/connection/${body.metadata.matchId}?unlocked=true`,
                        access_code: 'SUBSCRIPTION_UNLOCK',
                        reference: `SUB_UNLOCK_${Date.now()}`
                    },
                    type: 'subscription_unlock'
                }
            }

            if (!body.metadata.superConnect) {
                // 2. Check M2M Credit Balance
                const { getUserBalance, debitUser } = await import('~/server/utils/credits')
                const creditBalance = await getUserBalance(body.metadata.userId)

                if (creditBalance >= body.amount) {
                    console.log(`[Paystack] User ${body.metadata.userId} using M2M Credit (GHS ${creditBalance}). Unlocking match ${body.metadata.matchId} immediately.`)

                    // Debit credits
                    const debitResult = await debitUser(
                        body.metadata.userId,
                        body.amount,
                        'match_unlock_spend',
                        body.metadata.matchId,
                        `Match unlock via M2M Credit`
                    )

                    if (debitResult.success) {
                        if (body.metadata.unlockBoth) {
                            await fullyUnlockMatch(body.metadata.matchId, body.metadata.userId, body.amount)
                        } else {
                            await unlockMatch(body.metadata.matchId, body.metadata.userId, body.amount)
                        }
                        return {
                            status: true,
                            message: `Match unlocked via M2M Credit. Remaining balance: GHS ${debitResult.newBalance}`,
                            data: {
                                authorization_url: `${config.public.baseUrl}/me/connection/${body.metadata.matchId}?unlocked=true`,
                                access_code: 'CREDIT_UNLOCK',
                                reference: `CREDIT_UNLOCK_${Date.now()}`
                            },
                            type: 'credit_unlock',
                            creditBalance: debitResult.newBalance
                        }
                    }
                    // If debit failed, fall through to normal payment
                    console.warn('[Paystack] Credit debit failed, falling through to payment:', debitResult.error)
                }

                // 3. Check First Match Free
                if (profile && !profile.has_used_free_unlock) {
                    console.log(`[Paystack] User ${body.metadata.userId} using First Match Free. Unlocking match ${body.metadata.matchId} immediately.`)

                    // Unlock match (amount = 0)
                    if (body.metadata.unlockBoth) {
                        await fullyUnlockMatch(body.metadata.matchId, body.metadata.userId, 0)
                    } else {
                        await unlockMatch(body.metadata.matchId, body.metadata.userId, 0)
                    }

                    // Mark free unlock as used
                    await supabase
                        .from('profiles')
                        .update({ has_used_free_unlock: true })
                        .eq('id', body.metadata.userId)

                    return {
                        status: true,
                        message: 'Match unlocked via free trial',
                        data: {
                            authorization_url: `${config.public.baseUrl}/me/connection/${body.metadata.matchId}?unlocked=true`,
                            access_code: 'FREE_UNLOCK',
                            reference: `FREE_UNLOCK_${Date.now()}`
                        },
                        type: 'free_unlock'
                    }
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

        // Robust User ID Resolution: Ensure we have a userId before creating the payment record
        let targetUserId = body.metadata?.userId

        if (!targetUserId && body.email) {
            console.log('[Paystack] Missing userId in metadata, attempting lookup by email:', body.email)
            try {
                // Use the auth.admin API (available with service role key) to find the user
                const { data: userData } = await (supabase.auth.admin as any).getUserByEmail(body.email)
                if (userData?.user?.id) {
                    targetUserId = userData.user.id
                    console.log('[Paystack] Resolved userId from email:', targetUserId)
                    if (!body.metadata) body.metadata = { purpose: 'match_unlock' }
                    body.metadata.userId = targetUserId
                }
            } catch (authErr) {
                console.error('[Paystack] Unexpected error during auth lookup:', authErr)
            }
        }

        // Fallback: resolve userId from phone number embedded in synthetic email (e.g. 233XXXXXXXXX@m2match.com)
        if (!targetUserId && body.email?.includes('@m2match.com')) {
            const phonePart = body.email.split('@')[0]?.replace(/\D/g, '')
            if (phonePart && phonePart.length >= 10) {
                const { data: profileByPhone } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('phone', `+${phonePart}`)
                    .maybeSingle()
                if (profileByPhone?.id) {
                    targetUserId = profileByPhone.id
                    console.log('[Paystack] Resolved userId from phone in email:', targetUserId)
                    if (!body.metadata) body.metadata = { purpose: 'match_unlock' }
                    body.metadata.userId = targetUserId
                }
            }
        }

        const { error: insertError } = await supabase
            .from('payments')
            .insert({
                user_id: targetUserId,
                amount: body.amount,
                currency: 'GHS',
                provider: 'paystack',
                provider_ref: paymentData.reference,
                purpose: body.metadata?.purpose || 'match_unlock',
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
        
        // Notify Discord about the initiated payment
        await notifyPaymentInitiated({
            amount: body.amount,
            currency: 'GHS',
            purpose: body.metadata?.purpose || 'match_unlock',
            userEmail: body.email,
            reference: paymentData.reference,
            shippingDetails: body.metadata?.shippingDetails
        })

        return paymentData
    } catch (error: any) {
        console.error('Paystack Initialize Error:', error)
        throw createError({
            statusCode: 500,
            message: `Failed to initialize payment: ${error.data?.message || error.message || 'Unknown error'}`
        })
    }
})
