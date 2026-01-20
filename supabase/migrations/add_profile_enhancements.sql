-- Migration: Add profile enhancement fields for better matching
-- Run this in your Supabase SQL editor

-- Add new columns to profiles table
ALTER TABLE m2m.profiles 
ADD COLUMN IF NOT EXISTS about_me TEXT,
ADD COLUMN IF NOT EXISTS min_age INTEGER DEFAULT 18,
ADD COLUMN IF NOT EXISTS max_age INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';

-- Add constraints
ALTER TABLE m2m.profiles
ADD CONSTRAINT check_min_age CHECK (min_age >= 18 AND min_age <= 100),
ADD CONSTRAINT check_max_age CHECK (max_age >= 18 AND max_age <= 100),
ADD CONSTRAINT check_age_range CHECK (max_age >= min_age);

-- Add index for faster filtering by interests (GIN index for array columns)
CREATE INDEX IF NOT EXISTS idx_profiles_interests ON m2m.profiles USING GIN (interests);

-- Comment on new columns
COMMENT ON COLUMN m2m.profiles.about_me IS 'User bio/about me text (max 300 chars)';
COMMENT ON COLUMN m2m.profiles.min_age IS 'Minimum preferred age for matches';
COMMENT ON COLUMN m2m.profiles.max_age IS 'Maximum preferred age for matches';
COMMENT ON COLUMN m2m.profiles.interests IS 'Array of interest tags for matching';
