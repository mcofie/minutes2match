-- ================================================================
-- PASSKEY PERMISSIONS FIX
-- ====================
-- Ensures the 'authenticated' role can actually query their own
-- passkeys, while RLS keeps them restricted to their own rows.
-- ================================================================

-- 1. Grant usage on the schema if not already there (standard for M2M)
GRANT USAGE ON SCHEMA m2m TO authenticated;
GRANT USAGE ON SCHEMA m2m TO anon;

-- 2. Grant operations to the 'authenticated' role for user_passkeys
-- RLS policies already exist to restrict to auth.uid() = user_id
GRANT SELECT, DELETE ON m2m.user_passkeys TO authenticated;

-- 3. Ensure the 'service_role' still has full access (for our API routes)
GRANT ALL ON m2m.user_passkeys TO service_role;
GRANT ALL ON m2m.auth_challenges TO service_role;

-- 4. Log completion
DO $$
BEGIN
  RAISE NOTICE '✓ PASSKEY PERMISSIONS UPDATED';
END $$;
