GRANT USAGE ON SCHEMA m2m TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON m2m.event_scorecards TO authenticated;
GRANT ALL ON m2m.event_scorecards TO service_role;

ALTER TABLE m2m.event_scorecards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Checked-in attendees can view own scorecards" ON m2m.event_scorecards;
CREATE POLICY "Checked-in attendees can view own scorecards"
ON m2m.event_scorecards
FOR SELECT
USING (
  voter_user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM m2m.admins a
    WHERE a.id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Checked-in attendees can submit own scorecards" ON m2m.event_scorecards;
CREATE POLICY "Checked-in attendees can submit own scorecards"
ON m2m.event_scorecards
FOR INSERT
WITH CHECK (
  voter_user_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM m2m.event_bookings eb
    JOIN m2m.events e ON e.id = eb.event_id
    WHERE eb.event_id = event_scorecards.event_id
      AND eb.user_id = auth.uid()
      AND eb.status = 'checked_in'
      AND e.matching_enabled = true
  )
);

DROP POLICY IF EXISTS "Checked-in attendees can update own scorecards" ON m2m.event_scorecards;
CREATE POLICY "Checked-in attendees can update own scorecards"
ON m2m.event_scorecards
FOR UPDATE
USING (
  voter_user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM m2m.admins a
    WHERE a.id = auth.uid()
  )
)
WITH CHECK (
  voter_user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM m2m.admins a
    WHERE a.id = auth.uid()
  )
);
