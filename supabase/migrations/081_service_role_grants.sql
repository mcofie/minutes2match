-- Migration: 081_service_role_grants.sql
--
-- Tables created by migrations 075-080 in the m2m schema were never granted to service_role
-- (the role server endpoints and cron jobs use). In this schema new tables don't get that grant
-- automatically, so the server silently couldn't read them: date ideas fell back to the built-in
-- list (and reactions couldn't be saved), weekly opt-in history looked missing, and the SMS queue
-- couldn't run. Grant them now, and make future tables and functions in m2m grant it by default.

GRANT ALL ON m2m.weekly_opt_ins TO service_role;
GRANT ALL ON m2m.date_ideas TO service_role;
GRANT ALL ON m2m.date_idea_reactions TO service_role;
GRANT ALL ON m2m.sms_broadcasts TO service_role;
GRANT EXECUTE ON FUNCTION m2m.claim_sms_batch(UUID, INT) TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA m2m GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA m2m GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA m2m GRANT EXECUTE ON FUNCTIONS TO service_role;
