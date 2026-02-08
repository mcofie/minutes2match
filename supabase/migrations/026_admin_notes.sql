-- Migration 026: Add admin_notes column to profiles
-- Allows admins to add private notes about users

ALTER TABLE m2m.profiles ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Comment for documentation
COMMENT ON COLUMN m2m.profiles.admin_notes IS 'Private notes about a user, visible only to admins';
