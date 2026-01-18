-- ================================================================
-- MINUTES 2 MATCH - COMPLETE SCHEMA WITH ALL MIGRATIONS
-- ================================================================
-- Run this entire file in Supabase SQL Editor
-- This includes:
--   ✓ Base schema (profiles, events, matches, payments, etc.)
--   ✓ Mutual payment tracking (user_1_paid, user_2_paid)
--   ✓ Event qualifications system
--   ✓ Global settings table
--   ✓ All indexes and RLS policies
-- ================================================================

-- ====================
-- CREATE M2M SCHEMA
-- ====================
CREATE SCHEMA IF NOT EXISTS m2m;

-- Grant usage to authenticated users and service role
GRANT USAGE ON SCHEMA m2m TO authenticated, anon, service_role;
GRANT ALL ON SCHEMA m2m TO service_role;

-- ====================
-- PROFILES TABLE
-- ====================
CREATE TABLE IF NOT EXISTS m2m.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT UNIQUE NOT NULL,
  display_name TEXT,
  gender TEXT CHECK (gender IN ('male', 'female')),
  birth_date DATE,
  location TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  dating_persona TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================
-- VIBE ANSWERS TABLE
-- ====================
CREATE TABLE IF NOT EXISTS m2m.vibe_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES m2m.profiles(id) ON DELETE CASCADE,
  question_key TEXT NOT NULL,
  answer_value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_key)
);

-- ====================
-- OTP CODES TABLE (Custom Hubtel-based OTP, NOT Supabase Auth)
-- ====================
CREATE TABLE IF NOT EXISTS m2m.otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================
-- EVENTS TABLE
-- ====================
CREATE TABLE IF NOT EXISTS m2m.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  venue TEXT NOT NULL,
  venue_address TEXT,
  male_capacity INT NOT NULL,
  female_capacity INT NOT NULL,
  male_tickets_sold INT DEFAULT 0,
  female_tickets_sold INT DEFAULT 0,
  ticket_price_male DECIMAL(10,2) NOT NULL,
  ticket_price_female DECIMAL(10,2) NOT NULL,
  status TEXT CHECK (status IN ('draft', 'open', 'waitlist', 'sold_out', 'completed')) DEFAULT 'draft',
  cover_image_url TEXT,
  is_public BOOLEAN DEFAULT TRUE, -- If false, only qualified users can see
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================
-- PAYMENTS TABLE
-- ====================
CREATE TABLE IF NOT EXISTS m2m.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES m2m.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'GHS',
  provider TEXT CHECK (provider IN ('paystack', 'hubtel')) NOT NULL,
  provider_ref TEXT UNIQUE,
  purpose TEXT CHECK (purpose IN ('event_ticket', 'match_unlock')) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'success', 'failed')) DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================
-- EVENT BOOKINGS TABLE
-- ====================
CREATE TABLE IF NOT EXISTS m2m.event_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES m2m.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES m2m.profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'waitlisted', 'cancelled')) DEFAULT 'pending',
  payment_id UUID REFERENCES m2m.payments(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- ====================
-- EVENT QUALIFICATIONS TABLE (Admin assigns users to events)
-- ====================
CREATE TABLE IF NOT EXISTS m2m.event_qualifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES m2m.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES m2m.profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'qualified', 'invited')) DEFAULT 'qualified',
  notified_at TIMESTAMPTZ, -- When user was notified via SMS
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- ====================
-- MATCHES TABLE (With mutual payment tracking)
-- ====================
-- Note: Match is only fully unlocked when BOTH users have paid
CREATE TABLE IF NOT EXISTS m2m.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_1_id UUID REFERENCES m2m.profiles(id) ON DELETE CASCADE,
  user_2_id UUID REFERENCES m2m.profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending_payment', 'partial_payment', 'unlocked', 'rejected', 'expired')) DEFAULT 'pending_payment',
  unlock_price DECIMAL(10,2) NOT NULL,
  user_1_paid BOOLEAN DEFAULT FALSE,
  user_2_paid BOOLEAN DEFAULT FALSE,
  user_1_paid_at TIMESTAMPTZ,
  user_2_paid_at TIMESTAMPTZ,
  created_by UUID REFERENCES m2m.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  unlocked_at TIMESTAMPTZ,
  UNIQUE(user_1_id, user_2_id)
);

-- ====================
-- ADMINS TABLE
-- ====================
CREATE TABLE IF NOT EXISTS m2m.admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('super_admin', 'matchmaker')) DEFAULT 'matchmaker',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================
-- SETTINGS TABLE (Global configuration)
-- ====================
CREATE TABLE IF NOT EXISTS m2m.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================
-- QUESTIONS TABLE (Dynamic Vibe Check)
-- ====================
CREATE TABLE IF NOT EXISTS m2m.questions (
  key TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  category TEXT DEFAULT 'general',
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================
-- ADD NEW COLUMNS TO EXISTING TABLES
-- ====================
-- These ALTER statements add new columns if they don't exist
-- Safe to run multiple times

-- Add is_public to events (for qualification-based access)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'm2m' AND table_name = 'events' AND column_name = 'is_public') 
  THEN
    ALTER TABLE m2m.events ADD COLUMN is_public BOOLEAN DEFAULT TRUE;
  END IF;
END $$;

-- Add mutual payment columns to matches
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'm2m' AND table_name = 'matches' AND column_name = 'user_1_paid') 
  THEN
    ALTER TABLE m2m.matches ADD COLUMN user_1_paid BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'm2m' AND table_name = 'matches' AND column_name = 'user_2_paid') 
  THEN
    ALTER TABLE m2m.matches ADD COLUMN user_2_paid BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'm2m' AND table_name = 'matches' AND column_name = 'user_1_paid_at') 
  THEN
    ALTER TABLE m2m.matches ADD COLUMN user_1_paid_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'm2m' AND table_name = 'matches' AND column_name = 'user_2_paid_at') 
  THEN
    ALTER TABLE m2m.matches ADD COLUMN user_2_paid_at TIMESTAMPTZ;
  END IF;
END $$;

-- Update matches status constraint to include partial_payment
DO $$
BEGIN
  -- Drop old constraint if exists
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'matches_status_check' AND connamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'm2m')) THEN
    ALTER TABLE m2m.matches DROP CONSTRAINT matches_status_check;
  END IF;
  
  -- Add new constraint
  ALTER TABLE m2m.matches ADD CONSTRAINT matches_status_check 
    CHECK (status IN ('pending_payment', 'partial_payment', 'unlocked', 'rejected', 'expired'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ====================
-- GRANT TABLE PERMISSIONS
-- ====================
GRANT ALL ON ALL TABLES IN SCHEMA m2m TO service_role;
GRANT SELECT, INSERT, UPDATE ON m2m.profiles TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON m2m.vibe_answers TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON m2m.otp_codes TO authenticated, anon;
GRANT SELECT ON m2m.events TO authenticated, anon;
GRANT SELECT, INSERT ON m2m.event_bookings TO authenticated, anon;
GRANT SELECT, INSERT ON m2m.event_qualifications TO authenticated, anon;
GRANT SELECT ON m2m.matches TO authenticated, anon;
GRANT SELECT, INSERT ON m2m.payments TO authenticated, anon;
GRANT SELECT ON m2m.admins TO authenticated, anon;
GRANT SELECT ON m2m.settings TO authenticated, anon;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA m2m TO authenticated, anon;

-- ====================
-- ROW LEVEL SECURITY
-- ====================

ALTER TABLE m2m.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE m2m.vibe_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE m2m.otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE m2m.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE m2m.event_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE m2m.event_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE m2m.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE m2m.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE m2m.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE m2m.settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
  -- Profiles
  DROP POLICY IF EXISTS "Users can view own profile" ON m2m.profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON m2m.profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON m2m.profiles;
  -- Vibe answers
  DROP POLICY IF EXISTS "Users can view own vibe answers" ON m2m.vibe_answers;
  DROP POLICY IF EXISTS "Users can insert own vibe answers" ON m2m.vibe_answers;
  DROP POLICY IF EXISTS "Users can update own vibe answers" ON m2m.vibe_answers;
  -- OTP
  DROP POLICY IF EXISTS "Anyone can manage otp codes" ON m2m.otp_codes;
  -- Events
  DROP POLICY IF EXISTS "Anyone can view open events" ON m2m.events;
  -- Event bookings
  DROP POLICY IF EXISTS "Users can view own bookings" ON m2m.event_bookings;
  DROP POLICY IF EXISTS "Users can create bookings" ON m2m.event_bookings;
  -- Event qualifications
  DROP POLICY IF EXISTS "Users can view own qualifications" ON m2m.event_qualifications;
  -- Matches
  DROP POLICY IF EXISTS "Users see own matches" ON m2m.matches;
  -- Payments
  DROP POLICY IF EXISTS "Users can view own payments" ON m2m.payments;
  DROP POLICY IF EXISTS "Users can insert payments" ON m2m.payments;
  -- Admins
  DROP POLICY IF EXISTS "Admins can view own record" ON m2m.admins;
  -- Settings
  DROP POLICY IF EXISTS "Anyone can read settings" ON m2m.settings;
END $$;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON m2m.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON m2m.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON m2m.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Vibe answers policies
CREATE POLICY "Users can view own vibe answers" ON m2m.vibe_answers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vibe answers" ON m2m.vibe_answers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vibe answers" ON m2m.vibe_answers FOR UPDATE USING (auth.uid() = user_id);

-- OTP codes - Allow anon users to read/write for verification flow
CREATE POLICY "Anyone can manage otp codes" ON m2m.otp_codes FOR ALL USING (true);

-- Events policies (allow viewing public events OR events user is qualified for)
CREATE POLICY "Anyone can view open events" ON m2m.events FOR SELECT USING (
  status IN ('open', 'waitlist', 'sold_out') 
  AND (is_public = TRUE OR EXISTS (
    SELECT 1 FROM m2m.event_qualifications 
    WHERE event_id = m2m.events.id AND user_id = auth.uid()
  ))
);

-- Event bookings policies
CREATE POLICY "Users can view own bookings" ON m2m.event_bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookings" ON m2m.event_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Event qualifications policies
CREATE POLICY "Users can view own qualifications" ON m2m.event_qualifications FOR SELECT USING (auth.uid() = user_id);

-- Matches policies
CREATE POLICY "Users see own matches" ON m2m.matches FOR SELECT USING (auth.uid() = user_1_id OR auth.uid() = user_2_id);

-- Payments policies
CREATE POLICY "Users can view own payments" ON m2m.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert payments" ON m2m.payments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins policies
CREATE POLICY "Admins can view own record" ON m2m.admins FOR SELECT USING (auth.uid() = id);

-- Settings policies (public read)
CREATE POLICY "Anyone can read settings" ON m2m.settings FOR SELECT USING (true);

-- ====================
-- INDEXES
-- ====================
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON m2m.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON m2m.profiles(gender);
CREATE INDEX IF NOT EXISTS idx_profiles_verified ON m2m.profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_events_status ON m2m.events(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON m2m.events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_public ON m2m.events(is_public);
CREATE INDEX IF NOT EXISTS idx_matches_status ON m2m.matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_user_1_paid ON m2m.matches(user_1_paid);
CREATE INDEX IF NOT EXISTS idx_matches_user_2_paid ON m2m.matches(user_2_paid);
CREATE INDEX IF NOT EXISTS idx_event_qualifications_event ON m2m.event_qualifications(event_id);
CREATE INDEX IF NOT EXISTS idx_event_qualifications_user ON m2m.event_qualifications(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON m2m.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_purpose ON m2m.payments(purpose);

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
-- SUCCESS MESSAGE
-- ====================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════';
  RAISE NOTICE '✓ MINUTES 2 MATCH SCHEMA CREATED SUCCESSFULLY!';
  RAISE NOTICE '════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  ✓ m2m.profiles          - User profiles';
  RAISE NOTICE '  ✓ m2m.vibe_answers      - Onboarding quiz answers';
  RAISE NOTICE '  ✓ m2m.otp_codes         - Custom SMS OTP codes (Hubtel)';
  RAISE NOTICE '  ✓ m2m.events            - Speed dating events';
  RAISE NOTICE '  ✓ m2m.event_bookings    - Event ticket bookings';
  RAISE NOTICE '  ✓ m2m.event_qualifications - User-to-event assignments';
  RAISE NOTICE '  ✓ m2m.matches           - User matches (with mutual payment)';
  RAISE NOTICE '  ✓ m2m.payments          - Paystack payment records';
  RAISE NOTICE '  ✓ m2m.admins            - Admin users';
  RAISE NOTICE '  ✓ m2m.settings          - Global configuration';
  RAISE NOTICE '';
  RAISE NOTICE 'Features included:';
  RAISE NOTICE '  ✓ Mutual payment unlock (both users must pay)';
  RAISE NOTICE '  ✓ Event qualification system';
  RAISE NOTICE '  ✓ Custom OTP via Hubtel (not Supabase Auth)';
  RAISE NOTICE '  ✓ Row Level Security enabled';
  RAISE NOTICE '  ✓ Performance indexes';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Set environment variables (Supabase, Paystack, Hubtel)';
  RAISE NOTICE '  2. Create an admin user via auth.users';
  RAISE NOTICE '  3. Insert admin into m2m.admins table';
  RAISE NOTICE '';
END $$;
