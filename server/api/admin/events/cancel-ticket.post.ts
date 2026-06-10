import { requireAdminAccess } from '~/server/utils/admin'
import { processEventBookingLifecycle } from '~/server/utils/events'
import { sendSMS } from '~/server/utils/sms'

export default defineEventHandler(async (event) => {
  const { client, user } = await requireAdminAccess(event)
  const body = await readBody(event)
  const bookingId = String(body.bookingId || '')
  
  if (!bookingId) {
    throw createError({ statusCode: 400, statusMessage: 'bookingId is required' })
  }

  // Fetch the booking and event details
  const { data: booking, error: bookingError } = await client
    .schema('m2m')
    .from('event_bookings')
    .select(`
      id, 
      event_id, 
      user_id, 
      status,
      profile:profiles!event_bookings_user_id_fkey(id, display_name, phone)
    `)
    .eq('id', bookingId)
    .maybeSingle()

  if (bookingError || !booking) {
    throw createError({ statusCode: 404, statusMessage: 'Booking not found' })
  }

  if (booking.status === 'checked_in') {
    throw createError({ statusCode: 400, statusMessage: 'Cannot cancel a checked-in ticket' })
  }

  if (booking.status === 'cancelled') {
    return { success: true, alreadyReleased: true }
  }

  const { data: eventData } = await client
    .schema('m2m')
    .from('events')
    .select('title')
    .eq('id', booking.event_id)
    .single()

  // Update status
  const { error: updateError } = await client
    .schema('m2m')
    .from('event_bookings')
    .update({
      status: 'cancelled',
      released_at: new Date().toISOString(),
      release_reason: 'admin_cancelled',
      checked_in_at: null,
      checked_in_by: null
    })
    .eq('id', booking.id)

  if (updateError) {
    throw createError({ statusCode: 500, statusMessage: updateError.message })
  }

  // Process lifecycle (promotes waitlist etc)
  await processEventBookingLifecycle(client as any, { eventId: booking.event_id })

  // Send SMS notification
  const profile = booking.profile as any
  let smsSent = false
  if (profile?.phone) {
    const eventTitle = eventData?.title || 'the event'
    let message = body.message ? String(body.message) : ''
    if (!message.trim()) {
      message = `Hi ${profile.display_name || 'there'}, your ticket for "${eventTitle}" has been cancelled and your spot has been released. If this is a mistake, please contact support.`
    }
    
    try {
      await sendSMS(profile.phone, message, { priority: 'normal' })
      smsSent = true

      // Log to history
      await client.schema('m2m').from('sms_history').insert([{
        recipient_id: profile.id,
        recipient_phone: profile.phone,
        recipient_name: profile.display_name,
        message,
        status: 'sent',
        sent_by: user.id
      }])
    } catch (error) {
      console.error('[Admin Cancel] Failed to send SMS:', error)
    }
  }

  return { 
    success: true, 
    smsSent 
  }
})
