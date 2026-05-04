import { createClient } from '@supabase/supabase-js'
import { fetchVisibleEventsForUser, resolveEventUserId } from '~/server/utils/events'

export default defineEventHandler(async (event) => {
  const userId = await resolveEventUserId(event)

  const config = useRuntimeConfig()
  const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey, {
    db: { schema: 'm2m' }
  })

  return await fetchVisibleEventsForUser(supabase as any, userId)
})
