-- Migration 027: Add Dealbreakers and Profile Badges
-- Dealbreakers allow users to set non-negotiable match criteria
-- Badges provide visual indicators for profile achievements

-- Add dealbreakers JSONB column to profiles
-- Structure: { "genotype": ["AA"], "intent": ["marriage", "serious"], "min_age": 25, "max_age": 35, "religion": ["christian"] }
ALTER TABLE m2m.profiles ADD COLUMN IF NOT EXISTS dealbreakers JSONB DEFAULT '{}';

-- Add badges array column to profiles
-- Stores earned badge IDs: ["verified", "event_regular", "premium", "new_user", "fast_responder", "photo_verified"]
ALTER TABLE m2m.profiles ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT '{}';

-- Add age preference columns for dealbreakers UI
ALTER TABLE m2m.profiles ADD COLUMN IF NOT EXISTS min_age INT;
ALTER TABLE m2m.profiles ADD COLUMN IF NOT EXISTS max_age INT;

-- Add event attendance count for badges calculation
ALTER TABLE m2m.profiles ADD COLUMN IF NOT EXISTS events_attended INT DEFAULT 0;

-- Add response tracking for "fast responder" badge
ALTER TABLE m2m.profiles ADD COLUMN IF NOT EXISTS avg_response_time_hours DECIMAL(10,2);

-- Comments for documentation
COMMENT ON COLUMN m2m.profiles.dealbreakers IS 'User dealbreaker preferences as JSON (genotype, intent, age, religion filters)';
COMMENT ON COLUMN m2m.profiles.badges IS 'Array of earned badge IDs for profile display';
COMMENT ON COLUMN m2m.profiles.min_age IS 'Minimum preferred age for matches';
COMMENT ON COLUMN m2m.profiles.max_age IS 'Maximum preferred age for matches';
COMMENT ON COLUMN m2m.profiles.events_attended IS 'Count of events attended for badge calculation';

-- Create function to auto-calculate badges
CREATE OR REPLACE FUNCTION m2m.calculate_user_badges(user_id UUID)
RETURNS TEXT[] AS $$
DECLARE
  profile_record RECORD;
  badge_list TEXT[] := '{}';
  event_count INT;
  subscription_active BOOLEAN;
  profile_age_days INT;
BEGIN
  -- Get user profile
  SELECT * INTO profile_record FROM m2m.profiles WHERE id = user_id;
  
  IF NOT FOUND THEN
    RETURN badge_list;
  END IF;
  
  -- Verified badge
  IF profile_record.is_verified = TRUE THEN
    badge_list := array_append(badge_list, 'verified');
  END IF;
  
  -- New user badge (joined within 7 days)
  profile_age_days := EXTRACT(DAY FROM (NOW() - profile_record.created_at));
  IF profile_age_days <= 7 THEN
    badge_list := array_append(badge_list, 'new_user');
  END IF;
  
  -- Event regular badge (attended 3+ events)
  SELECT COUNT(*) INTO event_count 
  FROM m2m.event_bookings 
  WHERE user_id = profile_record.id AND status = 'confirmed';
  
  IF event_count >= 3 THEN
    badge_list := array_append(badge_list, 'event_regular');
  END IF;
  
  -- Premium badge (has active subscription)
  SELECT EXISTS(
    SELECT 1 FROM m2m.subscriptions 
    WHERE user_id = profile_record.id 
    AND status = 'active' 
    AND ends_at > NOW()
  ) INTO subscription_active;
  
  IF subscription_active THEN
    badge_list := array_append(badge_list, 'premium');
  END IF;
  
  -- Photo verified badge (has photo_url set)
  IF profile_record.photo_url IS NOT NULL AND profile_record.photo_url != '' THEN
    badge_list := array_append(badge_list, 'photo_verified');
  END IF;
  
  -- Fast responder badge (avg response time < 2 hours)
  IF profile_record.avg_response_time_hours IS NOT NULL AND profile_record.avg_response_time_hours < 2 THEN
    badge_list := array_append(badge_list, 'fast_responder');
  END IF;
  
  RETURN badge_list;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for faster badge queries
CREATE INDEX IF NOT EXISTS idx_profiles_badges ON m2m.profiles USING GIN(badges);
