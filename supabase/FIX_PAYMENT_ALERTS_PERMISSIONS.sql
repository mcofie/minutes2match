
-- Fix permissions for payment_alerts table
-- Grant access to service_role (for backend logging)
GRANT ALL ON m2m.payment_alerts TO service_role;

-- Grant access to authenticated users (for admin dashboard)
GRANT SELECT, UPDATE, INSERT ON m2m.payment_alerts TO authenticated;

-- Ensure schema usage is granted
GRANT USAGE ON SCHEMA m2m TO authenticated;
GRANT USAGE ON SCHEMA m2m TO service_role;

-- Add RLS policies if needed (or disable RLS if it's meant to be admin-only and we depend on the app's admin check)
ALTER TABLE m2m.payment_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all alerts" ON m2m.payment_alerts;
CREATE POLICY "Admins can view all alerts" ON m2m.payment_alerts
    FOR SELECT
    TO authenticated
    USING (EXISTS (SELECT 1 FROM m2m.admins WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Admins can update alerts" ON m2m.payment_alerts;
CREATE POLICY "Admins can update alerts" ON m2m.payment_alerts
    FOR UPDATE
    TO authenticated
    USING (EXISTS (SELECT 1 FROM m2m.admins WHERE id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM m2m.admins WHERE id = auth.uid()));

DO $$
BEGIN
    RAISE NOTICE '✅ Payment alerts permissions and RLS policies updated!';
END $$;
