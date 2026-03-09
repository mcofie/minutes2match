-- Migration to enhance partner venues and redemptions
-- 1. Add expiration and visibility fields to partner_venues
ALTER TABLE m2m.partner_venues 
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS visibility_tier TEXT DEFAULT 'all' CHECK (visibility_tier IN ('all', 'premium', 'matchmaker_curated'));

-- 2. Add expires_at to venue_redemptions (default to 24 hours after creation if not specified)
ALTER TABLE m2m.venue_redemptions 
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours');

-- 3. Update visibility policy for venues
DROP POLICY IF EXISTS "Anyone can view active venues" ON m2m.partner_venues;
CREATE POLICY "Anyone can view active venues" ON m2m.partner_venues
  FOR SELECT USING (
    is_active = TRUE AND 
    (expires_at IS NULL OR expires_at > NOW())
  );

-- 4. Create index for performance
CREATE INDEX IF NOT EXISTS idx_venue_redemptions_user_id ON m2m.venue_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_venue_redemptions_venue_id ON m2m.venue_redemptions(venue_id);
CREATE INDEX IF NOT EXISTS idx_partner_venues_is_active_expires ON m2m.partner_venues(is_active, expires_at);
