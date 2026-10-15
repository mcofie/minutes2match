-- Migration: 077_lock_down_match_rows.sql
--
-- Members could read and edit their own match row directly through the API: the other person's
-- private feedback, admin notes, the score and the status. The app never writes matches from the
-- browser (feedback and nudges go through server endpoints, which use the service role), so:
--
-- 1. Members can no longer update matches.
-- 2. Logged-out (anon) requests get no access to matches at all.
-- 3. Signed-in requests can read every column except the private ones below. Admins read those
--    through /api/admin/matches (service role). Admin writes still work through the existing
--    "Admins can manage all matches" policy, since UPDATE/INSERT/DELETE privileges are unchanged.
--
-- Private columns: feedback answers and their summary, admin notes, the AI selection note.
-- NOTE: a column added to m2m.matches later is NOT readable by signed-in users until it's
-- granted below as well.

DROP POLICY IF EXISTS "Users can update own matches" ON m2m.matches;

REVOKE ALL ON m2m.matches FROM anon;

REVOKE SELECT ON m2m.matches FROM authenticated;
GRANT SELECT (
  id, user_1_id, user_2_id, status, unlock_price, created_by, created_at, unlocked_at,
  user_1_paid, user_2_paid, user_1_paid_at, user_2_paid_at,
  user_1_contacted, user_2_contacted, contact_exchanged, expires_at,
  match_score, match_reasons, match_warnings, last_payment_reminder_at, payment_reminder_count,
  ai_analysis, created_by_label, is_from_lobby, user_1_amount_paid, user_2_amount_paid,
  refund_credited_at, feedback_requested_at, match_breakdown, match_confidence
) ON m2m.matches TO authenticated;
