ALTER TABLE m2m.flash_lobbies ADD COLUMN IF NOT EXISTS is_paused boolean DEFAULT false;
ALTER TABLE m2m.flash_lobbies ADD COLUMN IF NOT EXISTS paused_at timestamptz;
ALTER TABLE m2m.flash_lobbies ADD COLUMN IF NOT EXISTS announcement text;
ALTER TABLE m2m.flash_lobbies ADD COLUMN IF NOT EXISTS announcement_at timestamptz;

-- Refresh the schema cache so the new columns are visible immediately
NOTIFY pgrst, 'reload schema';
