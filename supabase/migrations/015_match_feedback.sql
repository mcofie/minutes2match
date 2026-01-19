-- ================================================
-- Migration: Match Feedback System
-- Adds feedback tracking to matches table
-- ================================================

-- Add feedback columns to matches table
ALTER TABLE m2m.matches 
ADD COLUMN IF NOT EXISTS feedback_status TEXT CHECK (feedback_status IN ('pending', 'connected', 'no_response', 'unmatched', 'dating')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS feedback_notes TEXT,
ADD COLUMN IF NOT EXISTS feedback_updated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS feedback_updated_by UUID REFERENCES m2m.admins(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS user_1_contacted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS user_2_contacted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS contact_exchanged BOOLEAN DEFAULT FALSE;

-- Create index for feedback queries
CREATE INDEX IF NOT EXISTS idx_matches_feedback ON m2m.matches(feedback_status);

-- Comment for documentation
COMMENT ON COLUMN m2m.matches.feedback_status IS 'Status of match outcome: pending (no feedback yet), connected (users connected), no_response (one or both did not respond), unmatched (decided not to pursue), dating (relationship formed)';
COMMENT ON COLUMN m2m.matches.feedback_notes IS 'Admin notes about the match feedback';
COMMENT ON COLUMN m2m.matches.contact_exchanged IS 'Whether users exchanged contact information';

-- ================================================
-- User Activity Log Table
-- Tracks all user activities for timeline feature
-- ================================================

CREATE TABLE IF NOT EXISTS m2m.user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES m2m.profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'signup', 
    'verified', 
    'profile_updated', 
    'match_created', 
    'match_unlocked', 
    'event_registered', 
    'event_attended',
    'sms_received',
    'payment_made',
    'vibe_answered'
  )),
  activity_data JSONB DEFAULT '{}',
  related_id UUID, -- Reference to related entity (match_id, event_id, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_activity_user ON m2m.user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_type ON m2m.user_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_created ON m2m.user_activity_log(created_at DESC);

-- RLS
ALTER TABLE m2m.user_activity_log ENABLE ROW LEVEL SECURITY;

-- Admins can view and manage all activity logs
CREATE POLICY "Admins can manage activity logs" 
ON m2m.user_activity_log 
FOR ALL 
USING (
  EXISTS (SELECT 1 FROM m2m.admins WHERE id = auth.uid())
)
WITH CHECK (
  EXISTS (SELECT 1 FROM m2m.admins WHERE id = auth.uid())
);

-- Users can view their own activity
CREATE POLICY "Users can view own activity"
ON m2m.user_activity_log
FOR SELECT
USING (user_id = auth.uid());

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON m2m.user_activity_log TO authenticated;
