-- ================================================================
-- APPLY LATEST FEATURES (Notifications & Match Tracking)
-- Run this file in your Supabase SQL Editor
-- ================================================================

-- 1. Notifications Table (from 028_notifications.sql)
CREATE TABLE IF NOT EXISTS m2m.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES m2m.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'badge_earned', 'match_created', 'match_unlocked', 'event_reminder', etc.
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}', -- Additional data like badge_id, match_id, etc.
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON m2m.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON m2m.notifications(user_id, read) WHERE read = FALSE;

-- Enable RLS for notifications
ALTER TABLE m2m.notifications ENABLE ROW LEVEL SECURITY;

-- Safely recreate policies for notifications
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view own notifications" ON m2m.notifications;
    DROP POLICY IF EXISTS "Users can update own notifications" ON m2m.notifications;
    DROP POLICY IF EXISTS "Service role can insert notifications" ON m2m.notifications;
END $$;

CREATE POLICY "Users can view own notifications" ON m2m.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON m2m.notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert notifications" ON m2m.notifications
    FOR INSERT WITH CHECK (true);

-- Grant permissions for notifications
GRANT ALL ON m2m.notifications TO authenticated;
GRANT ALL ON m2m.notifications TO service_role;


-- 2. Match Score & Payment Tracking (from 029_match_score_tracking.sql)

-- Add match_score column (0-100)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'm2m' AND table_name = 'matches' AND column_name = 'match_score') THEN
    ALTER TABLE m2m.matches ADD COLUMN match_score INT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'm2m' AND table_name = 'matches' AND column_name = 'match_reasons') THEN
    ALTER TABLE m2m.matches ADD COLUMN match_reasons JSONB DEFAULT '[]';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'm2m' AND table_name = 'matches' AND column_name = 'match_warnings') THEN
    ALTER TABLE m2m.matches ADD COLUMN match_warnings JSONB DEFAULT '[]';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'm2m' AND table_name = 'matches' AND column_name = 'last_payment_reminder_at') THEN
    ALTER TABLE m2m.matches ADD COLUMN last_payment_reminder_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'm2m' AND table_name = 'matches' AND column_name = 'payment_reminder_count') THEN
    ALTER TABLE m2m.matches ADD COLUMN payment_reminder_count INT DEFAULT 0;
  END IF;
END $$;

-- Index for querying matches by score
CREATE INDEX IF NOT EXISTS idx_matches_score ON m2m.matches(match_score DESC);

COMMENT ON COLUMN m2m.matches.match_score IS 'Compatibility score 0-100 calculated by matchmaker';
COMMENT ON COLUMN m2m.matches.match_reasons IS 'JSON array of positive compatibility factors';
COMMENT ON COLUMN m2m.matches.match_warnings IS 'JSON array of potential compatibility concerns';

-- Update types/permissions if needed (schema cache invalidation happened automatically)
NOTIFY pgrst, 'reload config';
