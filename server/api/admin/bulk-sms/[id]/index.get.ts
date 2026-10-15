/** GET /api/admin/bulk-sms/:id: progress of a blast */
import { getBroadcastProgress } from '~/server/utils/smsBroadcast'

export default defineEventHandler(async (event) => {
  const { client } = await requireAdminAccess(event)
  const id = getRouterParam(event, 'id')
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) throw createError({ statusCode: 400, message: 'Invalid blast' })
  const progress = await getBroadcastProgress(client.schema('m2m'), id)
  if (!progress) throw createError({ statusCode: 404, message: 'Blast not found' })
  return progress
})
