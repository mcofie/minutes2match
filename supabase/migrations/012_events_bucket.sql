-- Create the events bucket for event cover images
INSERT INTO storage.buckets (id, name, public)
VALUES ('events', 'events', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "events_public_read" ON storage.objects;
DROP POLICY IF EXISTS "events_admin_all" ON storage.objects;

-- Allow public read access to events
CREATE POLICY "events_public_read" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'events');

-- Allow authenticated users (admins usually) to upload/update/delete
-- ideally restrict to admin role, but for now authenticated is fine for the prototype
CREATE POLICY "events_auth_all" ON storage.objects
FOR ALL TO authenticated
USING (bucket_id = 'events')
WITH CHECK (bucket_id = 'events');
