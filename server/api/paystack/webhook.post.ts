/**
 * Paystack Webhook Handler
 * POST /api/paystack/webhook
 * 
 * Handles Paystack webhook events for payment confirmation
 * Updates database records on successful payment
 * 
 * Key Features:
 * - Event ticket booking confirmation
 * - Match unlock with MUTUAL PAYMENT REQUIREMENT
 *   (match only unlocks when BOTH users have paid)
 * - SMS reminder to unpaid user when partner pays
 */

import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()

    console.log('[Webhook] Received Paystack webhook request')

    // Get raw body for signature verification
    const rawBody = await readRawBody(event)

    if (!rawBody) {
        console.error('[Webhook] Empty request body')
        throw createError({
            statusCode: 400,
            message: 'Empty request body'
        })
    }

    console.log('[Webhook] Body received, length:', rawBody.length)

    // Verify webhook signature
    const signature = getHeader(event, 'x-paystack-signature')

    if (!signature) {
        console.error('[Webhook] Missing x-paystack-signature header')
        throw createError({
            statusCode: 401,
            message: 'Missing signature'
        })
    }

    const hash = crypto
        .createHmac('sha512', config.paystackSecretKey)
        .update(rawBody)
        .digest('hex')

    if (hash !== signature) {
        console.error('[Webhook] Signature mismatch')
        console.error('[Webhook] Expected:', hash.substring(0, 20) + '...')
        console.error('[Webhook] Received:', signature.substring(0, 20) + '...')
        throw createError({
            statusCode: 401,
            message: 'Invalid signature'
        })
    }

    console.log('[Webhook] Signature verified successfully')

    let body: any
    try {
        body = JSON.parse(rawBody)
    } catch (parseError) {
        console.error('[Webhook] Failed to parse JSON:', parseError)
        throw createError({
            statusCode: 400,
            message: 'Invalid JSON body'
        })
    }

    console.log('[Webhook] Event type:', body.event)

    // Only handle successful charges
    if (body.event !== 'charge.success') {
        console.log('[Webhook] Ignoring non-charge.success event')
        return { received: true, processed: false }
    }

    const data = body.data
    const metadata = data.metadata || {}

    console.log('[Webhook] Processing charge.success for reference:', data.reference)
    console.log('[Webhook] Metadata:', JSON.stringify(metadata))

    // Initialize Supabase with service role for bypassing RLS
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = config.supabaseServiceKey

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('[Webhook] Missing Supabase configuration')
        throw createError({
            statusCode: 500,
            message: 'Server configuration error'
        })
    }
    // Create client with m2m schema
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        db: { schema: 'm2m' }
    })

    try {
        // Update payment record
        const { error: paymentError } = await supabase
            .from('payments')
            .update({
                status: 'success',
                provider_response: data
            })
            .eq('provider_ref', data.reference)

        if (paymentError) {
            console.error('[Webhook] Failed to update payment:', paymentError)
        } else {
            console.log('[Webhook] Payment record updated to success')
        }

        // Handle based on purpose
        if (metadata.purpose === 'event_ticket') {
            console.log('[Webhook] Processing event_ticket payment')
            await handleEventTicketPayment(supabase, metadata)
        } else if (metadata.purpose === 'match_unlock') {
            console.log('[Webhook] Processing match_unlock payment')
            await handleMatchUnlockPayment(supabase, metadata, config)
        } else {
            console.log('[Webhook] Unknown or missing purpose:', metadata.purpose)
        }

        console.log('[Webhook] Processing complete, returning success')
        return { received: true, processed: true }
    } catch (error: any) {
        console.error('[Webhook] Processing error:', error)
        throw createError({
            statusCode: 500,
            message: 'Webhook processing failed'
        })
    }
})

/**
 * Handle event ticket payment confirmation
 */
async function handleEventTicketPayment(supabase: any, metadata: any) {
    console.log('[Webhook] Updating event_booking for user:', metadata.userId, 'event:', metadata.eventId)

    const { error: bookingError, data } = await supabase
        .from('event_bookings')
        .update({ status: 'confirmed' })
        .eq('user_id', metadata.userId)
        .eq('event_id', metadata.eventId)
        .eq('status', 'pending')
        .select()

    if (bookingError) {
        console.error('[Webhook] Failed to confirm booking:', bookingError)
    } else {
        console.log('[Webhook] Booking confirmed successfully, rows updated:', data?.length || 0)
    }

    // Note: Ticket count increment is handled by database trigger
}

/**
 * Handle match unlock payment with MUTUAL PAYMENT REQUIREMENT
 * Match is only fully revealed when BOTH users have paid
 */
async function handleMatchUnlockPayment(supabase: any, metadata: any, config: any) {
    const matchId = metadata.matchId
    const payingUserId = metadata.userId

    console.log('[Webhook] Processing match unlock for match:', matchId, 'user:', payingUserId)

    // Fetch current match state
    const { data: match, error: matchFetchError } = await supabase
        .from('matches')
        .select(`
            *,
            user_1:profiles!matches_user_1_id_fkey(id, phone, display_name),
            user_2:profiles!matches_user_2_id_fkey(id, phone, display_name)
        `)
        .eq('id', matchId)
        .single()

    if (matchFetchError || !match) {
        console.error('[Webhook] Failed to fetch match:', matchFetchError)
        return
    }

    // Determine which user is paying
    const isUser1 = match.user_1_id === payingUserId
    const isUser2 = match.user_2_id === payingUserId

    if (!isUser1 && !isUser2) {
        console.error('[Webhook] Paying user not part of this match:', payingUserId, matchId)
        return
    }

    // Prepare update data for the paying user
    const updateData: Record<string, any> = {}

    if (isUser1) {
        updateData.user_1_paid = true
        updateData.user_1_paid_at = new Date().toISOString()
    } else {
        updateData.user_2_paid = true
        updateData.user_2_paid_at = new Date().toISOString()
    }

    // Check if the OTHER user has already paid
    const otherUserPaid = isUser1 ? match.user_2_paid : match.user_1_paid

    if (otherUserPaid) {
        // BOTH users have now paid - FULLY UNLOCK the match
        updateData.status = 'unlocked'
        updateData.unlocked_at = new Date().toISOString()

        console.log(`[Webhook] ✅ Match ${matchId} FULLY UNLOCKED - both users have paid!`)
    } else {
        // Only one user has paid - set to partial_payment
        updateData.status = 'partial_payment'

        console.log(`[Webhook] ⏳ Match ${matchId} PARTIAL - waiting for other user to pay`)

        // Send SMS reminder to the unpaid user
        const unpaidUser = isUser1 ? match.user_2 : match.user_1
        const paidUser = isUser1 ? match.user_1 : match.user_2

        await sendPaymentReminderSMS(unpaidUser, paidUser, config)
    }

    // Update match record
    const { error: matchError } = await supabase
        .from('matches')
        .update(updateData)
        .eq('id', matchId)

    if (matchError) {
        console.error('[Webhook] Failed to update match:', matchError)
    } else {
        console.log('[Webhook] Match updated successfully')
    }
}

/**
 * Send SMS reminder to unpaid user when their match partner has paid
 */
async function sendPaymentReminderSMS(
    unpaidUser: { phone: string; display_name: string | null },
    paidUser: { display_name: string | null },
    config: any
) {
    if (!unpaidUser?.phone) {
        console.warn('[Webhook] Unpaid user has no phone number, skipping SMS')
        return
    }

    const paidUserName = paidUser?.display_name || 'Someone'
    const message = `${paidUserName} has unlocked your match on Minutes2Match! Pay now to see their full profile: ${config.public?.baseUrl || 'https://minutes2match.com'}/me`

    try {
        // Call the SMS API endpoint
        await $fetch('/api/send-sms', {
            method: 'POST',
            body: {
                to: unpaidUser.phone,
                message
            }
        })

        console.log(`[Webhook] 📱 SMS reminder sent to ${unpaidUser.phone}`)
    } catch (smsError) {
        // Log but don't fail the webhook
        console.error('[Webhook] Failed to send SMS reminder:', smsError)
    }
}
