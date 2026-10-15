/**
 * POST /api/admin/bulk-sms/:id/process
 * Sends the next batches of a blast (about 7 seconds' worth) and returns progress.
 * Safe to call from several tabs at once: each message is claimed by one caller only.
 */
import { processBroadcast } from '~/server/utils/smsBroadcast'

export default defineEventHandler(async (event) => {
  const { client } = await requireAdminAccess(event)
  const id = getRouterParam(event, 'id')
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) throw createError({ statusCode: 400, message: 'Invalid blast' })

  const progress = await processBroadcast(client.schema('m2m'), id, { timeBudgetMs: 7000 })
  if (!progress) throw createError({ statusCode: 404, message: 'Blast not found' })
  return progress
})
