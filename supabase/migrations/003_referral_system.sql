-- Referral System Migration
-- Adds referral tracking and rewards

-- Create referrals table
CREATE TABLE IF NOT EXISTS m2m.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES m2m.profiles(id) ON DELETE CASCADE,
    referred_id UUID REFERENCES m2m.profiles(id) ON DELETE SET NULL,
    referral_code VARCHAR(20) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'signed_up', 'paid', 'rewarded')),
    reward_type VARCHAR(50),
    reward_amount DECIMAL(10, 2),
    reward_given_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Add referral_code to profiles
ALTER TABLE m2m.profiles 
ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20) UNIQUE;

-- Add referred_by to profiles
ALTER TABLE m2m.profiles 
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES m2m.profiles(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON m2m.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON m2m.referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON m2m.profiles(referral_code);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION m2m.generate_referral_code()
RETURNS TRIGGER AS $$
DECLARE
    new_code VARCHAR(8);
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate a random 8-character alphanumeric code
        new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
        
        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM m2m.profiles WHERE referral_code = new_code) INTO code_exists;
        
        EXIT WHEN NOT code_exists;
    END LOOP;
    
    NEW.referral_code := new_code;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate referral code on profile creation
DROP TRIGGER IF EXISTS generate_referral_code_trigger ON m2m.profiles;
CREATE TRIGGER generate_referral_code_trigger
    BEFORE INSERT ON m2m.profiles
    FOR EACH ROW
    WHEN (NEW.referral_code IS NULL)
    EXECUTE FUNCTION m2m.generate_referral_code();

-- RLS Policies
ALTER TABLE m2m.referrals ENABLE ROW LEVEL SECURITY;

-- Users can view their own referrals
CREATE POLICY referrals_select_own ON m2m.referrals
    FOR SELECT
    USING (auth.uid() = referrer_id);

-- Users can create referral records (via referral link tracking)
CREATE POLICY referrals_insert ON m2m.referrals
    FOR INSERT
    WITH CHECK (auth.uid() = referrer_id);

-- Service role can do everything
CREATE POLICY referrals_service_role ON m2m.referrals
    FOR ALL
    USING (auth.role() = 'service_role');

COMMENT ON TABLE m2m.referrals IS 'Tracks user referrals and rewards';
