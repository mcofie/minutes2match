/**
 * POST /api/admin/bulk-sms/:id/cancel
 * Stops a blast: messages not yet sent are marked cancelled. Ones already going out finish.
 */
import { getBroadcastProgress } from '~/server/utils/smsBroadcast'

export default defineEventHandler(async (event) => {
  const { client } = await requireAdminAccess(event)
  const db = client.schema('m2m') as any
  const id = getRouterParam(event, 'id')
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) throw createError({ statusCode: 400, message: 'Invalid blast' })

  await db.from('sms_broadcasts').update({ status: 'cancelled', finished_at: new Date().toISOString() }).eq('id', id).eq('status', 'sending')
  await db.from('sms_history').update({ status: 'cancelled' }).eq('broadcast_id', id).eq('status', 'pending')
  return await getBroadcastProgress(db, id)
})
