-- Migration 043: Add extracted preferences column to profiles
-- This stores structured data parsed from the 'about_me' field by AI

ALTER TABLE m2m.profiles 
ADD COLUMN IF NOT EXISTS preferences_extracted JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN m2m.profiles.preferences_extracted IS 'Structured preferences and traits extracted from user bio via AI';
