-- Add Trust Score to profiles
ALTER TABLE m2m.profiles 
ADD COLUMN IF NOT EXISTS trust_score INT DEFAULT 60; -- Start with a baseline of 60

-- Add comment for clarity
COMMENT ON COLUMN m2m.profiles.trust_score IS 'Gamified trust factor (0-100) based on verification and activity.';

-- Index for potential leaderboard or filtering
CREATE INDEX IF NOT EXISTS idx_profiles_trust_score ON m2m.profiles(trust_score);
