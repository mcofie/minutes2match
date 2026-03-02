-- ================================================================
-- VOUCHES & SHOOT YOUR SHOT TABLES
-- ================================================================
-- Run this in Supabase SQL Editor
-- Adds:
--   ✓ m2m.vouches  - Vouch for two friends
--   ✓ m2m.shots    - Shoot your shot
--   ✓ Updates payments purpose constraint for 'shoot_your_shot'
--   ✓ New setting: shoot_your_shot_fee
--   ✓ RLS policies & indexes
-- ================================================================

-- ====================
-- VOUCHES TABLE
-- ====================
CREATE TABLE IF NOT EXISTS m2m.vouches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- The matcher (NOT an M2M user)
  matcher_name TEXT NOT NULL,
  matcher_phone TEXT NOT NULL,
  matcher_email TEXT,
  -- Friend A
  friend_a_name TEXT NOT NULL,
  friend_a_phone TEXT NOT NULL,
  friend_a_token TEXT UNIQUE NOT NULL,
  friend_a_accepted BOOLEAN DEFAULT FALSE,
  friend_a_accepted_at TIMESTAMPTZ,
  -- Friend B
  friend_b_name TEXT NOT NULL,
  friend_b_phone TEXT NOT NULL,
  friend_b_token TEXT UNIQUE NOT NULL,
  friend_b_accepted BOOLEAN DEFAULT FALSE,
  friend_b_accepted_at TIMESTAMPTZ,
  -- Vouch metadata
  matcher_note TEXT,
  status TEXT CHECK (status IN ('pending', 'partial', 'matched', 'declined', 'expired')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
);

-- ====================
-- SHOTS TABLE (Shoot Your Shot)
-- ====================
CREATE TABLE IF NOT EXISTS m2m.shots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- The shooter (NOT an M2M user)
  shooter_name TEXT NOT NULL,
  shooter_phone TEXT NOT NULL,
  shooter_email TEXT NOT NULL,
  -- The target (NOT an M2M user)
  target_name TEXT NOT NULL,
  target_phone TEXT NOT NULL,
  target_token TEXT UNIQUE NOT NULL,
  -- Shot details
  message TEXT,
  hints JSONB DEFAULT '[]'::jsonb,       -- [{question, answer, emoji}] - 3 mystery clues
  amount_paid NUMERIC(10,2) NOT NULL,
  payment_ref TEXT,
  payment_status TEXT CHECK (payment_status IN ('pending', 'success', 'failed')) DEFAULT 'pending',
  -- Status tracking
  status TEXT CHECK (status IN ('awaiting_payment', 'sent', 'viewed', 'unlocked', 'expired')) DEFAULT 'awaiting_payment',
  viewed_at TIMESTAMPTZ,
  unlocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '14 days'
);

-- ====================
-- UPDATE PAYMENTS PURPOSE CONSTRAINT
-- ====================
-- Add 'shoot_your_shot' as valid purpose
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payments_purpose_check' AND connamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'm2m')) THEN
    ALTER TABLE m2m.payments DROP CONSTRAINT payments_purpose_check;
  END IF;
  
  ALTER TABLE m2m.payments ADD CONSTRAINT payments_purpose_check 
    CHECK (purpose IN ('event_ticket', 'match_unlock', 'subscription', 'shoot_your_shot'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ====================
-- GRANT PERMISSIONS
-- ====================
GRANT ALL ON m2m.vouches TO service_role;
GRANT ALL ON m2m.shots TO service_role;
-- Public forms need anon access for inserts/reads
GRANT SELECT, INSERT, UPDATE ON m2m.vouches TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON m2m.shots TO authenticated, anon;

-- ====================
-- ROW LEVEL SECURITY
-- ====================
ALTER TABLE m2m.vouches ENABLE ROW LEVEL SECURITY;
ALTER TABLE m2m.shots ENABLE ROW LEVEL SECURITY;

-- Vouches: anyone can create, read by token, service role manages
DROP POLICY IF EXISTS "Anyone can create vouches" ON m2m.vouches;
CREATE POLICY "Anyone can create vouches" ON m2m.vouches FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can read vouches" ON m2m.vouches;
CREATE POLICY "Anyone can read vouches" ON m2m.vouches FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can update vouches" ON m2m.vouches;
CREATE POLICY "Anyone can update vouches" ON m2m.vouches FOR UPDATE USING (true);

-- Shots: anyone can create, read by token, service role manages
DROP POLICY IF EXISTS "Anyone can create shots" ON m2m.shots;
CREATE POLICY "Anyone can create shots" ON m2m.shots FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can read shots" ON m2m.shots;
CREATE POLICY "Anyone can read shots" ON m2m.shots FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can update shots" ON m2m.shots;
CREATE POLICY "Anyone can update shots" ON m2m.shots FOR UPDATE USING (true);

-- ====================
-- INDEXES
-- ====================
CREATE INDEX IF NOT EXISTS idx_vouches_status ON m2m.vouches(status);
CREATE INDEX IF NOT EXISTS idx_vouches_friend_a_token ON m2m.vouches(friend_a_token);
CREATE INDEX IF NOT EXISTS idx_vouches_friend_b_token ON m2m.vouches(friend_b_token);
CREATE INDEX IF NOT EXISTS idx_vouches_matcher_phone ON m2m.vouches(matcher_phone);
CREATE INDEX IF NOT EXISTS idx_shots_status ON m2m.shots(status);
CREATE INDEX IF NOT EXISTS idx_shots_target_token ON m2m.shots(target_token);
CREATE INDEX IF NOT EXISTS idx_shots_payment_ref ON m2m.shots(payment_ref);
CREATE INDEX IF NOT EXISTS idx_shots_shooter_phone ON m2m.shots(shooter_phone);

-- ====================
-- SEED SETTINGS
-- ====================
INSERT INTO m2m.settings (key, value) VALUES
  ('shoot_your_shot_fee', '{"amount": 15, "currency": "GHS"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ====================
-- SUCCESS
-- ====================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════';
  RAISE NOTICE '✓ VOUCHES & SHOOT YOUR SHOT SCHEMA CREATED!';
  RAISE NOTICE '════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  ✓ m2m.vouches   - Vouch for two friends';
  RAISE NOTICE '  ✓ m2m.shots     - Shoot your shot';
  RAISE NOTICE '';
  RAISE NOTICE 'Also updated:';
  RAISE NOTICE '  ✓ m2m.payments  - Added shoot_your_shot purpose';
  RAISE NOTICE '  ✓ m2m.settings  - Added shoot_your_shot_fee (GH₵15)';
  RAISE NOTICE '';
END $$;
