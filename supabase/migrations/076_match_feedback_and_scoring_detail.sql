-- Migration: 076_match_feedback_and_scoring_detail.sql
--
-- 1. Members tell us how their introduction went. Each person answers separately
--    (user_1_feedback / user_2_feedback); feedback_status stays the admin-facing summary.
-- 2. Keep the score's breakdown and confidence on each match, so outcomes can be compared
--    against what the scorer predicted when it's time to tune the weights.
-- 3. selection_note: why a pair was chosen when the AI picked between close candidates.
-- 4. profiles.bio_embeddings: vectors of what a member is looking for and how they describe
--    themselves (from their bio), used to compare bios by meaning rather than keywords.

ALTER TABLE m2m.matches ADD COLUMN IF NOT EXISTS user_1_feedback TEXT
  CHECK (user_1_feedback IS NULL OR user_1_feedback IN ('going_well', 'chatting', 'not_a_fit', 'no_reply'));
ALTER TABLE m2m.matches ADD COLUMN IF NOT EXISTS user_2_feedback TEXT
  CHECK (user_2_feedback IS NULL OR user_2_feedback IN ('going_well', 'chatting', 'not_a_fit', 'no_reply'));
ALTER TABLE m2m.matches ADD COLUMN IF NOT EXISTS user_1_feedback_at TIMESTAMPTZ;
ALTER TABLE m2m.matches ADD COLUMN IF NOT EXISTS user_2_feedback_at TIMESTAMPTZ;
ALTER TABLE m2m.matches ADD COLUMN IF NOT EXISTS feedback_requested_at TIMESTAMPTZ;

ALTER TABLE m2m.matches ADD COLUMN IF NOT EXISTS match_breakdown JSONB;
ALTER TABLE m2m.matches ADD COLUMN IF NOT EXISTS match_confidence INT;
ALTER TABLE m2m.matches ADD COLUMN IF NOT EXISTS selection_note TEXT;

CREATE INDEX IF NOT EXISTS matches_feedback_requested_idx ON m2m.matches (feedback_requested_at) WHERE feedback_requested_at IS NULL;

ALTER TABLE m2m.profiles ADD COLUMN IF NOT EXISTS bio_embeddings JSONB;
