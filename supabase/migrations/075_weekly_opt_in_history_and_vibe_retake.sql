-- Migration: 075_weekly_opt_in_history_and_vibe_retake.sql
--
-- 1. Weekly opt-in history. profiles.weekly_opt_in_until only holds the current week, so
--    there was no record of who opted in for past weeks. m2m.weekly_opt_ins keeps one row
--    per member per matching week (week_start = the Monday, UTC), written by a trigger so it
--    captures every opt-in however it's made (profile page, admin, scripts).
-- 2. Vibe Check v2 retake. profiles.vibe_check_required sends a member back through the
--    Vibe Check the next time they log in. It clears itself as soon as they save an answer
--    to a v2 question (keys starting with 'v2_'), so nobody gets stuck.

-- ---------------------------------------------------------------------------
-- 1. Weekly opt-in history
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS m2m.weekly_opt_ins (
  user_id UUID NOT NULL REFERENCES m2m.profiles(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  opted_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  opted_out_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, week_start)
);

CREATE INDEX IF NOT EXISTS weekly_opt_ins_week_start_idx ON m2m.weekly_opt_ins (week_start);

ALTER TABLE m2m.weekly_opt_ins ENABLE ROW LEVEL SECURITY;

-- Admins read it; writes only happen through the trigger below (and the service role).
DROP POLICY IF EXISTS "Admins can read weekly opt-ins" ON m2m.weekly_opt_ins;
CREATE POLICY "Admins can read weekly opt-ins" ON m2m.weekly_opt_ins
  FOR SELECT USING (EXISTS (SELECT 1 FROM m2m.admins a WHERE a.id = auth.uid()));

GRANT SELECT ON m2m.weekly_opt_ins TO authenticated;

CREATE OR REPLACE FUNCTION m2m.log_weekly_opt_in()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = m2m, public
AS $$
DECLARE
  current_week DATE := date_trunc('week', now() AT TIME ZONE 'UTC')::date;
BEGIN
  IF NEW.weekly_opt_in_until IS NOT NULL AND NEW.weekly_opt_in_until >= now() THEN
    -- Opted in (or re-opted in) for the week their opt-in runs to
    INSERT INTO m2m.weekly_opt_ins (user_id, week_start, opted_in_at)
    VALUES (NEW.id, date_trunc('week', NEW.weekly_opt_in_until AT TIME ZONE 'UTC')::date, now())
    ON CONFLICT (user_id, week_start) DO UPDATE SET opted_out_at = NULL;
  ELSIF TG_OP = 'UPDATE'
    AND OLD.weekly_opt_in_until IS NOT NULL
    AND OLD.weekly_opt_in_until >= now()
    AND NEW.weekly_opt_in_until IS DISTINCT FROM OLD.weekly_opt_in_until THEN
    -- Skipped this week after opting in
    UPDATE m2m.weekly_opt_ins
    SET opted_out_at = now()
    WHERE user_id = NEW.id AND week_start = current_week;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_log_weekly_opt_in ON m2m.profiles;
CREATE TRIGGER profiles_log_weekly_opt_in
  AFTER INSERT OR UPDATE OF weekly_opt_in_until ON m2m.profiles
  FOR EACH ROW EXECUTE FUNCTION m2m.log_weekly_opt_in();

-- Start the history with everyone opted in right now.
-- Note: migration 071 opted in every active member for its launch week, so that week reads high.
INSERT INTO m2m.weekly_opt_ins (user_id, week_start, opted_in_at)
SELECT id, date_trunc('week', weekly_opt_in_until AT TIME ZONE 'UTC')::date, now()
FROM m2m.profiles
WHERE weekly_opt_in_until IS NOT NULL AND weekly_opt_in_until >= now()
ON CONFLICT (user_id, week_start) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 2. Vibe Check v2 retake
-- ---------------------------------------------------------------------------
ALTER TABLE m2m.profiles ADD COLUMN IF NOT EXISTS vibe_check_required BOOLEAN NOT NULL DEFAULT FALSE;

CREATE OR REPLACE FUNCTION m2m.clear_vibe_check_required()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = m2m, public
AS $$
BEGIN
  IF NEW.question_key LIKE 'v2\_%' THEN
    UPDATE m2m.profiles
    SET vibe_check_required = FALSE
    WHERE id = NEW.user_id AND vibe_check_required;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS vibe_answers_clear_retake ON m2m.vibe_answers;
CREATE TRIGGER vibe_answers_clear_retake
  AFTER INSERT OR UPDATE ON m2m.vibe_answers
  FOR EACH ROW EXECUTE FUNCTION m2m.clear_vibe_check_required();
