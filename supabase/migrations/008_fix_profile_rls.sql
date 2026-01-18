-- Migration 008: Ensure Profile RLS is working correctly
-- This migration re-applies and verifies the RLS policies for profiles

-- First, ensure RLS is disabled temporarily to clear any issues
ALTER TABLE m2m.profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can insert own profile" ON m2m.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON m2m.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON m2m.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON m2m.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON m2m.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON m2m.profiles;
DROP POLICY IF EXISTS "allow_all_profiles" ON m2m.profiles;

-- Re-enable RLS
ALTER TABLE m2m.profiles ENABLE ROW LEVEL SECURITY;

-- Create fresh policies with clear names
-- SELECT policy: Users can view their own profile
CREATE POLICY "profiles_select_own" ON m2m.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- INSERT policy: Users can create their own profile
CREATE POLICY "profiles_insert_own" ON m2m.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- UPDATE policy: Users can update their own profile
CREATE POLICY "profiles_update_own" ON m2m.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Also ensure the service role can bypass RLS (default behavior, but being explicit)
-- Service role bypasses RLS by default, so we don't need a policy for it

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE ON m2m.profiles TO authenticated;
GRANT ALL ON m2m.profiles TO service_role;

-- Verify: List policies (for debugging - comment this out in production)
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';
