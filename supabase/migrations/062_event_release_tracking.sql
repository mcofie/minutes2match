-- =========================================================
-- Migration: Event release tracking and attendee opt-out reasons
-- =========================================================

ALTER TABLE m2m.event_bookings
  ADD COLUMN IF NOT EXISTS released_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS release_reason TEXT,
  ADD COLUMN IF NOT EXISTS release_note TEXT;

CREATE INDEX IF NOT EXISTS idx_event_bookings_released_at
ON m2m.event_bookings(released_at)
WHERE released_at IS NOT NULL;

COMMENT ON COLUMN m2m.event_bookings.released_at IS 'Timestamp when the attendee released their spot or left the waitlist';
COMMENT ON COLUMN m2m.event_bookings.release_reason IS 'Structured reason why the attendee could not make the event';
COMMENT ON COLUMN m2m.event_bookings.release_note IS 'Optional attendee note when releasing their event spot';
