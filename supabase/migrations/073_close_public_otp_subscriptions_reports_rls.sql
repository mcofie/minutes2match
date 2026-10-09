-- 073: Close public (anon) access to login codes, subscriptions and reports.
--
-- These tables had "allow all" policies on PUBLIC, so anyone holding the anon key
-- could read every OTP code, subscription and report. OTP send/verify runs
-- server-side with the service role (which bypasses RLS), so no client policy is
-- needed for otp_codes beyond the existing admin view.
-- Members keep their own-scoped policies; admins get is_admin() policies so the
-- admin Reports and Payments pages keep working.

BEGIN;

-- otp_codes
DROP POLICY IF EXISTS "Allow public access for OTP" ON m2m.otp_codes;
DROP POLICY IF EXISTS "Anon insert otp" ON m2m.otp_codes;
DROP POLICY IF EXISTS "Anon select otp" ON m2m.otp_codes;
DROP POLICY IF EXISTS "Anon update otp" ON m2m.otp_codes;
DROP POLICY IF EXISTS "Anyone can manage otp codes" ON m2m.otp_codes;

-- subscriptions ("Users can view own subscription" stays)
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON m2m.subscriptions;
DROP POLICY IF EXISTS "Admins can manage subscriptions" ON m2m.subscriptions;
CREATE POLICY "Admins can manage subscriptions" ON m2m.subscriptions
  FOR ALL TO authenticated USING (m2m.is_admin()) WITH CHECK (m2m.is_admin());

-- reports ("Users can create reports" / "Users can view own reports" stay)
DROP POLICY IF EXISTS "Service role can manage reports" ON m2m.reports;
DROP POLICY IF EXISTS "Admins can manage reports" ON m2m.reports;
CREATE POLICY "Admins can manage reports" ON m2m.reports
  FOR ALL TO authenticated USING (m2m.is_admin()) WITH CHECK (m2m.is_admin());

COMMIT;
