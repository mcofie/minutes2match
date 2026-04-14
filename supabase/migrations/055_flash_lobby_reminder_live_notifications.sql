ALTER TABLE m2m.flash_lobby_reminders
ADD COLUMN IF NOT EXISTS notified_live_at TIMESTAMPTZ NULL;

CREATE INDEX IF NOT EXISTS idx_flash_lobby_reminders_live_notification
ON m2m.flash_lobby_reminders(lobby_id, notified_live_at);
