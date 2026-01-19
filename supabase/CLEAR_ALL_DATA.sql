-- ================================================================
-- CLEAR ALL USERS AND MATCHES
-- Run this in Supabase SQL Editor
-- ================================================================

-- Delete in correct order based on foreign key dependencies

-- 1. Clear event_bookings
DELETE FROM m2m.event_bookings;

-- 2. Clear event_qualifications
DELETE FROM m2m.event_qualifications;

-- 3. Clear matches
DELETE FROM m2m.matches;

-- 4. Clear vibe_answers
DELETE FROM m2m.vibe_answers;

-- 5. Clear payments
DELETE FROM m2m.payments;

-- 6. Clear admins
DELETE FROM m2m.admins;


-- 8. Clear profiles
DELETE FROM m2m.profiles;

-- 9. Clear OTP codes
DELETE FROM m2m.otp_codes;


-- Verify cleanup
SELECT 'profiles' as table_name, COUNT(*) as count FROM m2m.profiles
UNION ALL
SELECT 'matches', COUNT(*) FROM m2m.matches
UNION ALL
SELECT 'auth.users', COUNT(*) FROM auth.users;

-- Done!
SELECT '✅ All users and matches cleared successfully!' as status;
