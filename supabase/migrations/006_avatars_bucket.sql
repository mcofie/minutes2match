-- Migration 006: Create Avatars Storage Bucket
-- Run this in Supabase Dashboard SQL Editor

-- Create the avatars bucket for user photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
DROP POLICY IF EXISTS "avatars_auth_insert" ON storage.objects;
DROP POLICY IF EXISTS "avatars_auth_update" ON storage.objects;
DROP POLICY IF EXISTS "avatars_auth_delete" ON storage.objects;

-- Allow public read access to avatars
CREATE POLICY "avatars_public_read" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload avatars
CREATE POLICY "avatars_auth_insert" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Allow authenticated users to update avatars
CREATE POLICY "avatars_auth_update" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'avatars');

-- Allow authenticated users to delete avatars
CREATE POLICY "avatars_auth_delete" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'avatars');
