import { sendSMS } from './sms'
import { fetchAllRows } from './adminData'
import { normalizeGhanaPhone } from './phone'

/**
 * Bulk SMS as a queue (see migration 080). A blast's recipients are m2m.sms_history rows that start
 * 'pending'; workers claim small batches with m2m.claim_sms_batch and save each result as it lands.
 * Each call stays well inside the hosting time limit; the admin page (and the cron) keep calling
 * until nothing is left.
 */

export interface BroadcastProgress {
  broadcastId: string
  status: 'sending' | 'done' | 'cancelled'
  total: number
  pending: number
  sending: number
  sent: number
  failed: number
  cancelled: number
}

// A message held as 'sending' this long was interrupted (the worker was stopped). It may or may not
// have gone out, so it's marked failed for the admin to retry, never resent automatically.
const STUCK_AFTER_MS = 3 * 60 * 1000

/** Turns a recipient list into queue rows: one per phone number (first one wins), {name} filled in */
export const buildQueueRows = (
  broadcastId: string,
  message: string,
  recipients: { id?: string | null; phone?: string | null; name?: string | null }[],
  sentBy: string | null
) => {
  const seen = new Set<string>()
  const rows: any[] = []
  let noPhone = 0
  let duplicates = 0
  for (const r of recipients) {
    const raw = (r.phone || '').trim()
    if (!raw) { noPhone++; continue }
    const phone = normalizeGhanaPhone(raw)
    if (seen.has(phone)) { duplicates++; continue }
    seen.add(phone)
    const firstName = (r.name || '').trim().split(/\s+/)[0] || ''
    rows.push({
      broadcast_id: broadcastId,
      recipient_id: r.id || null,
      recipient_phone: phone,
      recipient_name: r.name || null,
      message: message.replace(/\{name\}/g, firstName || 'there'),
      status: 'pending',
      sent_by: sentBy
    })
  }
  return { rows, noPhone, duplicates }
}

export const getBroadcastProgress = async (db: any, broadcastId: string): Promise<BroadcastProgress | null> => {
  const { data: broadcast } = await db.from('sms_broadcasts').select('id, status, total').eq('id', broadcastId).maybeSingle()
  if (!broadcast) return null
  const rows = await fetchAllRows<{ status: string }>(() =>
    db.from('sms_history').select('status').eq('broadcast_id', broadcastId).order('id'))
  const count = (s: string) => rows.filter(r => r.status === s).length
  return {
    broadcastId,
    status: broadcast.status,
    total: broadcast.total || rows.length,
    pending: count('pending'),
    sending: count('sending'),
    sent: count('sent'),
    failed: count('failed'),
    cancelled: count('cancelled')
  }
}

/** Send as much of a broadcast as fits in the time budget, then report progress */
export const processBroadcast = async (
  db: any,
  broadcastId: string,
  options: { timeBudgetMs?: number; batchSize?: number; concurrency?: number } = {}
): Promise<BroadcastProgress | null> => {
  const startedAt = Date.now()
  const timeBudget = options.timeBudgetMs ?? 7000
  const batchSize = options.batchSize ?? 25
  const concurrency = options.concurrency ?? 6

  const { data: broadcast } = await db.from('sms_broadcasts').select('id, status').eq('id', broadcastId).maybeSingle()
  if (!broadcast) return null

  // 1. Messages left mid-send by a stopped worker
  await db.from('sms_history')
    .update({ status: 'failed', error: 'Interrupted while sending; it may not have gone out. Retry to send again.' })
    .eq('broadcast_id', broadcastId)
    .eq('status', 'sending')
    .lt('claimed_at', new Date(Date.now() - STUCK_AFTER_MS).toISOString())

  // 2. Claim and send batches while there's time (leave room for the last batch to finish)
  while (broadcast.status === 'sending' && Date.now() - startedAt < timeBudget * 0.6) {
    const { data: batch, error } = await db.rpc('claim_sms_batch', { p_broadcast_id: broadcastId, p_batch_size: batchSize })
    if (error) throw error
    if (!batch?.length) break

    // Telegram chats for the whole batch in one query
    const ids = batch.map((r: any) => r.recipient_id).filter(Boolean)
    const telegramById = new Map<string, string | null>()
    if (ids.length) {
      const { data: profiles } = await db.from('profiles').select('id, telegram_id').in('id', ids)
      for (const p of profiles || []) telegramById.set(p.id, p.telegram_id || null)
    }

    const queue = [...batch]
    const worker = async () => {
      for (let row = queue.shift(); row; row = queue.shift()) {
        try {
          const result: any = await sendSMS(row.recipient_phone, row.message, {
            priority: 'normal',
            telegramId: row.recipient_id ? (telegramById.get(row.recipient_id) ?? null) : null
          })
          await db.from('sms_history')
            .update({ status: 'sent', provider: result?.provider || null, error: null, sent_at: new Date().toISOString() })
            .eq('id', row.id)
        } catch (e: any) {
          await db.from('sms_history')
            .update({ status: 'failed', error: String(e?.message || 'Failed').slice(0, 500) })
            .eq('id', row.id)
        }
      }
    }
    await Promise.all(Array.from({ length: Math.min(concurrency, batch.length) }, worker))

    // Stop early if it was cancelled meanwhile
    const { data: latest } = await db.from('sms_broadcasts').select('status').eq('id', broadcastId).maybeSingle()
    broadcast.status = latest?.status || broadcast.status
  }

  // 3. Finished once nothing is queued or in flight
  const progress = await getBroadcastProgress(db, broadcastId)
  if (progress && progress.status === 'sending' && progress.pending === 0 && progress.sending === 0) {
    await db.from('sms_broadcasts').update({ status: 'done', finished_at: new Date().toISOString() }).eq('id', broadcastId)
    progress.status = 'done'
  }
  return progress
}
