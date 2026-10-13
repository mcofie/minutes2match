-- Wrong-code attempts are counted per code in the database (works across every server instance),
-- so a 6-digit code can't be brute-forced: after 5 wrong tries the code is burned.
ALTER TABLE m2m.otp_codes ADD COLUMN IF NOT EXISTS attempts integer NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS otp_codes_phone_active_idx ON m2m.otp_codes (phone) WHERE used = false;

-- Post-signup work (matching, welcome message, admin ping) runs once per member, after signup returns
ALTER TABLE m2m.profiles ADD COLUMN IF NOT EXISTS welcomed_at timestamptz;
-- Existing members have already been welcomed
UPDATE m2m.profiles SET welcomed_at = COALESCE(created_at, now()) WHERE welcomed_at IS NULL;
