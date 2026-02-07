-- Create user reports table
CREATE TABLE IF NOT EXISTS m2m.reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES m2m.profiles(id),
  reported_user_id uuid NOT NULL REFERENCES m2m.profiles(id),
  match_id uuid REFERENCES m2m.matches(id),
  reason text NOT NULL CHECK (reason = ANY (ARRAY[
    'inappropriate_behavior',
    'fake_profile',
    'harassment',
    'spam',
    'underage',
    'other'
  ])),
  description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status = ANY (ARRAY['pending', 'reviewed', 'actioned', 'dismissed'])),
  admin_notes text,
  reviewed_by uuid REFERENCES m2m.profiles(id),
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reports_pkey PRIMARY KEY (id),
  CONSTRAINT reports_no_self_report CHECK (reporter_id != reported_user_id)
);

-- Enable RLS
ALTER TABLE m2m.reports ENABLE ROW LEVEL SECURITY;

-- Users can create reports
CREATE POLICY "Users can create reports" ON m2m.reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Users can view their own reports
CREATE POLICY "Users can view own reports" ON m2m.reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- Service role can manage all reports
CREATE POLICY "Service role can manage reports" ON m2m.reports
  FOR ALL USING (true);

-- Grant permissions
GRANT SELECT, INSERT ON m2m.reports TO authenticated;
GRANT ALL ON m2m.reports TO service_role;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_reports_reported_user ON m2m.reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON m2m.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON m2m.reports(created_at DESC);
