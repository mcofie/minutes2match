-- Add match score and compatibility details to matches table
-- This allows admins to see why users were matched

-- Add match_score column (0-100)
ALTER TABLE m2m.matches ADD COLUMN IF NOT EXISTS match_score INT;

-- Add match_reasons as JSONB array for storing compatibility breakdown
ALTER TABLE m2m.matches ADD COLUMN IF NOT EXISTS match_reasons JSONB DEFAULT '[]';

-- Add match_warnings as JSONB array for storing compatibility concerns
ALTER TABLE m2m.matches ADD COLUMN IF NOT EXISTS match_warnings JSONB DEFAULT '[]';

-- Add payment_reminder tracking
ALTER TABLE m2m.matches ADD COLUMN IF NOT EXISTS last_payment_reminder_at TIMESTAMPTZ;
ALTER TABLE m2m.matches ADD COLUMN IF NOT EXISTS payment_reminder_count INT DEFAULT 0;

-- Index for querying matches by score
CREATE INDEX IF NOT EXISTS idx_matches_score ON m2m.matches(match_score DESC);

COMMENT ON COLUMN m2m.matches.match_score IS 'Compatibility score 0-100 calculated by matchmaker';
COMMENT ON COLUMN m2m.matches.match_reasons IS 'JSON array of positive compatibility factors';
COMMENT ON COLUMN m2m.matches.match_warnings IS 'JSON array of potential compatibility concerns';
