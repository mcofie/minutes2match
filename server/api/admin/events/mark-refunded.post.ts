import { requireAdminAccess } from '~/server/utils/admin'
import { sendSMS } from '~/server/utils/sms'

export default defineEventHandler(async (event) => {
  const { client, user } = await requireAdminAccess(event)
  const body = await readBody(event)
  const bookingId = String(body.bookingId || '')

  if (!bookingId) {
    throw createError({ statusCode: 400, statusMessage: 'bookingId is required' })
  }

  const { data: booking, error: bookingError } = await client
    .schema('m2m')
    .from('event_bookings')
    .select(`
      id,
      status,
      release_note,
      event_id,
      profile:profiles!event_bookings_user_id_fkey(id, display_name, phone)
    `)
    .eq('id', bookingId)
    .single()

  if (bookingError || !booking) {
    throw createError({ statusCode: 404, statusMessage: 'Booking not found' })
  }

  if (booking.status !== 'cancelled') {
    throw createError({ statusCode: 400, statusMessage: 'Only cancelled tickets can be marked as refunded' })
  }

  const newNote = booking.release_note ? `${booking.release_note} [REFUNDED]` : '[REFUNDED]'

  const { error: updateError } = await client
    .schema('m2m')
    .from('event_bookings')
    .update({
      release_note: newNote
    })
    .eq('id', booking.id)

  if (updateError) {
    throw createError({ statusCode: 500, statusMessage: updateError.message })
  }

  const { data: eventData } = await client.schema('m2m').from('events').select('title').eq('id', booking.event_id).single()

  const profile = booking.profile as any
  let smsSent = false
  if (profile?.phone) {
    const eventTitle = eventData?.title || 'the event'
    const message = `Hi ${profile.display_name || 'there'}, your refund for "${eventTitle}" has just been processed and sent to you. Please allow a few moments for it to reflect.`
    
    try {
      await sendSMS(profile.phone, message, { priority: 'normal' })
      smsSent = true
      
      await client.schema('m2m').from('sms_history').insert([{
        recipient_id: profile.id,
        recipient_phone: profile.phone,
        recipient_name: profile.display_name,
        message,
        status: 'sent',
        sent_by: user.id
      }])
    } catch (error) {
      console.error(`[Admin Refund] Failed to send SMS to ${profile.phone}:`, error)
    }
  }

  return { success: true, smsSent }
})
