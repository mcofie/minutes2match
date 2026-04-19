-- Migration: Drop UNIQUE constraint on otp_codes.phone
-- Reason: Allow multiple valid OTP codes per phone to coexist briefly.
-- This fixes the race condition where auto-failover sends a backup code,
-- overwriting the original code before the user can enter it.

-- Step 1: Drop the CONSTRAINT first (this also drops the backing index)
ALTER TABLE m2m.otp_codes DROP CONSTRAINT IF EXISTS otp_codes_phone_key;

-- Step 2: Add a non-unique index on phone for query performance
CREATE INDEX IF NOT EXISTS idx_otp_codes_phone ON m2m.otp_codes(phone);

-- Step 3: Add an index on expires_at to speed up cleanup queries
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON m2m.otp_codes(expires_at);

-- Verify
DO $$
BEGIN
  RAISE NOTICE '✓ otp_codes UNIQUE constraint on phone dropped successfully';
  RAISE NOTICE '  Multiple OTP codes can now coexist per phone number';
END $$;
