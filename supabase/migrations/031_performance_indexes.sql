-- Performance Optimization Indexes
-- These indexes target the most common query patterns in the dashboard to reduce latency.

-- 1. Matches Optimization
CREATE INDEX IF NOT EXISTS idx_matches_user_1_status ON m2m.matches(user_1_id, status);
CREATE INDEX IF NOT EXISTS idx_matches_user_2_status ON m2m.matches(user_2_id, status);
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON m2m.matches(created_at DESC);

-- 2. Subscriptions Optimization
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status_end ON m2m.subscriptions(user_id, status, end_date DESC);

-- 3. Payments Optimization
CREATE INDEX IF NOT EXISTS idx_payments_user_created ON m2m.payments(user_id, created_at DESC);

-- 4. Events Optimization
CREATE INDEX IF NOT EXISTS idx_events_status_date ON m2m.events(status, event_date ASC);

-- 5. Profile Lookup Optimization
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON m2m.profiles(is_active) WHERE is_active = true;
