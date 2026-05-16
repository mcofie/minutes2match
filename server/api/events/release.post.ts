import { createClient } from '@supabase/supabase-js'
import { processEventBookingLifecycle, resolveEventUserId } from '~/server/utils/events'
import { notifyEventBookingReleased } from '~/server/utils/discord'
import { notifyEventWaitlistPromoted } from '~/server/utils/notifications'

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({} as Record<string, any>))
  const eventId = String(body.eventId || '')
  const releaseReason = body.reason ? String(body.reason) : null
  const releaseNote = body.note ? String(body.note).slice(0, 240) : null

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

  const { data: booking, error: bookingError } = await supabase
    .from('event_bookings')
    .select('id, event_id, user_id, status, payment_id')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .maybeSingle()

  if (bookingError) {
    throw createError({ statusCode: 500, statusMessage: bookingError.message })
  }

  if (!booking?.id) {
    throw createError({ statusCode: 404, statusMessage: 'Booking not found' })
  }

  if (booking.status === 'checked_in') {
    throw createError({ statusCode: 400, statusMessage: 'Checked-in tickets cannot be released from the app' })
  }

  if (booking.status === 'cancelled') {
    return { success: true, alreadyReleased: true }
  }

  const previousStatus = String(booking.status || 'pending')

  const { error: updateError } = await supabase
    .from('event_bookings')
    .update({
      status: 'cancelled',
      released_at: new Date().toISOString(),
      release_reason: releaseReason,
      release_note: releaseNote,
      checked_in_at: null,
      checked_in_by: null
    })
    .eq('id', booking.id)

  if (updateError) {
    throw createError({ statusCode: 500, statusMessage: updateError.message })
  }

  const { promoted } = await processEventBookingLifecycle(supabase as any, { eventId })

  const [{ data: eventRow }, { data: profileRow }] = await Promise.all([
    supabase.from('events').select('title').eq('id', eventId).maybeSingle(),
    supabase.from('profiles').select('display_name').eq('id', userId).maybeSingle()
  ])

  if (eventRow?.title) {
    await notifyEventBookingReleased({
      eventName: eventRow.title,
      userName: profileRow?.display_name || 'Unknown user',
      statusBeforeRelease: previousStatus
    }).catch((error) => {
      console.error('[Events] Failed to send release Discord notification:', error)
    })
  }

  if (eventRow?.title && promoted.length) {
    for (const row of promoted as any[]) {
      if (!row?.user_id) continue
      await notifyEventWaitlistPromoted(supabase as any, {
        userId: row.user_id,
        eventId,
        eventTitle: eventRow.title
      }).catch((error) => {
        console.error('[Events] Failed to notify promoted waitlist user after release:', error)
      })
    }
  }

  return {
    success: true,
    released: true,
    previousStatus,
    message: previousStatus === 'waitlisted'
      ? 'You have left the waitlist for this event.'
      : 'Your spot has been released. This ticket remains non-refundable.'
  }
})
