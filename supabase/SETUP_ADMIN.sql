-- Minutes 2 Match - Admin Setup & Permissions
-- Run this in Supabase SQL Editor

-- ==========================================
-- 1. Create Helper Function (Bypasses RLS)
-- ==========================================
CREATE OR REPLACE FUNCTION m2m.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM m2m.admins WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION m2m.is_admin TO authenticated, anon;

-- ==========================================
-- 2. Make Latest User an Admin
-- ==========================================
INSERT INTO m2m.admins (id, role)
SELECT id, 'super_admin'
FROM auth.users
ORDER BY created_at DESC
LIMIT 1
ON CONFLICT (id) DO UPDATE SET role = 'super_admin';

-- ==========================================
-- 3. Add Admin Policies (Access Everything)
-- ==========================================

-- Profiles
CREATE POLICY "Admins can manage all profiles" ON m2m.profiles 
FOR ALL USING (m2m.is_admin());

-- Events
CREATE POLICY "Admins can manage all events" ON m2m.events 
FOR ALL USING (m2m.is_admin());

-- Matches
CREATE POLICY "Admins can manage all matches" ON m2m.matches 
FOR ALL USING (m2m.is_admin());

-- Payments
CREATE POLICY "Admins can view all payments" ON m2m.payments 
FOR SELECT USING (m2m.is_admin());

-- Vibe Answers
CREATE POLICY "Admins can view all vibe answers" ON m2m.vibe_answers 
FOR SELECT USING (m2m.is_admin());

-- Event Bookings
CREATE POLICY "Admins can manage all bookings" ON m2m.event_bookings 
FOR ALL USING (m2m.is_admin());

-- OTP Codes
CREATE POLICY "Admins can view otp codes" ON m2m.otp_codes 
FOR SELECT USING (m2m.is_admin());

-- Admins Table (Access to see other admins)
CREATE POLICY "Admins can view all admins" ON m2m.admins 
FOR SELECT USING (m2m.is_admin());

-- Success Message
DO $$
BEGIN
  RAISE NOTICE '✅ Admin Setup Complete!';
  RAISE NOTICE '✅ Latest user is now Super Admin';
  RAISE NOTICE '✅ RLS policies updated to allow Full Access';
END $$;
