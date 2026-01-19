-- ================================================
-- Migration: Event Booking Improvements
-- Adds cleanup and validation for event bookings
-- ================================================

-- Function to cleanup stale pending bookings (older than 30 minutes)
-- This prevents users from being locked out if they abandoned payment
CREATE OR REPLACE FUNCTION cleanup_stale_pending_bookings()
RETURNS void AS $$
BEGIN
  -- Delete pending bookings older than 30 minutes
  DELETE FROM m2m.event_bookings 
  WHERE status = 'pending' 
  AND created_at < NOW() - INTERVAL '30 minutes';
  
  -- Log cleanup
  RAISE NOTICE 'Cleaned up stale pending bookings older than 30 minutes';
END;
$$ LANGUAGE plpgsql;

-- Create an index for faster cleanup queries
CREATE INDEX IF NOT EXISTS idx_event_bookings_pending_cleanup 
ON m2m.event_bookings(status, created_at) 
WHERE status = 'pending';

-- Add updated_at column if not exists
ALTER TABLE m2m.event_bookings 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Trigger to update updated_at on changes
CREATE OR REPLACE FUNCTION update_booking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS booking_updated_at ON m2m.event_bookings;
CREATE TRIGGER booking_updated_at
  BEFORE UPDATE ON m2m.event_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_updated_at();

-- Add a constraint to prevent duplicate bookings (if not exists)
-- Note: This may already exist from UNIQUE(event_id, user_id)
-- But we ensure it here for safety
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'event_bookings_event_id_user_id_key'
  ) THEN
    ALTER TABLE m2m.event_bookings 
    ADD CONSTRAINT event_bookings_event_id_user_id_key 
    UNIQUE (event_id, user_id);
  END IF;
EXCEPTION WHEN duplicate_object THEN
  -- Constraint already exists, ignore
  NULL;
END $$;

-- Grant execute on cleanup function to authenticated users (for cron jobs)
GRANT EXECUTE ON FUNCTION cleanup_stale_pending_bookings() TO authenticated;

-- Comment for documentation
COMMENT ON FUNCTION cleanup_stale_pending_bookings() IS 'Removes event_bookings with pending status older than 30 minutes. Should be called periodically via cron to cleanup abandoned payments.';
