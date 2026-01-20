-- Migration: Add match expiration support
-- Adds expires_at column to matches table for the 72-hour expiration feature

-- Add expires_at column to matches
ALTER TABLE m2m.matches 
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Add index for efficient expiration queries
CREATE INDEX IF NOT EXISTS idx_matches_expires_at ON m2m.matches(expires_at) 
WHERE status = 'partial_payment';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✓ Migration 017: Match expiration support added successfully!';
  RAISE NOTICE '✓ Added: expires_at column to matches table';
END $$;
