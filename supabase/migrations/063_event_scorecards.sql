ALTER TABLE m2m.events
  ADD COLUMN IF NOT EXISTS matching_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS scorecards_open BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS scorecard_deadline TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS scorecards_processed_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS m2m.event_scorecards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES m2m.events(id) ON DELETE CASCADE,
  voter_user_id UUID NOT NULL REFERENCES m2m.profiles(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES m2m.profiles(id) ON DELETE CASCADE,
  decision TEXT NOT NULL CHECK (decision IN ('match', 'maybe', 'pass')),
  note TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, voter_user_id, target_user_id),
  CONSTRAINT event_scorecards_no_self_vote CHECK (voter_user_id <> target_user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_scorecards_event_voter
  ON m2m.event_scorecards(event_id, voter_user_id);

CREATE INDEX IF NOT EXISTS idx_event_scorecards_event_target
  ON m2m.event_scorecards(event_id, target_user_id);

CREATE INDEX IF NOT EXISTS idx_event_scorecards_match_only
  ON m2m.event_scorecards(event_id, decision)
  WHERE decision = 'match';

COMMENT ON COLUMN m2m.events.matching_enabled IS 'Whether the event supports post-event mutual scorecard matching';
COMMENT ON COLUMN m2m.events.scorecards_open IS 'Whether attendees can currently submit scorecards for this event';
COMMENT ON COLUMN m2m.events.scorecard_deadline IS 'Deadline after which attendee scorecards close';
COMMENT ON COLUMN m2m.events.scorecards_processed_at IS 'Timestamp when mutual scorecards were last processed into matches';
