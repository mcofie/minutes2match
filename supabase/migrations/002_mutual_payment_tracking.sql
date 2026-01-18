-- Migration: Add mutual payment tracking for matches
-- This migration adds support for the requirement:
-- "A match is only fully revealed when both users have paid"

-- ====================
-- UPDATE MATCHES TABLE
-- ====================

-- Add individual payment tracking columns
ALTER TABLE m2m.matches 
  ADD COLUMN IF NOT EXISTS user_1_paid BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS user_2_paid BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS user_1_paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS user_2_paid_at TIMESTAMPTZ;

-- Update status check constraint to include partial_payment
DO $$
BEGIN
  -- Drop old constraint if exists
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'matches_status_check') THEN
    ALTER TABLE m2m.matches DROP CONSTRAINT matches_status_check;
  END IF;
END $$;

-- Add new constraint with partial_payment status
ALTER TABLE m2m.matches 
  ADD CONSTRAINT matches_status_check 
  CHECK (status IN ('pending_payment', 'partial_payment', 'unlocked', 'rejected', 'expired'));

-- ====================
-- ADD display_name NOT NULL (optional, for new users)
-- ====================
-- Note: display_name already exists but is optional
-- We don't make it NOT NULL to preserve existing data

-- ====================
-- CREATE SETTINGS TABLE FOR GLOBAL CONFIGURATION
-- ====================

CREATE TABLE IF NOT EXISTS m2m.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grant permissions
GRANT SELECT ON m2m.settings TO authenticated, anon;
GRANT ALL ON m2m.settings TO service_role;

-- Enable RLS
ALTER TABLE m2m.settings ENABLE ROW LEVEL SECURITY;

-- Public read access for settings
CREATE POLICY IF NOT EXISTS "Anyone can read settings" 
  ON m2m.settings 
  FOR SELECT 
  USING (true);

-- Admin-only write access (via service role)

-- ====================
-- SEED DEFAULT SETTINGS
-- ====================

INSERT INTO m2m.settings (key, value) VALUES
  ('default_match_unlock_fee', '{"amount": 50, "currency": "GHS"}'::jsonb),
  ('default_male_ticket_price', '{"amount": 100, "currency": "GHS"}'::jsonb),
  ('default_female_ticket_price', '{"amount": 80, "currency": "GHS"}'::jsonb),
  ('match_expiry_days', '{"days": 7}'::jsonb),
  ('platform_name', '{"name": "Minutes 2 Match"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ====================
-- CREATE EVENT QUALIFICATIONS TABLE
-- ====================

CREATE TABLE IF NOT EXISTS m2m.event_qualifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES m2m.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES m2m.profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'qualified', 'invited')) DEFAULT 'qualified',
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Add is_public flag to events for qualification-based access
ALTER TABLE m2m.events 
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;

-- Grant permissions
GRANT SELECT, INSERT ON m2m.event_qualifications TO authenticated, anon;
GRANT ALL ON m2m.event_qualifications TO service_role;

-- Enable RLS
ALTER TABLE m2m.event_qualifications ENABLE ROW LEVEL SECURITY;

-- Users can see their own qualifications
CREATE POLICY IF NOT EXISTS "Users can view own qualifications" 
  ON m2m.event_qualifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- ====================
-- CREATE INDEXES
-- ====================

CREATE INDEX IF NOT EXISTS idx_matches_status ON m2m.matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_user_1_paid ON m2m.matches(user_1_paid);
CREATE INDEX IF NOT EXISTS idx_matches_user_2_paid ON m2m.matches(user_2_paid);
CREATE INDEX IF NOT EXISTS idx_event_qualifications_event ON m2m.event_qualifications(event_id);
CREATE INDEX IF NOT EXISTS idx_event_qualifications_user ON m2m.event_qualifications(user_id);

-- ====================
-- SUCCESS MESSAGE
-- ====================

DO $$
BEGIN
  RAISE NOTICE '✓ Migration 002: Mutual payment tracking applied successfully!';
  RAISE NOTICE '✓ Added: user_1_paid, user_2_paid, partial_payment status';
  RAISE NOTICE '✓ Added: settings table with defaults';
  RAISE NOTICE '✓ Added: event_qualifications table';
END $$;
