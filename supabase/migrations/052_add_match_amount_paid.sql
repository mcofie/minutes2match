-- Migration: Add amount paid columns to matches
-- This allows us to distinguish between free unlocks, credit unlocks, and cash unlocks
-- and ensures that free matches don't qualify for credit refunds upon expiration.

ALTER TABLE m2m.matches 
  ADD COLUMN IF NOT EXISTS user_1_amount_paid NUMERIC(10, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS user_2_amount_paid NUMERIC(10, 2) DEFAULT 0.00;

-- Comment for clarity
COMMENT ON COLUMN m2m.matches.user_1_amount_paid IS 'The actual GHS amount paid by user 1 (0 for free, 15 for standard)';
COMMENT ON COLUMN m2m.matches.user_2_amount_paid IS 'The actual GHS amount paid by user 2 (0 for free, 15 for standard)';
