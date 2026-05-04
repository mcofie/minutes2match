import { createClient } from '@supabase/supabase-js'
import { notifyPaymentInitiated } from '~/server/utils/discord'
import { fetchEventBookingContext, formatPaymentEmail, getEventTicketPrice, processEventBookingLifecycle, resolveEventUserId } from '~/server/utils/events'

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

  const { profile, event: eventRow } = await fetchEventBookingContext(supabase as any, {
    eventId,
    userId
  })

  if (!profile) {
    throw createError({ statusCode: 400, statusMessage: 'Your profile must be set up before booking an event' })
  }

  const reservation = await supabase.rpc('reserve_event_booking', {
    p_event_id: eventId,
    p_user_id: userId
  })

  if (reservation.error) {
    throw createError({ statusCode: 500, statusMessage: reservation.error.message })
  }

  const reservedBooking = Array.isArray(reservation.data) ? reservation.data[0] : reservation.data
  const bookingStatus = String(reservedBooking?.booking_status || '')

  if (reservedBooking?.already_booked || bookingStatus === 'confirmed' || bookingStatus === 'checked_in') {
    return {
      success: true,
      alreadyBooked: true,
      bookingStatus,
      redirectTo: `/me/tickets/${eventId}`
    }
  }

  if (bookingStatus === 'waitlisted') {
    return {
      success: true,
      waitlisted: true,
      bookingStatus: 'waitlisted',
      message: 'This session is currently full. You have been added to the waitlist.'
    }
  }

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

  const { data: paymentRecord, error: paymentInsertError } = await supabase
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
    .select('id')
    .single()

  if (paymentInsertError) {
    throw createError({ statusCode: 500, statusMessage: paymentInsertError.message })
  }

  await supabase
    .from('event_bookings')
    .update({ payment_id: paymentRecord.id })
    .eq('id', reservedBooking.booking_id)

  await processEventBookingLifecycle(supabase as any, { eventId })

  await notifyPaymentInitiated({
    amount,
    currency: 'GHS',
    purpose: 'event_ticket',
    userEmail: paymentEmail,
    reference: paystackResponse.data.reference
  })

  return {
    success: true,
    bookingStatus: 'pending',
    amount,
    authorization_url: paystackResponse.data.authorization_url,
    reference: paystackResponse.data.reference
  }
})
