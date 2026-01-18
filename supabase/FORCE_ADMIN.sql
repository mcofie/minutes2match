-- Make specific users admins
-- Replace with your phone number format exactly as stored (likely +233...)

INSERT INTO m2m.admins (id, role)
SELECT id, 'super_admin'
FROM m2m.profiles
WHERE phone ILIKE '%558508306' OR phone ILIKE '%558508306'
ON CONFLICT (id) DO UPDATE SET role = 'super_admin';

-- OR Just make everyone an admin for now:
INSERT INTO m2m.admins (id, role)
SELECT id, 'super_admin'
FROM m2m.profiles
ON CONFLICT (id) DO UPDATE SET role = 'super_admin';

SELECT count(*) as admin_count FROM m2m.admins;
