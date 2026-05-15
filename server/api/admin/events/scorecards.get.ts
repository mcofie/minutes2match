import { requireAdminAccess } from '~/server/utils/admin'

export default defineEventHandler(async (event) => {
  const { client } = await requireAdminAccess(event)
  const eventId = String(getQuery(event).eventId || '')

  if (!eventId) {
    throw createError({ statusCode: 400, statusMessage: 'eventId is required' })
  }

  const { data, error } = await client
    .schema('m2m')
    .from('event_scorecards')
    .select('*')
    .eq('event_id', eventId)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return {
    success: true,
    rows: data || []
  }
})
