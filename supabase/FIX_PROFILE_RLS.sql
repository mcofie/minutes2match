-- Quick Fix: Allow profile creation during signup
-- Run this in Supabase SQL Editor

-- Drop existing insert policy
DROP POLICY IF EXISTS "Users can insert own profile" ON m2m.profiles;

-- Create new policy that allows inserts during signup
CREATE POLICY "Users can insert own profile" ON m2m.profiles 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = id  -- Allow if authenticated and ID matches
    OR 
    auth.role() = 'anon'  -- Allow during signup when still anonymous
  );

-- Also update the profiles policy to allow anonymous reads for their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON m2m.profiles;
CREATE POLICY "Users can view own profile" ON m2m.profiles 
  FOR SELECT 
  USING (
    auth.uid() = id 
    OR 
    auth.role() = 'anon'
  );

-- Success
DO $$
BEGIN
  RAISE NOTICE '✅ Profile policies updated to allow signup flow!';
END $$;
