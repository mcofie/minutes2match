-- Create Partner Venues table
CREATE TABLE IF NOT EXISTS m2m.partner_venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'restaurant', 'bar', 'activity'
  location TEXT NOT NULL,
  description TEXT,
  discount_label TEXT NOT NULL,
  image_url TEXT,
  website_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create redemptions table to track claims
CREATE TABLE IF NOT EXISTS m2m.venue_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES m2m.profiles(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES m2m.partner_venues(id) ON DELETE CASCADE,
  match_id UUID REFERENCES m2m.matches(id) ON DELETE SET NULL,
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT CHECK (status IN ('pending', 'verified', 'expired')) DEFAULT 'pending'
);

-- Enable RLS
ALTER TABLE m2m.partner_venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE m2m.venue_redemptions ENABLE ROW LEVEL SECURITY;

-- Policies for partner_venues: Everyone can view active venues
DROP POLICY IF EXISTS "Anyone can view active venues" ON m2m.partner_venues;
CREATE POLICY "Anyone can view active venues" ON m2m.partner_venues
  FOR SELECT USING (is_active = TRUE);

-- Policies for venue_redemptions: Users can manage their own redemptions
DROP POLICY IF EXISTS "Users can manage own redemptions" ON m2m.venue_redemptions;
CREATE POLICY "Users can manage own redemptions" ON m2m.venue_redemptions
  FOR ALL USING (auth.uid() = user_id);

-- Admins can manage everything
DROP POLICY IF EXISTS "Admins can manage venues" ON m2m.partner_venues;
CREATE POLICY "Admins can manage venues" ON m2m.partner_venues
  FOR ALL USING (EXISTS (SELECT 1 FROM m2m.admins WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Admins can manage redemptions" ON m2m.venue_redemptions;
CREATE POLICY "Admins can manage redemptions" ON m2m.venue_redemptions
  FOR ALL USING (EXISTS (SELECT 1 FROM m2m.admins WHERE id = auth.uid()));

-- Ensure the update_updated_at function exists in the m2m schema
CREATE OR REPLACE FUNCTION m2m.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at on partner_venues
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'partner_venues_updated_at') THEN
        CREATE TRIGGER partner_venues_updated_at
          BEFORE UPDATE ON m2m.partner_venues
          FOR EACH ROW
          EXECUTE FUNCTION m2m.update_updated_at();
    END IF;
END $$;

-- Seed some initial venues
INSERT INTO m2m.partner_venues (name, type, location, description, discount_label, image_url)
VALUES 
('Skybar 25', 'restaurant', 'Villagio, Airport', 'The most iconic rooftop lounge in Accra with a 360-degree view of the city. Perfect for cocktails at sunset.', '15% OFF TOTAL BILL', 'https://images.unsplash.com/photo-1574096079513-d8259312b785?q=80&w=600&auto=format&fit=crop'),
('Santoku', 'restaurant', 'Airport City', 'Contemporary Japanese dining in a sophisticated setting. Ideal for those who enjoy world-class sushi and refined vibes.', 'FREE WELCOME SAKE', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=600&auto=format&fit=crop'),
('The Republic Bar', 'bar', 'Osu, Accra', 'Afro-centric vibes, home-made spirits, and the best Kokroko in the city. For a date that values character and culture.', 'BUY One GET ONE KOKROKO', 'https://images.unsplash.com/photo-1514361892635-6b07e31e75f9?q=80&w=600&auto=format&fit=crop')
ON CONFLICT DO NOTHING;

-- Grant permissions
-- 1. Schema-level usage (Critical for custom schemas)
GRANT USAGE ON SCHEMA m2m TO anon;
GRANT USAGE ON SCHEMA m2m TO authenticated;
GRANT USAGE ON SCHEMA m2m TO service_role;

-- 2. Table-level permissions
GRANT ALL ON m2m.partner_venues TO authenticated;
GRANT ALL ON m2m.venue_redemptions TO authenticated;
GRANT ALL ON m2m.partner_venues TO postgres;
GRANT ALL ON m2m.venue_redemptions TO postgres;
GRANT ALL ON m2m.partner_venues TO service_role;
GRANT ALL ON m2m.venue_redemptions TO service_role;

-- 3. Sequence permissions (If any were created, though UUIDs don't use them, it's good practice)
GRANT ALL ON ALL SEQUENCES IN SCHEMA m2m TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA m2m TO service_role;
