-- Migration: 080_sms_broadcast_queue.sql
--
-- Bulk SMS used to send every message inside one web request: a large blast hit the hosting
-- time limit partway, the history (written at the end) was lost, and sending again texted the
-- first batch twice. Blasts are now a queue:
--
-- 1. m2m.sms_broadcasts: one row per blast (message, counts, status).
-- 2. Each recipient is an m2m.sms_history row created up front as 'pending' (queued), then
--    'sending' while a worker has it, then 'sent' / 'failed' / 'cancelled'.
-- 3. m2m.claim_sms_batch hands a batch of queued rows to one worker at a time
--    (FOR UPDATE SKIP LOCKED), so two tabs or a cron run can never send the same message twice.

CREATE TABLE IF NOT EXISTS m2m.sms_broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sending' CHECK (status IN ('sending', 'done', 'cancelled')),
  total INT NOT NULL DEFAULT 0,
  created_by UUID REFERENCES m2m.admins(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS sms_broadcasts_status_idx ON m2m.sms_broadcasts (status, created_at);

ALTER TABLE m2m.sms_broadcasts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins read broadcasts" ON m2m.sms_broadcasts;
CREATE POLICY "Admins read broadcasts" ON m2m.sms_broadcasts FOR SELECT USING (m2m.is_admin());
GRANT SELECT ON m2m.sms_broadcasts TO authenticated;

-- Per-message progress on the history rows
ALTER TABLE m2m.sms_history DROP CONSTRAINT IF EXISTS sms_history_status_check;
ALTER TABLE m2m.sms_history ADD CONSTRAINT sms_history_status_check
  CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'cancelled'));
ALTER TABLE m2m.sms_history ADD COLUMN IF NOT EXISTS provider TEXT;
ALTER TABLE m2m.sms_history ADD COLUMN IF NOT EXISTS error TEXT;
ALTER TABLE m2m.sms_history ADD COLUMN IF NOT EXISTS attempts INT NOT NULL DEFAULT 0;
ALTER TABLE m2m.sms_history ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;
ALTER TABLE m2m.sms_history ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS sms_history_queue_idx ON m2m.sms_history (broadcast_id, status);

-- Hand out up to batch_size queued messages of a broadcast to the caller, marking them 'sending'.
-- Rows another worker is holding are skipped, never sent twice.
CREATE OR REPLACE FUNCTION m2m.claim_sms_batch(p_broadcast_id UUID, p_batch_size INT DEFAULT 25)
RETURNS SETOF m2m.sms_history
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = m2m, public
AS $$
BEGIN
  RETURN QUERY
  UPDATE m2m.sms_history h
  SET status = 'sending', claimed_at = now(), attempts = h.attempts + 1
  WHERE h.id IN (
    SELECT q.id FROM m2m.sms_history q
    WHERE q.broadcast_id = p_broadcast_id AND q.status = 'pending'
    ORDER BY q.created_at, q.id
    LIMIT GREATEST(1, LEAST(p_batch_size, 100))
    FOR UPDATE SKIP LOCKED
  )
  RETURNING h.*;
END;
$$;

-- Only the server (service role) claims batches
REVOKE ALL ON FUNCTION m2m.claim_sms_batch(UUID, INT) FROM PUBLIC, anon, authenticated;
