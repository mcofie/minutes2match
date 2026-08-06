-- Create account deletion requests table
CREATE TABLE IF NOT EXISTS m2m.account_deletion_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES m2m.profiles(id) ON DELETE CASCADE,
  reason text,
  details text,
  status text NOT NULL DEFAULT 'pending' CHECK (status = ANY (ARRAY['pending', 'approved', 'rejected', 'cancelled'])),
  admin_notes text,
  processed_by uuid REFERENCES m2m.profiles(id),
  processed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT account_deletion_requests_pkey PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE m2m.account_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Users can create deletion requests for themselves
CREATE POLICY "Users can create own deletion request" ON m2m.account_deletion_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own deletion requests
CREATE POLICY "Users can view own deletion requests" ON m2m.account_deletion_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update (e.g. cancel) their own pending deletion request
CREATE POLICY "Users can update own pending deletion request" ON m2m.account_deletion_requests
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Service role can manage all deletion requests
CREATE POLICY "Service role can manage deletion requests" ON m2m.account_deletion_requests
  FOR ALL USING (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON m2m.account_deletion_requests TO authenticated;
GRANT ALL ON m2m.account_deletion_requests TO service_role;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_account_deletion_user ON m2m.account_deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_account_deletion_status ON m2m.account_deletion_requests(status);
CREATE INDEX IF NOT EXISTS idx_account_deletion_created ON m2m.account_deletion_requests(created_at DESC);
