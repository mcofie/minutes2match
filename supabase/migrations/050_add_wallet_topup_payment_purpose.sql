-- Update payments purpose check constraint to include 'wallet_topup'
-- This allows users to pay for wallet top-ups via Paystack

DO $$ 
BEGIN
  -- Check if table is in m2m schema
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'm2m' AND table_name = 'payments') THEN
    ALTER TABLE m2m.payments DROP CONSTRAINT IF EXISTS payments_purpose_check;
    ALTER TABLE m2m.payments ADD CONSTRAINT payments_purpose_check CHECK (purpose IN ('event_ticket', 'match_unlock', 'subscription', 'shoot_your_shot', 'spark_deck', 'wallet_topup'));
    
  -- Check if table is in public schema (fallback)
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payments') THEN
    ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_purpose_check;
    ALTER TABLE public.payments ADD CONSTRAINT payments_purpose_check CHECK (purpose IN ('event_ticket', 'match_unlock', 'subscription', 'shoot_your_shot', 'spark_deck', 'wallet_topup'));
  END IF;
END $$;
