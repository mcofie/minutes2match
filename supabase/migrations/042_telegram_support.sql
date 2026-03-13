-- Migration 042: Add Telegram ID to profiles
-- This allows linking Telegram users to their M2M profile

ALTER TABLE m2m.profiles ADD COLUMN IF NOT EXISTS telegram_id TEXT UNIQUE;

-- Create index for faster lookup
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_id ON m2m.profiles(telegram_id);
