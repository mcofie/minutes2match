-- Create SMS History table to track all sent messages
CREATE TABLE IF NOT EXISTS m2m.sms_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES m2m.profiles(id) ON DELETE SET NULL,
  recipient_phone TEXT NOT NULL,
  recipient_name TEXT,
  message TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'sent', 'failed')) DEFAULT 'sent',
  broadcast_id UUID, -- Groups messages from same broadcast
  sent_by UUID REFERENCES m2m.admins(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_sms_history_created ON m2m.sms_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sms_history_broadcast ON m2m.sms_history(broadcast_id);
CREATE INDEX IF NOT EXISTS idx_sms_history_recipient ON m2m.sms_history(recipient_id);

-- Grant permissions
GRANT SELECT, INSERT ON m2m.sms_history TO authenticated;
GRANT ALL ON m2m.sms_history TO service_role;

-- Enable RLS
ALTER TABLE m2m.sms_history ENABLE ROW LEVEL SECURITY;

-- Allow admins to view and create SMS history
CREATE POLICY "Admins can manage sms_history" 
ON m2m.sms_history 
FOR ALL 
USING (
  EXISTS (SELECT 1 FROM m2m.admins WHERE id = auth.uid())
)
WITH CHECK (
  EXISTS (SELECT 1 FROM m2m.admins WHERE id = auth.uid())
);
