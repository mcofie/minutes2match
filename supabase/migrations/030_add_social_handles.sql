
-- Add social handles and preferred contact method to profiles
ALTER TABLE m2m.profiles 
ADD COLUMN IF NOT EXISTS instagram_handle TEXT,
ADD COLUMN IF NOT EXISTS snapchat_handle TEXT,
ADD COLUMN IF NOT EXISTS preferred_contact_method TEXT DEFAULT 'phone' CHECK (preferred_contact_method IN ('phone', 'instagram', 'snapchat'));

COMMENT ON COLUMN m2m.profiles.preferred_contact_method IS 'The contact information to reveal when a match is unlocked';
