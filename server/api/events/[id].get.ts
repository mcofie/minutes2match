import { createClient } from '@supabase/supabase-js'
import { fetchVisibleEventDetail, resolveEventUserId } from '~/server/utils/events'

export default defineEventHandler(async (event) => {
  const eventId = String(getRouterParam(event, 'id') || '')
  if (!eventId) {
    throw createError({ statusCode: 400, statusMessage: 'Event id is required' })
  }

  const userId = await resolveEventUserId(event)

  const config = useRuntimeConfig()
  const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey, {
    db: { schema: 'm2m' }
  })

  return await fetchVisibleEventDetail(supabase as any, {
    eventId,
    userId
  })
})
