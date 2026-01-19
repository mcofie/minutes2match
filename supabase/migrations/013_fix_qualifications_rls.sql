-- Fix RLS policies for event_qualifications
-- Allows admins to manage qualifications

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can manage qualifications" ON m2m.event_qualifications;
DROP POLICY IF EXISTS "Admins can insert qualifications" ON m2m.event_qualifications;
DROP POLICY IF EXISTS "Admins can update qualifications" ON m2m.event_qualifications;
DROP POLICY IF EXISTS "Admins can delete qualifications" ON m2m.event_qualifications;

-- Allow admins full access to event_qualifications
CREATE POLICY "Admins can manage qualifications" 
ON m2m.event_qualifications 
FOR ALL 
USING (
  EXISTS (SELECT 1 FROM m2m.admins WHERE id = auth.uid())
)
WITH CHECK (
  EXISTS (SELECT 1 FROM m2m.admins WHERE id = auth.uid())
);

-- Also grant DELETE permission (was missing)
GRANT DELETE ON m2m.event_qualifications TO authenticated;
GRANT UPDATE ON m2m.event_qualifications TO authenticated;
