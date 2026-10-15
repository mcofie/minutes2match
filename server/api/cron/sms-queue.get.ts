/**
 * Cron: finish bulk SMS blasts
 * GET /api/cron/sms-queue   (Authorization: Bearer <CRON_SECRET>, every few minutes)
 *
 * The admin page sends a blast while it's open; this picks up any blast still sending
 * (the page was closed, the connection dropped) and sends the next batches.
 */
import { createClient } from '@supabase/supabase-js'
import { processBroadcast } from '~/server/utils/smsBroadcast'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  if (getHeader(event, 'authorization') !== `Bearer ${config.cronSecret}`) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const db = createClient(config.supabaseUrl, config.supabaseServiceKey, { db: { schema: 'm2m' } }) as any
  const { data: active } = await db.from('sms_broadcasts').select('id').eq('status', 'sending').order('created_at').limit(5)

  const startedAt = Date.now()
  const results = []
  for (const b of active || []) {
    const remaining = 20000 - (Date.now() - startedAt)
    if (remaining < 3000) break
    results.push(await processBroadcast(db, b.id, { timeBudgetMs: Math.min(remaining, 15000) }))
  }
  return { success: true, processed: results }
})
