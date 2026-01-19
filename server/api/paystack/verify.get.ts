/**
 * Paystack Payment Verification
 * GET /api/paystack/verify?reference=xxx
 * 
 * Verifies a payment status and updates database records
 */

import { serverSupabaseClient } from '#supabase/server'

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
    const supabase = await serverSupabaseClient(event)

    try {
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

        const paymentSuccess = response.data.status === 'success'
        const metadata = response.data.metadata || {}

        // Update payment record in database
        const { data: paymentRecord } = await supabase
            .from('payments')
            .update({
                status: paymentSuccess ? 'success' : 'failed',
                provider_response: response.data
            })
            .eq('provider_ref', reference)
            .select()
            .single()

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
                // Get match details
                const { data: match } = await supabase
                    .from('matches')
                    .select('user_1_id, user_2_id, user_1_paid, user_2_paid')
                    .eq('id', metadata.matchId)
                    .single()

                if (match) {
                    // Determine which user paid
                    const isUser1 = match.user_1_id === metadata.userId
                    const updateData: any = {}

                    if (isUser1) {
                        updateData.user_1_paid = true
                    } else {
                        updateData.user_2_paid = true
                    }

                    // Check if both have now paid
                    const bothPaid = (isUser1 && match.user_2_paid) || (!isUser1 && match.user_1_paid)
                    if (bothPaid) {
                        updateData.status = 'unlocked'
                    } else {
                        updateData.status = 'partial_payment'
                    }

                    await supabase
                        .from('matches')
                        .update(updateData)
                        .eq('id', metadata.matchId)
                }
            }
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
        throw createError({
            statusCode: 500,
            message: 'Failed to verify payment'
        })
    }
})
