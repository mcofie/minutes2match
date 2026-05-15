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
  const eventId = String(body.eventId || '')
  const attendeeUserId = String(body.userId || '')
  const attendeeProfileId = String(body.profileId || '')
  const attendeePhone = String(body.phone || '').trim()
  const normalizedPhone = attendeePhone.replace(/\D/g, '')
  const candidateUserIds = [attendeeUserId, attendeeProfileId, bookingId]
    .map((value) => String(value || '').trim())
    .filter((value, index, array) => value && value !== 'undefined' && array.indexOf(value) === index)

  if (!bookingId && !(eventId && attendeeUserId)) {
    throw createError({ statusCode: 400, statusMessage: 'bookingId or eventId + userId is required' })
  }

  let booking: any = null
  let bookingError: any = null

  if (bookingId) {
    const response = await client
      .schema('m2m')
      .from('event_bookings')
      .select('id, event_id, user_id, status, checked_in_at')
      .eq('id', bookingId)
      .maybeSingle()

    booking = response.data
    bookingError = response.error
  }

  if ((!booking || bookingError) && eventId && candidateUserIds.length) {
    for (const candidateUserId of candidateUserIds) {
      const fallbackResponse = await client
        .schema('m2m')
        .from('event_bookings')
        .select('id, event_id, user_id, status, checked_in_at')
        .eq('event_id', eventId)
        .eq('user_id', candidateUserId)
        .order('created_at', { ascending: false })
        .limit(5)

      const fallbackRows = Array.isArray(fallbackResponse.data) ? fallbackResponse.data : []
      if (fallbackRows.length) {
        booking = fallbackRows.find((row: any) => row.status === 'confirmed')
          || fallbackRows.find((row: any) => row.status === 'checked_in')
          || fallbackRows[0]
        bookingError = null
        break
      }

      bookingError = fallbackResponse.error
    }
  }

  if ((!booking || bookingError) && eventId && normalizedPhone) {
    const phoneFallback = await client
      .schema('m2m')
      .from('event_bookings')
      .select(`
        id,
        event_id,
        user_id,
        status,
        checked_in_at,
        profile:profiles!event_bookings_user_id_fkey(id, phone)
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
      .limit(20)

    const phoneRows = Array.isArray(phoneFallback.data) ? phoneFallback.data : []
    const matchedRow = phoneRows.find((row: any) => {
      const rowPhone = String(row.profile?.phone || '').replace(/\D/g, '')
      return rowPhone && rowPhone === normalizedPhone
    })

    if (matchedRow) {
      booking = matchedRow
      bookingError = null
    } else {
      bookingError = phoneFallback.error
    }
  }

  if ((!booking || bookingError) && eventId) {
    const eventFallback = await client
      .schema('m2m')
      .from('event_bookings')
      .select('id, event_id, user_id, status, checked_in_at')
      .eq('event_id', eventId)
      .in('status', ['confirmed', 'checked_in'])
      .order('created_at', { ascending: false })

    const eventRows = Array.isArray(eventFallback.data) ? eventFallback.data : []
    if (eventRows.length === 1) {
      booking = eventRows[0]
      bookingError = null
    } else {
      bookingError = eventFallback.error
    }
  }

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
    .eq('id', booking.id)

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
