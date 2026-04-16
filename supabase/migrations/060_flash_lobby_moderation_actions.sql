-- ============================================================
-- Migration 060: Flash Lobby moderation actions
-- ============================================================

CREATE TABLE IF NOT EXISTS m2m.flash_lobby_moderation_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lobby_id UUID NOT NULL REFERENCES m2m.flash_lobbies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('removed', 'hide_profile', 'block_rejoin')),
    active BOOLEAN NOT NULL DEFAULT true,
    note TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_flash_lobby_moderation_lookup
    ON m2m.flash_lobby_moderation_actions(lobby_id, user_id, active);

CREATE UNIQUE INDEX IF NOT EXISTS idx_flash_lobby_moderation_active_unique
    ON m2m.flash_lobby_moderation_actions(lobby_id, user_id, action)
    WHERE active = true;

CREATE OR REPLACE FUNCTION m2m.update_flash_lobby_moderation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_flash_lobby_moderation_updated_at ON m2m.flash_lobby_moderation_actions;
CREATE TRIGGER trigger_update_flash_lobby_moderation_updated_at
    BEFORE UPDATE ON m2m.flash_lobby_moderation_actions
    FOR EACH ROW
    EXECUTE FUNCTION m2m.update_flash_lobby_moderation_updated_at();
