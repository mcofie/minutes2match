import { requireAdminAccess } from '~/server/utils/admin'
import { sendSMS } from '~/server/utils/sms'

export default defineEventHandler(async (event) => {
  const { client, user } = await requireAdminAccess(event)
  const body = await readBody(event)
  const { bookingIds, message, eventId } = body as { bookingIds: string[]; message: string; eventId: string }

  if (!bookingIds || !Array.isArray(bookingIds) || bookingIds.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'bookingIds is required' })
  }
  if (!message || typeof message !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'message is required' })
  }
  if (!eventId) {
    throw createError({ statusCode: 400, statusMessage: 'eventId is required' })
  }

  // Fetch event details
  const { data: eventData, error: eventError } = await client
    .schema('m2m')
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single()

  if (eventError || !eventData) {
    throw createError({ statusCode: 404, statusMessage: 'Event not found' })
  }

  // Fetch the selected bookings with profiles
  const { data: bookings, error: bookingsError } = await client
    .schema('m2m')
    .from('event_bookings')
    .select(`
      id,
      user_id,
      status,
      profile:profiles!event_bookings_user_id_fkey(id, display_name, phone)
    `)
    .in('id', bookingIds)
    .eq('event_id', eventId)

  if (bookingsError || !bookings) {
    throw createError({ statusCode: 500, statusMessage: bookingsError?.message || 'Failed to fetch bookings' })
  }

  const broadcastId = crypto.randomUUID()
  const historyToInsert: any[] = []
  let successCount = 0
  let failCount = 0
  const results: any[] = []

  const formattedEventDate = new Date(eventData.event_date).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit'
  })

  for (const booking of bookings) {
    const profile = booking.profile as any
    if (!profile || !profile.phone) {
      results.push({ id: booking.id, success: false, error: 'No phone number found' })
      failCount++
      continue
    }

    try {
      // Personalize message
      const personalizedMessage = message
        .replace(/\{name\}/g, profile.display_name || 'Guest')
        .replace(/\{event_title\}/g, eventData.title)
        .replace(/\{event_date\}/g, formattedEventDate)
        .replace(/\{venue\}/g, eventData.venue)

      const result = await sendSMS(profile.phone, personalizedMessage, { priority: 'normal' })

      results.push({ id: booking.id, success: true, messageId: result.id })
      successCount++

      historyToInsert.push({
        recipient_id: profile.id,
        recipient_phone: profile.phone,
        recipient_name: profile.display_name,
        message: personalizedMessage,
        status: 'sent',
        broadcast_id: broadcastId,
        sent_by: user.id
      })
    } catch (err: any) {
      console.error(`[Event Confirm SMS] Failed to send to ${profile.phone}:`, err.message)
      results.push({ id: booking.id, success: false, error: err.message || 'Failed to send' })
      failCount++

      historyToInsert.push({
        recipient_id: profile.id,
        recipient_phone: profile.phone,
        recipient_name: profile.display_name,
        message: message,
        status: 'failed',
        broadcast_id: broadcastId,
        sent_by: user.id
      })
    }
  }

  // Insert into m2m.sms_history
  if (historyToInsert.length > 0) {
    const { error: logError } = await client
      .schema('m2m')
      .from('sms_history')
      .insert(historyToInsert)
    if (logError) {
      console.error('[Event Confirm SMS] Failed to log history:', logError)
    }
  }

  return {
    success: true,
    broadcastId,
    summary: {
      total: bookings.length,
      sent: successCount,
      failed: failCount
    },
    results
  }
})
