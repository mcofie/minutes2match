import { createClient } from '@supabase/supabase-js'
import { processEventBookingLifecycle } from '~/server/utils/events'
import { notifyEventWaitlistPromoted } from '~/server/utils/notifications'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const authHeader = getHeader(event, 'authorization')

  if (authHeader !== `Bearer ${config.cronSecret}`) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey, {
    db: { schema: 'm2m' }
  })

  const { cleaned, promoted } = await processEventBookingLifecycle(supabase as any)

  if (promoted.length) {
    const eventIds = [...new Set(promoted.map((row: any) => row.event_id).filter(Boolean))]
    const userIds = [...new Set(promoted.map((row: any) => row.user_id).filter(Boolean))]

    const [{ data: events }, { data: users }] = await Promise.all([
      supabase.from('events').select('id, title').in('id', eventIds),
      supabase.from('profiles').select('id').in('id', userIds)
    ])

    const eventMap = new Map((events || []).map((row: any) => [row.id, row]))
    const allowedUsers = new Set((users || []).map((row: any) => row.id))

    for (const row of promoted as any[]) {
      if (!allowedUsers.has(row.user_id)) continue
      const eventRow = eventMap.get(row.event_id)
      if (!eventRow?.title) continue

      await notifyEventWaitlistPromoted(supabase as any, {
        userId: row.user_id,
        eventId: row.event_id,
        eventTitle: eventRow.title
      })
    }
  }

  return {
    success: true,
    cleaned: cleaned.length,
    promoted: promoted.length
  }
})
