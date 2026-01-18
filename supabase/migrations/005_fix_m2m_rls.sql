-- Migration 005: Fix RLS Policies for m2m Schema
-- Applies proper Row Level Security to the m2m schema tables

-- 1. Grant Schema Usage
GRANT USAGE ON SCHEMA m2m TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA m2m TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA m2m TO authenticated;

-- 2. VIBE ANSWERS POLICIES
ALTER TABLE m2m.vibe_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own vibe answers" ON m2m.vibe_answers;
CREATE POLICY "Users can insert own vibe answers" ON m2m.vibe_answers
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own vibe answers" ON m2m.vibe_answers;
CREATE POLICY "Users can view own vibe answers" ON m2m.vibe_answers
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own vibe answers" ON m2m.vibe_answers;
CREATE POLICY "Users can update own vibe answers" ON m2m.vibe_answers
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- 3. PROFILES POLICIES (Ensuring these exist on m2m)
ALTER TABLE m2m.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own profile" ON m2m.profiles;
CREATE POLICY "Users can insert own profile" ON m2m.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own profile" ON m2m.profiles;
CREATE POLICY "Users can view own profile" ON m2m.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON m2m.profiles;
CREATE POLICY "Users can update own profile" ON m2m.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- 4. OTP CODES (Client-side usage support)
-- Allowing public insert/select to facilitate the client-side OTP flow if needed
ALTER TABLE m2m.otp_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon insert otp" ON m2m.otp_codes;
CREATE POLICY "Anon insert otp" ON m2m.otp_codes
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anon select otp" ON m2m.otp_codes;
CREATE POLICY "Anon select otp" ON m2m.otp_codes
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Anon update otp" ON m2m.otp_codes;
CREATE POLICY "Anon update otp" ON m2m.otp_codes
  FOR UPDATE TO anon, authenticated
  USING (true);

-- Grant explicit permissions on otp_codes for anon users (needed for OTP flow)
GRANT ALL ON m2m.otp_codes TO anon;
GRANT ALL ON m2m.otp_codes TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA m2m TO anon;

-- 5. QUESTIONS POLICIES (Allow public read for vibe check)
ALTER TABLE m2m.questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read questions" ON m2m.questions;
CREATE POLICY "Public can read questions" ON m2m.questions
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- Grant read access to questions
GRANT SELECT ON m2m.questions TO anon;
GRANT SELECT ON m2m.questions TO authenticated;
