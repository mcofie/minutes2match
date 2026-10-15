-- Migration: 078_close_open_policies.sql
--
-- Several policies were written for the service role but applied to everyone (roles = public,
-- USING true). The service role bypasses row level security anyway, so these only ever opened
-- the tables up: any signed-in member could read or change every account deletion request,
-- and anyone could read and edit vouches and shots.
--
-- Every app write to these tables goes through server endpoints (service role), so the open
-- policies are dropped. Admin pages that read them from the browser get admin-only policies.

-- Wallets. Signed-in users had no table privileges here, so the open policies weren't reachable,
-- but the admin wallet tab's balance read always failed. Grant read; the policies decide what each sees
-- (members: their own, via "Users can view own credits/transactions"; admins: everyone's).
GRANT SELECT ON m2m.user_credits TO authenticated;
GRANT SELECT ON m2m.credit_transactions TO authenticated;

DROP POLICY IF EXISTS "Service role full access to credits" ON m2m.user_credits;
DROP POLICY IF EXISTS "Admins can read credits" ON m2m.user_credits;
CREATE POLICY "Admins can read credits" ON m2m.user_credits FOR SELECT USING (m2m.is_admin());

DROP POLICY IF EXISTS "Service role full access to transactions" ON m2m.credit_transactions;
DROP POLICY IF EXISTS "Admins can read transactions" ON m2m.credit_transactions;
CREATE POLICY "Admins can read transactions" ON m2m.credit_transactions FOR SELECT USING (m2m.is_admin());

-- Account deletion requests (members keep their own create / view / cancel policies)
DROP POLICY IF EXISTS "Service role can manage deletion requests" ON m2m.account_deletion_requests;
DROP POLICY IF EXISTS "Admins can read deletion requests" ON m2m.account_deletion_requests;
CREATE POLICY "Admins can read deletion requests" ON m2m.account_deletion_requests FOR SELECT USING (m2m.is_admin());

-- Notifications: only admins create them from the browser (profile reminders)
DROP POLICY IF EXISTS "Service role can insert notifications" ON m2m.notifications;
DROP POLICY IF EXISTS "Admins can create notifications" ON m2m.notifications;
CREATE POLICY "Admins can create notifications" ON m2m.notifications FOR INSERT WITH CHECK (m2m.is_admin());

-- Vouches and shots: created and answered through /api/vouches and /api/shots (service role)
DROP POLICY IF EXISTS "Anyone can create vouches" ON m2m.vouches;
DROP POLICY IF EXISTS "Anyone can read vouches" ON m2m.vouches;
DROP POLICY IF EXISTS "Anyone can update vouches" ON m2m.vouches;
DROP POLICY IF EXISTS "Admins can read vouches" ON m2m.vouches;
CREATE POLICY "Admins can read vouches" ON m2m.vouches FOR SELECT USING (m2m.is_admin());

DROP POLICY IF EXISTS "Anyone can create shots" ON m2m.shots;
DROP POLICY IF EXISTS "Anyone can read shots" ON m2m.shots;
DROP POLICY IF EXISTS "Anyone can update shots" ON m2m.shots;
DROP POLICY IF EXISTS "Admins can read shots" ON m2m.shots;
CREATE POLICY "Admins can read shots" ON m2m.shots FOR SELECT USING (m2m.is_admin());
