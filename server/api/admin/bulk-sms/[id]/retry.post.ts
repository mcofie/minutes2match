/**
 * POST /api/admin/bulk-sms/:id/retry
 * Queues a blast's failed messages again (and reopens the blast) so the next process call resends them.
 */
import { getBroadcastProgress } from '~/server/utils/smsBroadcast'

export default defineEventHandler(async (event) => {
  const { client } = await requireAdminAccess(event)
  const db = client.schema('m2m') as any
  const id = getRouterParam(event, 'id')
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) throw createError({ statusCode: 400, message: 'Invalid blast' })

  const { data: requeued } = await db.from('sms_history')
    .update({ status: 'pending', error: null, claimed_at: null })
    .eq('broadcast_id', id)
    .eq('status', 'failed')
    .select('id')
  if (requeued?.length) {
    await db.from('sms_broadcasts').update({ status: 'sending', finished_at: null }).eq('id', id)
  }
  return await getBroadcastProgress(db, id)
})
