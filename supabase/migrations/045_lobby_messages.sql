-- Lobby Messages table for realtime flash chat
CREATE TABLE IF NOT EXISTS m2m.lobby_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES m2m.matches(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id),
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE m2m.lobby_messages;

-- RLS Policies
ALTER TABLE m2m.lobby_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages for their matches"
ON m2m.lobby_messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM m2m.matches 
        WHERE m2m.matches.id = lobby_messages.match_id 
        AND (m2m.matches.user_1_id = auth.uid() OR m2m.matches.user_2_id = auth.uid())
    )
);

CREATE POLICY "Users can send messages to their matches"
ON m2m.lobby_messages FOR INSERT
WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
        SELECT 1 FROM m2m.matches 
        WHERE m2m.matches.id = lobby_messages.match_id 
        AND (m2m.matches.user_1_id = auth.uid() OR m2m.matches.user_2_id = auth.uid())
    )
);
