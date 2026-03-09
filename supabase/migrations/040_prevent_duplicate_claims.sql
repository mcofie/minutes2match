-- Migration to prevent duplicate venue redemptions per user
-- This ensures a user can only claim a specific venue once, regardless of the match.

ALTER TABLE m2m.venue_redemptions 
  ADD CONSTRAINT unique_user_venue_redemption UNIQUE (user_id, venue_id);

-- Cleanup any existing duplicates if they exist (keeping the oldest one)
DELETE FROM m2m.venue_redemptions a
USING m2m.venue_redemptions b
WHERE a.id > b.id 
  AND a.user_id = b.user_id 
  AND a.venue_id = b.venue_id;
