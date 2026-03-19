-- Migration 044: Enhance Matches with AI Data & Score Tracking
-- This ensures the dynamic matchmaker has all necessary columns to store synergy data.

-- 1. Ensure core match score and reasoning columns exist
-- Using individual ADD statements with DO blocks for idempotency

DO $$ 
BEGIN
  -- Match Score
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'm2m' AND table_name = 'matches' AND column_name = 'match_score') 
  THEN
    ALTER TABLE m2m.matches ADD COLUMN match_score INT DEFAULT 0;
  END IF;

  -- Match Reasons (Array of strings)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'm2m' AND table_name = 'matches' AND column_name = 'match_reasons') 
  THEN
    ALTER TABLE m2m.matches ADD COLUMN match_reasons TEXT[] DEFAULT '{}'::text[];
  END IF;

  -- Match Warnings (Array of strings)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'm2m' AND table_name = 'matches' AND column_name = 'match_warnings') 
  THEN
    ALTER TABLE m2m.matches ADD COLUMN match_warnings TEXT[] DEFAULT '{}'::text[];
  END IF;

  -- AI Deep Analysis / Explanation
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'm2m' AND table_name = 'matches' AND column_name = 'ai_analysis') 
  THEN
    ALTER TABLE m2m.matches ADD COLUMN ai_analysis TEXT;
  END IF;
  
  -- Created By Label (to distinguish Cron vs JIT vs Admin)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'm2m' AND table_name = 'matches' AND column_name = 'created_by_label') 
  THEN
    ALTER TABLE m2m.matches ADD COLUMN created_by_label TEXT DEFAULT 'admin';
  END IF;

END $$;

COMMENT ON COLUMN m2m.matches.match_score IS 'Compatibility score (0-100) calculated at time of match creation';
COMMENT ON COLUMN m2m.matches.ai_analysis IS 'AI-generated long-form explanation of why this match was created';
COMMENT ON COLUMN m2m.matches.created_by_label IS 'Source of the match: "cron", "system_jit", or "admin"';
