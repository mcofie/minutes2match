import { requireAdminAccess } from '~/server/utils/admin'
import { sendSMS } from '~/server/utils/sms'

export default defineEventHandler(async (event) => {
  const { client, user } = await requireAdminAccess(event)
  const body = await readBody(event)
  const eventId = String(body.eventId || '')
  
  if (!eventId) {
    throw createError({ statusCode: 400, statusMessage: 'eventId is required' })
  }

  // Fetch the event
  const { data: eventData, error: eventError } = await client
    .schema('m2m')
    .from('events')
    .select('title, event_date, venue')
    .eq('id', eventId)
    .single()

  if (eventError || !eventData) {
    throw createError({ statusCode: 404, statusMessage: 'Event not found' })
  }

  // Get all bookings for this event to cancel them and find confirmed guests
  const { data: bookings, error: bookingsError } = await client
    .schema('m2m')
    .from('event_bookings')
    .select(`
      id,
      status,
      user_id,
      profile:profiles!event_bookings_user_id_fkey(id, display_name, phone)
    `)
    .eq('event_id', eventId)

  if (bookingsError) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch event bookings' })
  }

  // Update event to draft and hidden
  const { error: updateEventError } = await client
    .schema('m2m')
    .from('events')
    .update({
      status: 'draft',
      is_public: false
    })
    .eq('id', eventId)

  if (updateEventError) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to cancel event' })
  }

  // Cancel all non-cancelled bookings
  const activeBookings = bookings?.filter((b: any) => b.status !== 'cancelled') || []
  if (activeBookings.length > 0) {
    const bookingIds = activeBookings.map((b: any) => b.id)
    await client
      .schema('m2m')
      .from('event_bookings')
      .update({
        status: 'cancelled',
        released_at: new Date().toISOString(),
        release_reason: 'event_cancelled'
      })
      .in('id', bookingIds)
  }

  // Send SMS to confirmed guests
  const confirmedGuests = activeBookings.filter((b: any) => b.status === 'confirmed' || b.status === 'checked_in')
  let smsSentCount = 0

  const defaultMessage = `Hi {name}, we're sorry to inform you that the event "${eventData.title}" has been cancelled. Your ticket will be fully refunded shortly.`
  const customMessage = body.message ? String(body.message) : ''
  const messageTemplate = customMessage.trim() ? customMessage : defaultMessage

  for (const booking of confirmedGuests) {
    const profile = booking.profile as any
    if (profile?.phone) {
      const message = messageTemplate
        .replace(/\{name\}/g, profile.display_name || 'Guest')
        .replace(/\{event_title\}/g, eventData.title)

      try {
        await sendSMS(profile.phone, message, { priority: 'normal' })
        smsSentCount++

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
        console.error(`[Admin Cancel Event] Failed to send SMS to ${profile.phone}:`, error)
      }
    }
  }

  return {
    success: true,
    smsSentCount,
    cancelledTicketsCount: activeBookings.length
  }
})
