import { createClient } from '@supabase/supabase-js'
import { notifyPaymentInitiated } from '~/server/utils/discord'
import { fetchEventBookingContext, formatPaymentEmail, getEventTicketPrice, getEventBucketByGender, getEventAvailabilitySnapshot, resolveEventUserId } from '~/server/utils/events'

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({} as Record<string, any>))
  const eventId = String(body.eventId || '')

  if (!eventId) {
    throw createError({ statusCode: 400, statusMessage: 'eventId is required' })
  }

  const userId = await resolveEventUserId(event, body)
  if (!userId || userId === 'undefined') {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const config = useRuntimeConfig()
  const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey, {
    db: { schema: 'm2m' }
  })

  const { profile, event: eventRow, existingBooking } = await fetchEventBookingContext(supabase as any, {
    eventId,
    userId
  })

  if (!profile) {
    throw createError({ statusCode: 400, statusMessage: 'Your profile must be set up before booking an event' })
  }

  // Already booked — redirect to ticket
  if (existingBooking?.status === 'confirmed' || existingBooking?.status === 'checked_in') {
    return {
      success: true,
      alreadyBooked: true,
      bookingStatus: existingBooking.status,
      redirectTo: `/me/tickets/${eventId}`
    }
  }

  // Check availability for this gender bucket
  const bucket = getEventBucketByGender(profile.gender)
  if (!bucket) {
    throw createError({ statusCode: 400, statusMessage: 'Please complete your gender on your profile before booking an event' })
  }

  const snapshot = await getEventAvailabilitySnapshot(supabase as any, { eventId })
  const capacity = bucket === 'female'
    ? (eventRow.female_capacity || 0)
    : (eventRow.male_capacity || 0)
  const reserved = bucket === 'female' ? snapshot.femaleReserved : snapshot.maleReserved
  const waitlisted = bucket === 'female' ? snapshot.femaleWaitlisted : snapshot.maleWaitlisted

  // If the event is full or in waitlist-only mode, add to waitlist
  const isFull = reserved >= capacity || eventRow.status === 'sold_out' || eventRow.status === 'waitlist' || waitlisted > 0
  if (isFull) {
    // Upsert a waitlist entry
    if (existingBooking?.status === 'waitlisted') {
      return {
        success: true,
        waitlisted: true,
        bookingStatus: 'waitlisted',
        message: 'You are still on the waitlist. We will notify you when a spot opens.'
      }
    }

    if (existingBooking) {
      await supabase
        .from('event_bookings')
        .update({ status: 'waitlisted', updated_at: new Date().toISOString() })
        .eq('id', existingBooking.id)
    } else {
      await supabase
        .from('event_bookings')
        .insert({ event_id: eventId, user_id: userId, status: 'waitlisted' })
    }

    return {
      success: true,
      waitlisted: true,
      bookingStatus: 'waitlisted',
      message: 'This session is currently full. You have been added to the waitlist.'
    }
  }

  // Spots available — initialize Paystack payment directly (no pending booking)
  const amount = getEventTicketPrice(eventRow, profile.gender)
  const paymentEmail = formatPaymentEmail(profile.phone)
  const callbackUrl = `${config.public.baseUrl}/payment/callback`

  const paystackResponse = await $fetch<{
    status: boolean
    message: string
    data: { authorization_url: string; access_code: string; reference: string }
  }>('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.paystackSecretKey}`,
      'Content-Type': 'application/json'
    },
    body: {
      email: paymentEmail,
      amount: Math.round(amount * 100),
      currency: 'GHS',
      callback_url: callbackUrl,
      metadata: {
        purpose: 'event_ticket',
        userId,
        eventId
      }
    }
  })

  if (!paystackResponse.status) {
    throw createError({ statusCode: 502, statusMessage: paystackResponse.message || 'Failed to initialize payment' })
  }

  // Create payment record (pending) — but NO pending booking row
  const { error: paymentInsertError } = await supabase
    .from('payments')
    .insert({
      user_id: userId,
      amount,
      currency: 'GHS',
      provider: 'paystack',
      provider_ref: paystackResponse.data.reference,
      purpose: 'event_ticket',
      status: 'pending',
      metadata: { purpose: 'event_ticket', userId, eventId }
    })

  if (paymentInsertError) {
    throw createError({ statusCode: 500, statusMessage: paymentInsertError.message })
  }

  await notifyPaymentInitiated({
    amount,
    currency: 'GHS',
    purpose: 'event_ticket',
    userEmail: paymentEmail,
    reference: paystackResponse.data.reference
  })

  return {
    success: true,
    bookingStatus: 'awaiting_payment',
    amount,
    authorization_url: paystackResponse.data.authorization_url,
    reference: paystackResponse.data.reference
  }
})
