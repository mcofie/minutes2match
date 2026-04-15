import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { M2MDatabase } from '~/types/database.types'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const userId = (user as any)?.id || (user as any)?.sub
  if (!user || !userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const client = serverSupabaseServiceRole<M2MDatabase>(event)
  const { data: admin } = await client.schema('m2m').from('admins').select('id').eq('id', userId).maybeSingle()
  if (!admin) {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }

  const body = await readBody(event).catch(() => ({} as Record<string, any>))
  const bookingId = String(body.bookingId || '')

  if (!bookingId) {
    throw createError({ statusCode: 400, statusMessage: 'bookingId is required' })
  }

  const { data: booking, error: bookingError } = await client
    .schema('m2m')
    .from('event_bookings')
    .select('id, user_id, status, checked_in_at')
    .eq('id', bookingId)
    .single()

  if (bookingError || !booking) {
    throw createError({ statusCode: 404, statusMessage: 'Booking not found' })
  }

  if (booking.status === 'checked_in') {
    return { success: true, alreadyCheckedIn: true }
  }

  if (booking.status !== 'confirmed') {
    throw createError({ statusCode: 400, statusMessage: 'Only confirmed bookings can be checked in' })
  }

  const checkedInAt = new Date().toISOString()
  const { error: updateError } = await client
    .schema('m2m')
    .from('event_bookings')
    .update({
      status: 'checked_in',
      checked_in_at: checkedInAt,
      checked_in_by: userId
    })
    .eq('id', bookingId)

  if (updateError) {
    throw createError({ statusCode: 500, statusMessage: updateError.message })
  }

  if (booking.user_id) {
    const { data: profile } = await client
      .schema('m2m')
      .from('profiles')
      .select('events_attended')
      .eq('id', booking.user_id)
      .maybeSingle()

    const attended = Number(profile?.events_attended || 0)
    await client
      .schema('m2m')
      .from('profiles')
      .update({ events_attended: attended + 1 })
      .eq('id', booking.user_id)
  }

  return { success: true, checkedInAt }
})
