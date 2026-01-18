-- Migration 004: Add Extended Profile Fields
-- Improve matchmaking with more granular data
-- Explicitly targeting 'm2m' schema

ALTER TABLE m2m.profiles ADD COLUMN IF NOT EXISTS interested_in TEXT CHECK (interested_in IN ('male', 'female', 'everyone'));
ALTER TABLE m2m.profiles ADD COLUMN IF NOT EXISTS intent TEXT CHECK (intent IN ('marriage', 'serious', 'casual', 'friendship'));
ALTER TABLE m2m.profiles ADD COLUMN IF NOT EXISTS genotype TEXT CHECK (genotype IN ('AA', 'AS', 'SS', 'AC', 'SC', 'other'));
ALTER TABLE m2m.profiles ADD COLUMN IF NOT EXISTS religion TEXT;
ALTER TABLE m2m.profiles ADD COLUMN IF NOT EXISTS height_cm INT;
ALTER TABLE m2m.profiles ADD COLUMN IF NOT EXISTS occupation TEXT;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_profiles_intent ON m2m.profiles(intent);
CREATE INDEX IF NOT EXISTS idx_profiles_genotype ON m2m.profiles(genotype);
