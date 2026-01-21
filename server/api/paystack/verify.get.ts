/**
 * Paystack Payment Verification
 * GET /api/paystack/verify?reference=xxx
 * 
 * Verifies a payment status and updates database records
 * Uses service role client to bypass RLS
 */

import { createClient } from '@supabase/supabase-js'

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

    // Use service role client to bypass RLS for payment updates
    const supabaseUrl = config.supabaseUrl
    const supabaseServiceKey = config.supabaseServiceKey

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('[Verify] Missing Supabase configuration')
        throw createError({
            statusCode: 500,
            message: 'Server configuration error'
        })
    }

    // Create client with m2m schema
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        db: { schema: 'm2m' }
    })

    console.log('[Verify] Processing payment verification for reference:', reference)

    try {
        // IDEMPOTENCY CHECK: Check if payment was already processed
        const { data: existingPayment } = await supabase
            .from('payments')
            .select('id, status')
            .eq('provider_ref', reference)
            .single()

        if (existingPayment?.status === 'success') {
            console.log('[Verify] Payment already processed, returning cached result')
            return {
                status: 'success',
                reference,
                message: 'Payment already processed',
                alreadyProcessed: true
            }
        }

        // Verify with Paystack
        const response = await $fetch<{
            status: boolean
            message: string
            data: {
                status: string
                reference: string
                amount: number
                currency: string
                metadata: any
            }
        }>(`https://api.paystack.co/transaction/verify/${reference}`, {
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
        const { data: paymentRecord, error: fetchError } = await supabase
            .from('payments')
            .select('id, status')
            .eq('provider_ref', reference)
            .maybeSingle()

        if (fetchError) {
            console.error('[Verify] Error fetching payment record:', fetchError)
        }

        let paymentRecordId = paymentRecord?.id

        if (paymentRecord) {
            // Update existing record
            const { error: updateError } = await supabase
                .from('payments')
                .update({
                    status: paymentSuccess ? 'success' : 'failed'
                })
                .eq('id', paymentRecord.id)

            if (updateError) {
                console.error('[Verify] Failed to update payment record:', updateError)
            } else {
                console.log('[Verify] Payment record updated:', paymentRecord.id)
            }
        } else {
            // Create new record if it doesn't exist
            console.log('[Verify] No existing payment record found, creating one')
            const { data: newPayment, error: insertError } = await supabase
                .from('payments')
                .insert({
                    user_id: metadata.userId,
                    amount: response.data.amount / 100, // Convert from pesewas to cedis
                    currency: response.data.currency || 'GHS',
                    provider: 'paystack',
                    provider_ref: reference,
                    purpose: metadata.purpose || 'match_unlock',
                    status: paymentSuccess ? 'success' : 'failed',
                    metadata: { ...metadata, paystack_response: response.data }
                })
                .select()
                .single()

            if (insertError) {
                console.error('[Verify] Failed to create payment record:', insertError)
            } else {
                paymentRecordId = newPayment?.id
                console.log('[Verify] Payment record CREATED:', paymentRecordId)
            }
        }

        // If payment successful, handle the purpose-specific logic
        if (paymentSuccess && metadata.purpose) {
            if (metadata.purpose === 'event_ticket' && metadata.eventId) {
                // Update event booking to confirmed - this triggers the ticket count update
                const { error: bookingError } = await supabase
                    .from('event_bookings')
                    .update({ status: 'confirmed' })
                    .eq('event_id', metadata.eventId)
                    .eq('user_id', metadata.userId)
                    .eq('status', 'pending')

                if (bookingError) {
                    console.error('Failed to update booking:', bookingError)
                } else {
                    console.log('Event booking confirmed for user:', metadata.userId, 'event:', metadata.eventId)
                }

            } else if (metadata.purpose === 'match_unlock' && metadata.matchId) {
                // Get match details with user profiles
                const { data: match } = await supabase
                    .from('matches')
                    .select('user_1_id, user_2_id, user_1_paid, user_2_paid')
                    .eq('id', metadata.matchId)
                    .single()

                if (match) {
                    // Determine which user paid
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

                    // Check if both have now paid
                    const bothPaid = (isUser1 && match.user_2_paid) || (!isUser1 && match.user_1_paid)

                    if (bothPaid) {
                        updateData.status = 'unlocked'
                        console.log('[Match Unlock] Both users have paid, unlocking match:', metadata.matchId)
                    } else {
                        // First payment - set partial payment status and expiration
                        updateData.status = 'partial_payment'
                        // Set expiration to 72 hours from now
                        const expirationDate = new Date()
                        expirationDate.setHours(expirationDate.getHours() + 72)
                        updateData.expires_at = expirationDate.toISOString()
                        console.log('[Match Unlock] First payment, setting partial_payment status:', metadata.matchId)

                        // Send SMS nudge to the other user
                        try {
                            // Get other user's profile
                            const { data: otherUser } = await supabase
                                .from('profiles')
                                .select('phone, display_name')
                                .eq('id', otherUserId)
                                .single()

                            if (otherUser?.phone) {
                                const smsMessage = `Someone just paid to connect with you on Minutes2Match! 💕 Log in now to see who and unlock them back. Match expires in 72 hours. https://minutes2match.com/me`

                                // Send SMS via our API endpoint
                                await $fetch('/api/send-sms', {
                                    method: 'POST',
                                    baseURL: config.public?.baseUrl || 'http://localhost:3000',
                                    body: {
                                        to: otherUser.phone,
                                        message: smsMessage
                                    }
                                }).catch(err => {
                                    console.error('Failed to send match SMS:', err)
                                })
                            }
                        } catch (smsError) {
                            console.error('Error sending match notification SMS:', smsError)
                            // Don't fail the payment if SMS fails
                        }
                    }

                    // ALWAYS update the match record
                    console.log('[Match Unlock] Updating match:', metadata.matchId, 'with data:', updateData)

                    const { error: updateError } = await supabase
                        .from('matches')
                        .update(updateData)
                        .eq('id', metadata.matchId)

                    if (updateError) {
                        console.error('[Match Unlock] Failed to update match:', updateError)
                    } else {
                        console.log('[Match Unlock] Match updated successfully:', metadata.matchId, 'New status:', updateData.status)
                    }
                } else {
                    console.error('[Match Unlock] Match not found:', metadata.matchId)
                }
            }
        }

        // Log failed payments for admin alerts
        if (!paymentSuccess) {
            await supabase.from('payment_alerts').insert({
                payment_ref: reference,
                user_id: metadata.userId,
                amount: response.data.amount / 100,
                purpose: metadata.purpose,
                error_message: response.data.status,
                alert_type: 'payment_failed',
                resolved: false
            }).catch(err => console.error('[Verify] Failed to log payment alert:', err))
        }

        return {
            status: paymentSuccess ? 'success' : 'failed',
            reference: response.data.reference,
            amount: response.data.amount / 100, // Convert back to GHS
            currency: response.data.currency,
            metadata: response.data.metadata
        }
    } catch (error: any) {
        console.error('Paystack Verify Error:', error)

        // Log critical errors for admin
        await supabase.from('payment_alerts').insert({
            payment_ref: reference,
            error_message: error.message || 'Unknown error',
            alert_type: 'verification_error',
            resolved: false
        }).catch(() => { })

        throw createError({
            statusCode: 500,
            message: 'Failed to verify payment'
        })
    }
})
