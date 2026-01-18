-- Complete RLS Fix: Allow signup flow for all tables
-- Run this in Supabase SQL Editor

-- =============================
-- PROFILES POLICIES
-- =============================
DROP POLICY IF EXISTS "Users can insert own profile" ON m2m.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON m2m.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON m2m.profiles;

CREATE POLICY "Users can insert own profile" ON m2m.profiles 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = id OR auth.role() = 'anon'
  );

CREATE POLICY "Users can view own profile" ON m2m.profiles 
  FOR SELECT 
  USING (
    auth.uid() = id OR auth.role() = 'anon'
  );

CREATE POLICY "Users can update own profile" ON m2m.profiles 
  FOR UPDATE 
  USING (
    auth.uid() = id OR auth.role() = 'anon'
  );

-- =============================
-- VIBE_ANSWERS POLICIES
-- =============================
DROP POLICY IF EXISTS "Users can view own vibe answers" ON m2m.vibe_answers;
DROP POLICY IF EXISTS "Users can insert own vibe answers" ON m2m.vibe_answers;
DROP POLICY IF EXISTS "Users can update own vibe answers" ON m2m.vibe_answers;

CREATE POLICY "Users can view own vibe answers" ON m2m.vibe_answers 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR auth.role() = 'anon'
  );

CREATE POLICY "Users can insert own vibe answers" ON m2m.vibe_answers 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id OR auth.role() = 'anon'
  );

CREATE POLICY "Users can update own vibe answers" ON m2m.vibe_answers 
  FOR UPDATE 
  USING (
    auth.uid() = user_id OR auth.role() = 'anon'
  );

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ All signup flow policies updated!';
  RAISE NOTICE '✅ You can now complete the vibe check flow!';
END $$;
