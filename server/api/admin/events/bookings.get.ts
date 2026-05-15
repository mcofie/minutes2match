import { requireAdminAccess } from '~/server/utils/admin'

export default defineEventHandler(async (event) => {
  const { client } = await requireAdminAccess(event)
  const eventId = String(getQuery(event).eventId || '')

  if (!eventId) {
    throw createError({ statusCode: 400, statusMessage: 'eventId is required' })
  }

  const { data: bookings, error } = await client
    .schema('m2m')
    .from('event_bookings')
    .select(`
      *,
      profile:profiles!event_bookings_user_id_fkey(*)
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return {
    success: true,
    bookings: bookings || []
  }
})
