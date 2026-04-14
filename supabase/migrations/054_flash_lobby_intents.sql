CREATE TABLE IF NOT EXISTS m2m.flash_lobby_intents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lobby_id UUID NOT NULL REFERENCES m2m.flash_lobbies(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'mutual', 'converted_to_match', 'declined', 'expired')),
    is_super_connect BOOLEAN NOT NULL DEFAULT false,
    super_connect_paid BOOLEAN NOT NULL DEFAULT false,
    match_id UUID NULL REFERENCES m2m.matches(id) ON DELETE SET NULL,
    mutual_at TIMESTAMPTZ NULL,
    receiver_notified_at TIMESTAMPTZ NULL,
    sender_notified_at TIMESTAMPTZ NULL,
    declined_at TIMESTAMPTZ NULL,
    expired_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT flash_lobby_intents_unique_pair UNIQUE (lobby_id, sender_id, receiver_id),
    CONSTRAINT flash_lobby_intents_no_self CHECK (sender_id <> receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_flash_lobby_intents_lobby_id ON m2m.flash_lobby_intents(lobby_id);
CREATE INDEX IF NOT EXISTS idx_flash_lobby_intents_sender_id ON m2m.flash_lobby_intents(sender_id);
CREATE INDEX IF NOT EXISTS idx_flash_lobby_intents_receiver_id ON m2m.flash_lobby_intents(receiver_id);
CREATE INDEX IF NOT EXISTS idx_flash_lobby_intents_match_id ON m2m.flash_lobby_intents(match_id);

CREATE OR REPLACE FUNCTION m2m.set_flash_lobby_intents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_flash_lobby_intents_updated_at ON m2m.flash_lobby_intents;
CREATE TRIGGER set_flash_lobby_intents_updated_at
BEFORE UPDATE ON m2m.flash_lobby_intents
FOR EACH ROW
EXECUTE FUNCTION m2m.set_flash_lobby_intents_updated_at();

ALTER TABLE m2m.flash_lobby_intents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own flash lobby intents" ON m2m.flash_lobby_intents;
CREATE POLICY "Users can view own flash lobby intents"
ON m2m.flash_lobby_intents FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can create own flash lobby intents" ON m2m.flash_lobby_intents;
CREATE POLICY "Users can create own flash lobby intents"
ON m2m.flash_lobby_intents FOR INSERT
WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can update own flash lobby intents" ON m2m.flash_lobby_intents;
CREATE POLICY "Users can update own flash lobby intents"
ON m2m.flash_lobby_intents FOR UPDATE
USING (auth.uid() = sender_id OR auth.uid() = receiver_id)
WITH CHECK (auth.uid() = sender_id OR auth.uid() = receiver_id);

GRANT ALL ON TABLE m2m.flash_lobby_intents TO service_role;
GRANT ALL ON TABLE m2m.flash_lobby_intents TO postgres;
GRANT SELECT, INSERT, UPDATE ON TABLE m2m.flash_lobby_intents TO authenticated;
