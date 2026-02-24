/**
 * Paystack Payment Verification
 * GET /api/paystack/verify?reference=xxx
 * 
 * Verifies a payment status and updates database records
 * Uses service role client to bypass RLS
 */

import { serverSupabaseServiceRole } from '#supabase/server'
import type { M2MDatabase } from '~/types/database.types'

interface PaystackResponse {
    status: boolean
    message: string
    data: {
        status: string
        reference: string
        amount: number
        currency: string
        metadata: any
    }
}

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const reference = query.reference as string

    if (!reference) {
        throw createError({
            statusCode: 400,
            message: 'Missing reference parameter'
        })
    }

    const config = useRuntimeConfig()
    const supabase = serverSupabaseServiceRole<M2MDatabase>(event)

    console.log('[Verify] Processing payment verification for reference:', reference)

    try {
        // IDEMPOTENCY CHECK: Check if payment was already processed
        // We use .schema('m2m') explicitly to be safe, though config says it's default
        const { data: existingPayment } = await supabase
            .schema('m2m')
            .from('payments')
            .select('id, status, metadata')
            .eq('provider_ref', reference)
            .maybeSingle()

        if (existingPayment?.status === 'success') {
            console.log('[Verify] Payment already processed, returning cached result')
            return {
                status: 'success',
                reference,
                message: 'Payment already processed',
                alreadyProcessed: true,
                metadata: existingPayment.metadata
            }
        }

        // Verify with Paystack
        const response = await $fetch<PaystackResponse>(`https://api.paystack.co/transaction/verify/${reference}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${config.paystackSecretKey}`
            }
        })

        console.log('[Verify] Paystack response:', response.data.status, 'Amount:', response.data.amount)

        const paymentSuccess = response.data.status === 'success'
        const metadata = response.data.metadata || {}

        console.log('[Verify] Metadata:', JSON.stringify(metadata))

        // First check if payment record exists (for upsert)
        const { data: paymentRecord } = await supabase
            .schema('m2m')
            .from('payments')
            .select('id, status')
            .eq('provider_ref', reference)
            .maybeSingle()

        if (paymentRecord) {
            // Update existing record
            await supabase
                .schema('m2m')
                .from('payments')
                .update({
                    status: (paymentSuccess ? 'success' : 'failed') as any
                })
                .eq('id', paymentRecord.id)
        } else {
            // Create new record
            await supabase
                .schema('m2m')
                .from('payments')
                .insert({
                    user_id: metadata.userId,
                    amount: response.data.amount / 100,
                    currency: response.data.currency || 'GHS',
                    provider: 'paystack',
                    provider_ref: reference,
                    purpose: metadata.purpose || 'match_unlock',
                    status: (paymentSuccess ? 'success' : 'failed') as any,
                    metadata: { ...metadata, paystack_response: response.data }
                })
        }

        // Handle specific purposes
        if (paymentSuccess && metadata.purpose) {
            if (metadata.purpose === 'event_ticket' && metadata.eventId) {
                await supabase
                    .schema('m2m')
                    .from('event_bookings')
                    .update({ status: 'confirmed' })
                    .eq('event_id', metadata.eventId)
                    .eq('user_id', metadata.userId)
                    .eq('status', 'pending')

            } else if (metadata.purpose === 'match_unlock' && metadata.matchId) {
                const { data: match } = await supabase
                    .schema('m2m')
                    .from('matches')
                    .select('user_1_id, user_2_id, user_1_paid, user_2_paid')
                    .eq('id', metadata.matchId)
                    .single()

                if (match) {
                    const isUser1 = match.user_1_id === metadata.userId
                    const otherUserId = isUser1 ? match.user_2_id : match.user_1_id
                    const updateData: any = {}

                    if (isUser1) {
                        updateData.user_1_paid = true
                        updateData.user_1_paid_at = new Date().toISOString()
                    } else {
                        updateData.user_2_paid = true
                        updateData.user_2_paid_at = new Date().toISOString()
                    }

                    const user1Paid = isUser1 ? true : match.user_1_paid
                    const user2Paid = isUser1 ? match.user_2_paid : true

                    if (user1Paid && user2Paid) {
                        updateData.status = 'unlocked'
                    } else {
                        updateData.status = 'partial_payment'
                        const exp = new Date()
                        exp.setHours(exp.getHours() + 72)
                        updateData.expires_at = exp.toISOString()

                        // SMS nudge
                        try {
                            const { data: otherUser } = await supabase
                                .schema('m2m')
                                .from('profiles')
                                .select('phone')
                                .eq('id', otherUserId)
                                .single()

                            if (otherUser?.phone) {
                                await $fetch('/api/send-sms', {
                                    method: 'POST',
                                    baseURL: config.public?.baseUrl || 'http://localhost:3000',
                                    body: { to: otherUser.phone, message: 'Someone paid to connect with you! Check out minutes2match.com/me' }
                                }).catch(() => { })
                            }
                        } catch { }
                    }

                    await supabase
                        .schema('m2m')
                        .from('matches')
                        .update(updateData)
                        .eq('id', metadata.matchId)
                }
            } else if (metadata.purpose === 'subscription') {
                const { data: existingSub } = await supabase
                    .schema('m2m')
                    .from('subscriptions')
                    .select('id, end_date')
                    .eq('user_id', metadata.userId)
                    .eq('status', 'active')
                    .gt('end_date', new Date().toISOString())
                    .maybeSingle()

                const end = new Date()
                end.setMonth(end.getMonth() + 1)

                if (existingSub) {
                    const nextEnd = new Date(existingSub.end_date)
                    nextEnd.setMonth(nextEnd.getMonth() + 1)
                    await supabase
                        .schema('m2m')
                        .from('subscriptions')
                        .update({ end_date: nextEnd.toISOString() })
                        .eq('id', existingSub.id)
                } else {
                    await supabase
                        .schema('m2m')
                        .from('subscriptions')
                        .insert({
                            user_id: metadata.userId,
                            status: 'active',
                            start_date: new Date().toISOString(),
                            end_date: end.toISOString(),
                            auto_renew: false
                        })
                }
            }
        }

        if (!paymentSuccess) {
            await supabase.schema('m2m').from('payment_alerts').insert({
                payment_ref: reference,
                user_id: metadata.userId,
                amount: response.data.amount / 100,
                purpose: metadata.purpose,
                error_message: response.data.status,
                alert_type: 'payment_failed',
                resolved: false
            })
        }

        return {
            status: paymentSuccess ? 'success' : 'failed',
            reference: response.data.reference,
            amount: response.data.amount / 100,
            currency: response.data.currency,
            metadata: response.data.metadata
        }

    } catch (error: any) {
        console.error('Verify Error:', error)
        throw createError({ statusCode: 500, message: 'Verification failed' })
    }
})
