-- Minutes 2 Match v2 - Initial Schema
-- Run this migration in your Supabase SQL Editor

-- ====================
-- PROFILES TABLE
-- ====================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT UNIQUE NOT NULL,
  display_name TEXT,
  gender TEXT CHECK (gender IN ('male', 'female')),
  birth_date DATE,
  location TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  dating_persona TEXT, -- e.g., "power_player", "romantic", "adventurer"
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================
-- VIBE ANSWERS TABLE
-- ====================
CREATE TABLE IF NOT EXISTS vibe_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  question_key TEXT NOT NULL, -- e.g., "money_talks", "sunday_morning"
  answer_value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_key)
);

-- ====================
-- EVENTS TABLE
-- ====================
CREATE TABLE IF NOT EXISTS events (
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

-- ====================
-- PAYMENTS TABLE (created before event_bookings for FK reference)
-- ====================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS event_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'waitlisted', 'cancelled')) DEFAULT 'pending',
  payment_id UUID REFERENCES payments(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- ====================
-- MATCHES TABLE
-- ====================
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending_payment', 'unlocked', 'rejected', 'expired')) DEFAULT 'pending_payment',
  unlock_price DECIMAL(10,2) NOT NULL,
  created_by UUID REFERENCES profiles(id), -- Admin who created the match
  created_at TIMESTAMPTZ DEFAULT NOW(),
  unlocked_at TIMESTAMPTZ,
  UNIQUE(user_1_id, user_2_id)
);

-- ====================
-- ADMINS TABLE
-- ====================
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('super_admin', 'matchmaker')) DEFAULT 'matchmaker',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================
-- OTP CODES TABLE (for phone verification)
-- ====================
CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================
-- ROW LEVEL SECURITY POLICIES
-- ====================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vibe_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- PROFILES: Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- VIBE ANSWERS: Users can manage their own answers
CREATE POLICY "Users can view own vibe answers" ON vibe_answers 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vibe answers" ON vibe_answers 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vibe answers" ON vibe_answers 
  FOR UPDATE USING (auth.uid() = user_id);

-- EVENTS: Anyone can view open events
CREATE POLICY "Anyone can view open events" ON events 
  FOR SELECT USING (status IN ('open', 'waitlist', 'sold_out'));

-- Admins can manage events
CREATE POLICY "Admins can manage events" ON events 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- EVENT BOOKINGS: Users can view their own bookings
CREATE POLICY "Users can view own bookings" ON event_bookings 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings" ON event_bookings 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- MATCHES: Users can only see matches they're part of
CREATE POLICY "Users see own matches" ON matches 
  FOR SELECT USING (auth.uid() = user_1_id OR auth.uid() = user_2_id);

-- PAYMENTS: Users can view their own payments
CREATE POLICY "Users can view own payments" ON payments 
  FOR SELECT USING (auth.uid() = user_id);

-- OTP CODES: Server-side only (service role)
-- No user-facing policies for OTP codes

-- ADMINS: Admins can view their own record
CREATE POLICY "Admins can view own record" ON admins 
  FOR SELECT USING (auth.uid() = id);

-- ====================
-- INDEXES FOR PERFORMANCE
-- ====================
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON profiles(gender);
CREATE INDEX IF NOT EXISTS idx_profiles_persona ON profiles(dating_persona);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_event_bookings_event ON event_bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_event_bookings_user ON event_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_users ON matches(user_1_id, user_2_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_ref ON payments(provider_ref);

-- ====================
-- FUNCTIONS & TRIGGERS
-- ====================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
CREATE OR REPLACE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Function to increment ticket count on confirmed booking
CREATE OR REPLACE FUNCTION update_ticket_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND (OLD IS NULL OR OLD.status != 'confirmed') THEN
    -- Get user gender
    DECLARE
      user_gender TEXT;
    BEGIN
      SELECT gender INTO user_gender FROM profiles WHERE id = NEW.user_id;
      
      IF user_gender = 'male' THEN
        UPDATE events SET male_tickets_sold = male_tickets_sold + 1 WHERE id = NEW.event_id;
      ELSIF user_gender = 'female' THEN
        UPDATE events SET female_tickets_sold = female_tickets_sold + 1 WHERE id = NEW.event_id;
      END IF;
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for ticket count
CREATE OR REPLACE TRIGGER booking_ticket_count
  AFTER INSERT OR UPDATE ON event_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_count();

-- ====================
-- GRANT TABLE PERMISSIONS
-- ====================
-- Allow authenticated users to SELECT/INSERT/UPDATE on their tables
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON vibe_answers TO authenticated;
GRANT SELECT ON events TO authenticated;
GRANT SELECT, INSERT ON event_bookings TO authenticated;
GRANT SELECT ON matches TO authenticated;
GRANT SELECT ON payments TO authenticated;

-- Service role gets full access
GRANT ALL ON ALL TABLES IN SCHEMA m2m TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA m2m TO service_role;
