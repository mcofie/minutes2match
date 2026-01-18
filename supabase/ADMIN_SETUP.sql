-- ================================================================
-- ADMIN SETUP - Run after creating user in Supabase Auth
-- ================================================================
-- 
-- STEP 1: Create admin user via Supabase Dashboard
--   1. Go to Authentication > Users
--   2. Click "Add User" (or "Invite User")
--   3. Email: maxcofie@gmail.com
--   4. Password: (set your password)
--   5. Click "Create User"
--
-- STEP 2: Run this SQL to make them an admin
-- ================================================================

-- Find the user ID for the email and insert into admins table
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get the user ID from auth.users
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'maxcofie@gmail.com'
  LIMIT 1;
  
  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION 'User maxcofie@gmail.com not found in auth.users. Please create the user in Supabase Auth first.';
  END IF;
  
  -- Insert into admins table (if not already exists)
  INSERT INTO m2m.admins (id, role)
  VALUES (admin_user_id, 'super_admin')
  ON CONFLICT (id) DO UPDATE SET role = 'super_admin';
  
  -- Also create a profile for this admin (optional but recommended)
  INSERT INTO m2m.profiles (id, phone, display_name, is_verified)
  VALUES (admin_user_id, '+233000000000', 'Admin', TRUE)
  ON CONFLICT (id) DO UPDATE SET 
    display_name = COALESCE(m2m.profiles.display_name, 'Admin'),
    is_verified = TRUE;
  
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════';
  RAISE NOTICE '✓ ADMIN USER SETUP COMPLETE!';
  RAISE NOTICE '════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'Email: maxcofie@gmail.com';
  RAISE NOTICE 'Role: super_admin';
  RAISE NOTICE 'User ID: %', admin_user_id;
  RAISE NOTICE '';
  RAISE NOTICE 'You can now login at: /admin/login';
  RAISE NOTICE '';
END $$;
