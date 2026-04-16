-- ============================================================
-- Migration 059: Flash Lobby attendance sessions & lifecycle markers
-- ============================================================

CREATE TABLE IF NOT EXISTS m2m.flash_lobby_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lobby_id UUID NOT NULL REFERENCES m2m.flash_lobbies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'left')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    left_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT flash_lobby_sessions_lobby_user_unique UNIQUE (lobby_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_flash_lobby_sessions_lobby_status_seen
    ON m2m.flash_lobby_sessions(lobby_id, status, last_seen_at DESC);

CREATE INDEX IF NOT EXISTS idx_flash_lobby_sessions_user
    ON m2m.flash_lobby_sessions(user_id, last_seen_at DESC);

ALTER TABLE m2m.flash_lobbies
    ADD COLUMN IF NOT EXISTS post_lobby_processed_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION m2m.update_flash_lobby_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_flash_lobby_sessions_updated_at ON m2m.flash_lobby_sessions;
CREATE TRIGGER trigger_update_flash_lobby_sessions_updated_at
    BEFORE UPDATE ON m2m.flash_lobby_sessions
    FOR EACH ROW
    EXECUTE FUNCTION m2m.update_flash_lobby_sessions_updated_at();
