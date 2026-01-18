-- Minutes 2 Match - CLEAN RESET & SETUP (m2m schema)
-- This will DROP and RECREATE everything
-- ⚠️ WARNING: This will delete all existing data!

-- ====================
-- DROP EXISTING POLICIES
-- ====================
DROP POLICY IF EXISTS "Users can view own profile" ON m2m.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON m2m.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON m2m.profiles;
DROP POLICY IF EXISTS "Users can view own vibe answers" ON m2m.vibe_answers;
DROP POLICY IF EXISTS "Users can insert own vibe answers" ON m2m.vibe_answers;
DROP POLICY IF EXISTS "Users can update own vibe answers" ON m2m.vibe_answers;
DROP POLICY IF EXISTS "Anyone can manage otp codes" ON m2m.otp_codes;
DROP POLICY IF EXISTS "Anyone can view open events" ON m2m.events;
DROP POLICY IF EXISTS "Users can view own bookings" ON m2m.event_bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON m2m.event_bookings;
DROP POLICY IF EXISTS "Users see own matches" ON m2m.matches;
DROP POLICY IF EXISTS "Users can view own payments" ON m2m.payments;
DROP POLICY IF EXISTS "Admins can view own record" ON m2m.admins;

-- ====================
-- DROP EXISTING TABLES
-- ====================
DROP TABLE IF EXISTS m2m.event_bookings CASCADE;
DROP TABLE IF EXISTS m2m.matches CASCADE;
DROP TABLE IF EXISTS m2m.payments CASCADE;
DROP TABLE IF EXISTS m2m.vibe_answers CASCADE;
DROP TABLE IF EXISTS m2m.otp_codes CASCADE;
DROP TABLE IF EXISTS m2m.events CASCADE;
DROP TABLE IF EXISTS m2m.admins CASCADE;
DROP TABLE IF EXISTS m2m.profiles CASCADE;

-- ====================
-- DROP AND RECREATE SCHEMA
-- ====================
DROP SCHEMA IF EXISTS m2m CASCADE;
CREATE SCHEMA m2m;

-- Grant permissions
GRANT USAGE ON SCHEMA m2m TO authenticated, anon, service_role;
GRANT ALL ON SCHEMA m2m TO service_role;

-- ====================
-- CREATE TABLES
-- ====================

-- PROFILES
CREATE TABLE m2m.profiles (
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

-- VIBE ANSWERS
CREATE TABLE m2m.vibe_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES m2m.profiles(id) ON DELETE CASCADE,
  question_key TEXT NOT NULL,
  answer_value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_key)
);

-- OTP CODES
CREATE TABLE m2m.otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EVENTS
CREATE TABLE m2m.events (
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PAYMENTS
CREATE TABLE m2m.payments (
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

-- EVENT BOOKINGS
CREATE TABLE m2m.event_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES m2m.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES m2m.profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'waitlisted', 'cancelled')) DEFAULT 'pending',
  payment_id UUID REFERENCES m2m.payments(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- MATCHES
-- Note: Match is only fully unlocked when BOTH users have paid
CREATE TABLE m2m.matches (
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

-- ADMINS
CREATE TABLE m2m.admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('super_admin', 'matchmaker')) DEFAULT 'matchmaker',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================
-- GRANT TABLE PERMISSIONS
-- ====================
GRANT ALL ON ALL TABLES IN SCHEMA m2m TO service_role;
GRANT SELECT, INSERT, UPDATE ON m2m.profiles TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON m2m.vibe_answers TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON m2m.otp_codes TO authenticated, anon;
GRANT SELECT ON m2m.events TO authenticated, anon;
GRANT SELECT, INSERT ON m2m.event_bookings TO authenticated, anon;
GRANT SELECT ON m2m.matches TO authenticated, anon;
GRANT SELECT ON m2m.payments TO authenticated, anon;
GRANT SELECT ON m2m.admins TO authenticated, anon;

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
ALTER TABLE m2m.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE m2m.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE m2m.admins ENABLE ROW LEVEL SECURITY;

-- ====================
-- CREATE POLICIES
-- ====================

-- Profiles
CREATE POLICY "Users can view own profile" ON m2m.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON m2m.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON m2m.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Vibe answers
CREATE POLICY "Users can view own vibe answers" ON m2m.vibe_answers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vibe answers" ON m2m.vibe_answers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vibe answers" ON m2m.vibe_answers FOR UPDATE USING (auth.uid() = user_id);

-- OTP codes - Allow anyone to manage for verification
CREATE POLICY "Anyone can manage otp codes" ON m2m.otp_codes FOR ALL USING (true);

-- Events
CREATE POLICY "Anyone can view open events" ON m2m.events FOR SELECT USING (status IN ('open', 'waitlist', 'sold_out'));

-- Event bookings
CREATE POLICY "Users can view own bookings" ON m2m.event_bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookings" ON m2m.event_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Matches
CREATE POLICY "Users see own matches" ON m2m.matches FOR SELECT USING (auth.uid() = user_1_id OR auth.uid() = user_2_id);

-- Payments
CREATE POLICY "Users can view own payments" ON m2m.payments FOR SELECT USING (auth.uid() = user_id);

-- Admins
CREATE POLICY "Admins can view own record" ON m2m.admins FOR SELECT USING (auth.uid() = id);

-- ====================
-- INDEXES
-- ====================
CREATE INDEX idx_profiles_phone ON m2m.profiles(phone);
CREATE INDEX idx_profiles_gender ON m2m.profiles(gender);
CREATE INDEX idx_events_status ON m2m.events(status);
CREATE INDEX idx_events_date ON m2m.events(event_date);

-- ====================
-- SUCCESS MESSAGE
-- ====================
DO $$
BEGIN
  RAISE NOTICE '✓ Minutes 2 Match (m2m) schema created successfully!';
  RAISE NOTICE '✓ All tables, policies, and permissions configured.';
  RAISE NOTICE '✓ You can now use the Vibe Check with code: 111111';
END $$;
