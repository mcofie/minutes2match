-- Create subscriptions table
CREATE TABLE IF NOT EXISTS m2m.subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  status text NOT NULL CHECK (status = ANY (ARRAY['active'::text, 'cancelled'::text, 'expired'::text])),
  start_date timestamp with time zone NOT NULL DEFAULT now(),
  end_date timestamp with time zone NOT NULL,
  auto_renew boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES m2m.profiles(id)
);

-- Enable RLS on subscriptions
ALTER TABLE m2m.subscriptions ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for subscriptions
CREATE POLICY "Users can view own subscription" ON m2m.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions" ON m2m.subscriptions
  FOR ALL USING (true);

-- Add has_used_free_unlock to profiles
ALTER TABLE m2m.profiles 
ADD COLUMN IF NOT EXISTS has_used_free_unlock boolean DEFAULT false;

-- Add subscription pricing setting (if not exists)
INSERT INTO m2m.settings (key, value)
VALUES (
  'subscription_price_monthly', 
  '{"amount": 50, "currency": "GHS"}'::jsonb
) ON CONFLICT (key) DO NOTHING;
