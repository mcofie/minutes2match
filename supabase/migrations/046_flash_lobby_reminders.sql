-- Flash Lobby Reminders Table
CREATE TABLE IF NOT EXISTS m2m.flash_lobby_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lobby_id UUID NOT NULL REFERENCES m2m.flash_lobbies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lobby_id) -- One reminder per user per lobby
);

-- RLS Policies
ALTER TABLE m2m.flash_lobby_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own reminders"
ON m2m.flash_lobby_reminders FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all reminders"
ON m2m.flash_lobby_reminders FOR SELECT
USING (EXISTS (
    SELECT 1 FROM m2m.admins 
    WHERE m2m.admins.id = auth.uid()
));

-- Permissions
-- Explicitly grant access to service_role and authenticated users
GRANT ALL ON TABLE m2m.flash_lobby_reminders TO service_role;
GRANT ALL ON TABLE m2m.flash_lobby_reminders TO postgres;
GRANT SELECT, INSERT, DELETE ON TABLE m2m.flash_lobby_reminders TO authenticated;
