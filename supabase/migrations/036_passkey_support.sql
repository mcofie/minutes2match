-- ================================================================
-- PASSKEY (WEBAUTHN) SUPPORT
-- ================================================================
-- Adds:
--   ✓ m2m.user_passkeys    - Stores public keys for FaceID/TouchID
--   ✓ m2m.auth_challenges  - Temporary storage for verification challenges
--   ✓ RLS policies & indexes
-- ================================================================

-- ====================
-- USER PASSKEYS TABLE
-- ====================
CREATE TABLE IF NOT EXISTS m2m.user_passkeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credential_id TEXT NOT NULL UNIQUE,  -- Base64URL encoded
  public_key BYTEA NOT NULL,           -- Public key bytes
  counter BIGINT NOT NULL DEFAULT 0,   -- Safety counter
  transports TEXT[],                   -- ['internal', 'usb', etc]
  name TEXT,                           -- Device label
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

-- ====================
-- AUTH CHALLENGES TABLE
-- ====================
-- Used to store challenges between the 'options' and 'verify' steps
CREATE TABLE IF NOT EXISTS m2m.auth_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id), -- NULL for login, set for registration
  challenge TEXT NOT NULL,
  origin TEXT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes')
);

-- ====================
-- PERMISSIONS
-- ====================
GRANT ALL ON m2m.user_passkeys TO service_role;
GRANT ALL ON m2m.auth_challenges TO service_role;

-- Authenticated users can manage their own passkeys
ALTER TABLE m2m.user_passkeys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own passkeys" ON m2m.user_passkeys;
CREATE POLICY "Users can view their own passkeys" ON m2m.user_passkeys
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own passkeys" ON m2m.user_passkeys;
CREATE POLICY "Users can delete their own passkeys" ON m2m.user_passkeys
  FOR DELETE USING (auth.uid() = user_id);

-- Auth challenges are internal, managed by service role
ALTER TABLE m2m.auth_challenges ENABLE ROW LEVEL SECURITY;

-- ====================
-- INDEXES
-- ====================
CREATE INDEX IF NOT EXISTS idx_passkeys_user_id ON m2m.user_passkeys(user_id);
CREATE INDEX IF NOT EXISTS idx_passkeys_credential_id ON m2m.user_passkeys(credential_id);
CREATE INDEX IF NOT EXISTS idx_challenges_expires_at ON m2m.auth_challenges(expires_at);

-- ====================
-- SUCCESS
-- ====================
DO $$
BEGIN
  RAISE NOTICE '✓ PASSKEY SUPPORT SCHEMA CREATED!';
END $$;
