/**
 * POST /api/admin/bulk-sms   { recipients: [{ id, phone, name }], message }
 *
 * Starts a bulk SMS blast. Nothing is sent here: the blast and one queued row per recipient
 * (de-duplicated by phone, {name} filled in) are saved, and the id is returned straight away.
 * Sending happens in batches via POST /api/admin/bulk-sms/:id/process (the admin page calls it
 * until done) and /api/cron/sms-queue (finishes blasts if the page is closed). See server/utils/smsBroadcast.ts.
 */
import { buildQueueRows } from '~/server/utils/smsBroadcast'

const MAX_RECIPIENTS = 20000
const MAX_LENGTH = 640 // four SMS segments

export default defineEventHandler(async (event) => {
  const { client, userId } = await requireAdminAccess(event)
  const db = client.schema('m2m') as any

  const { recipients, message } = (await readBody(event)) || {}
  if (!Array.isArray(recipients) || recipients.length === 0) {
    throw createError({ statusCode: 400, message: 'Pick at least one recipient' })
  }
  if (recipients.length > MAX_RECIPIENTS) {
    throw createError({ statusCode: 400, message: `At most ${MAX_RECIPIENTS.toLocaleString()} recipients per blast` })
  }
  if (typeof message !== 'string' || !message.trim()) {
    throw createError({ statusCode: 400, message: 'Write a message first' })
  }
  if (message.length > MAX_LENGTH) {
    throw createError({ statusCode: 400, message: `Keep the message under ${MAX_LENGTH} characters` })
  }

  const { data: broadcast, error: createErr } = await db
    .from('sms_broadcasts')
    .insert({ message: message.trim(), created_by: userId, status: 'sending' })
    .select('id')
    .single()
  if (createErr) {
    // 42P01: table missing (migration 080 not run)
    throw createError({ statusCode: 500, message: createErr.code === '42P01' ? 'Run migration 080 to enable bulk SMS' : 'Could not start the blast' })
  }

  const { rows, noPhone, duplicates } = buildQueueRows(broadcast.id, message.trim(), recipients, userId)
  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await db.from('sms_history').insert(rows.slice(i, i + 500))
    if (error) {
      // Don't leave a half-queued blast behind
      await db.from('sms_history').delete().eq('broadcast_id', broadcast.id)
      await db.from('sms_broadcasts').delete().eq('id', broadcast.id)
      console.error('[Bulk SMS] Queueing failed:', error)
      throw createError({ statusCode: 500, message: 'Could not queue the messages' })
    }
  }

  await db.from('sms_broadcasts')
    .update({ total: rows.length, ...(rows.length ? {} : { status: 'done', finished_at: new Date().toISOString() }) })
    .eq('id', broadcast.id)

  return { success: true, broadcastId: broadcast.id, queued: rows.length, skipped: { noPhone, duplicates } }
})
