-- =========================================================
-- Migration: Event booking lifecycle and check-in metadata
-- =========================================================

ALTER TABLE m2m.event_bookings
  DROP CONSTRAINT IF EXISTS event_bookings_status_check;

ALTER TABLE m2m.event_bookings
  ADD CONSTRAINT event_bookings_status_check
  CHECK (status IN ('pending', 'confirmed', 'checked_in', 'waitlisted', 'cancelled'));

ALTER TABLE m2m.event_bookings
  ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS checked_in_by UUID REFERENCES m2m.admins(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_event_bookings_checked_in
ON m2m.event_bookings(status, checked_in_at)
WHERE status = 'checked_in';

COMMENT ON COLUMN m2m.event_bookings.checked_in_at IS 'Timestamp when the attendee was checked in at the event desk';
COMMENT ON COLUMN m2m.event_bookings.checked_in_by IS 'Admin who performed the attendee check-in';
