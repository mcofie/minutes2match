-- ================================================================
-- SET ADMIN USER
-- Run this in Supabase SQL Editor
-- ================================================================

-- First, find the user ID for maxcofie@gmail.com
DO $$
DECLARE
  user_uuid uuid;
BEGIN
  -- Get the user ID from auth.users
  SELECT id INTO user_uuid FROM auth.users WHERE email = 'maxcofie@gmail.com';
  
  IF user_uuid IS NULL THEN
    RAISE NOTICE 'User maxcofie@gmail.com not found in auth.users. Please sign up first.';
  ELSE
    -- Insert into admins table (or update if exists)
    INSERT INTO m2m.admins (id, role)
    VALUES (user_uuid, 'super_admin')
    ON CONFLICT (id) DO UPDATE SET role = 'super_admin';
    
    RAISE NOTICE 'Successfully set maxcofie@gmail.com as super_admin!';
  END IF;
END $$;

-- Verify
SELECT 
  a.id,
  a.role,
  u.email,
  a.created_at
FROM m2m.admins a
JOIN auth.users u ON a.id = u.id;
