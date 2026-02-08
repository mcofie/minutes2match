-- Add notifications table for in-app notifications
-- This table stores notifications for users including badge awards, match updates, etc.

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

-- Index for efficient user notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON m2m.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON m2m.notifications(user_id, read) WHERE read = FALSE;

-- Enable RLS
ALTER TABLE m2m.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON m2m.notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update (mark as read) their own notifications
CREATE POLICY "Users can update own notifications" ON m2m.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Service role can insert notifications (for admin/system use)
CREATE POLICY "Service role can insert notifications" ON m2m.notifications
    FOR INSERT WITH CHECK (true);

-- Grant permissions
GRANT ALL ON m2m.notifications TO authenticated;
GRANT ALL ON m2m.notifications TO service_role;
