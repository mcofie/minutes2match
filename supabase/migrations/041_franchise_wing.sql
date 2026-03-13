-- Migration 041 - Minutes 2 Match Franchise Wing
-- Implements the infrastructure for external organizers (The "Matchmaker Engine")

-- ====================
-- FRANCHISE EVENTS
-- ====================
CREATE TABLE IF NOT EXISTS m2m.franchise_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    short_code TEXT UNIQUE DEFAULT substring(md5(random()::text) from 1 for 8),
    title TEXT NOT NULL,
    organizer_phone TEXT NOT NULL,
    access_code TEXT NOT NULL,
    status TEXT CHECK (status IN ('draft', 'active', 'completed')) DEFAULT 'draft',
    event_date TIMESTAMPTZ,
    location TEXT,
    fee_paid BOOLEAN DEFAULT FALSE,
    fee_amount DECIMAL(10,2) DEFAULT 350.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- Index for organizer access
CREATE INDEX IF NOT EXISTS idx_franchise_organizer_access ON m2m.franchise_events(organizer_phone, access_code);

-- ====================
-- EVENT PARTICIPANTS
-- ====================
-- Links M2M profiles to a specific franchise event
CREATE TABLE IF NOT EXISTS m2m.franchise_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    short_code TEXT UNIQUE DEFAULT substring(md5(random()::text) from 1 for 6),
    event_id UUID REFERENCES m2m.franchise_events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES m2m.profiles(id) ON DELETE CASCADE,
    participant_number TEXT, -- Their "Guest ID" at the event (e.g. #42)
    gatepass_ref TEXT, -- GatePass order reference for tracking
    gender TEXT CHECK (gender IN ('male', 'female')), -- Redundant but fast for filtering
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id),
    UNIQUE(event_id, participant_number)
);


-- ====================
-- SPEED DATE FEEDBACK
-- ====================
-- Stores the "Yes/No" votes from participants during the event
CREATE TABLE IF NOT EXISTS m2m.speed_date_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES m2m.franchise_events(id) ON DELETE CASCADE,
    from_user_id UUID REFERENCES m2m.profiles(id) ON DELETE CASCADE,
    to_participant_number TEXT NOT NULL, -- The number they saw on the badge
    vote BOOLEAN NOT NULL, -- TRUE = Yes, FALSE = No
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, from_user_id, to_participant_number)
);

-- ====================
-- RLS POLICIES
-- ====================
ALTER TABLE m2m.franchise_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE m2m.franchise_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE m2m.speed_date_feedback ENABLE ROW LEVEL SECURITY;

-- 1. Events: Public can only select (via server proxy)
DROP POLICY IF EXISTS "Public select franchise events" ON m2m.franchise_events;
CREATE POLICY "Public select franchise events" ON m2m.franchise_events FOR SELECT USING (true);

-- 2. Participants: Public can only select (via server proxy)
DROP POLICY IF EXISTS "Public select franchise participants" ON m2m.franchise_participants;
CREATE POLICY "Public select franchise participants" ON m2m.franchise_participants FOR SELECT USING (true);

-- 3. Feedback: Users can manage their own
DROP POLICY IF EXISTS "Users can view their own feedback" ON m2m.speed_date_feedback;
CREATE POLICY "Users can view their own feedback" ON m2m.speed_date_feedback
    FOR SELECT USING (auth.uid() = from_user_id);

DROP POLICY IF EXISTS "Users can submit their own feedback" ON m2m.speed_date_feedback;
CREATE POLICY "Users can submit their own feedback" ON m2m.speed_date_feedback
    FOR INSERT WITH CHECK (auth.uid() = from_user_id);


