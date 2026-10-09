-- Migration: 071_weekly_opt_in_and_free_matching.sql
--
-- 1. Weekly opt-in: members choose each week whether to be matched.
--    weekly_opt_in_until = end of the matching week they opted into (Sunday 23:59:59 UTC).
--    The matchmaker only considers members whose opt-in hasn't expired.
-- 2. Matching is now free and needs no acceptance: a match is unlocked the moment
--    it's created, and both people are notified.

ALTER TABLE m2m.profiles ADD COLUMN IF NOT EXISTS weekly_opt_in_until TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS profiles_weekly_opt_in_until_idx ON m2m.profiles (weekly_opt_in_until);

-- Don't empty the pool on launch day: opt in everyone currently active for this week.
UPDATE m2m.profiles
SET weekly_opt_in_until = date_trunc('week', now() AT TIME ZONE 'UTC') + interval '6 days 23 hours 59 minutes 59 seconds'
WHERE is_active = TRUE
  AND (weekly_opt_in_until IS NULL OR weekly_opt_in_until < now());

-- Free matching: new matches carry no price and start unlocked.
ALTER TABLE m2m.matches ALTER COLUMN unlock_price SET DEFAULT 0;

-- Unlock every match still waiting on payment / acceptance. They no longer expire.
UPDATE m2m.matches
SET status = 'unlocked',
    unlock_price = 0,
    unlocked_at = COALESCE(unlocked_at, now()),
    user_1_paid = TRUE,
    user_2_paid = TRUE,
    user_1_paid_at = COALESCE(user_1_paid_at, now()),
    user_2_paid_at = COALESCE(user_2_paid_at, now()),
    expires_at = NULL
WHERE status IN ('pending_payment', 'partial_payment');
