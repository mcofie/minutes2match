-- Update payments purpose check constraint to include 'spark_deck' and 'shoot_your_shot'
-- This fixes the issue where Spark Deck payments fail due to constraint violation in the DB

DO $$
BEGIN
  -- Check if table is in m2m schema
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'm2m' AND table_name = 'payments') THEN
    ALTER TABLE m2m.payments DROP CONSTRAINT IF EXISTS payments_purpose_check;
    ALTER TABLE m2m.payments ADD CONSTRAINT payments_purpose_check CHECK (purpose IN ('event_ticket', 'match_unlock', 'subscription', 'shoot_your_shot', 'spark_deck'));
    
  -- Check if table is in public schema (fallback)
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payments') THEN
    ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_purpose_check;
    ALTER TABLE public.payments ADD CONSTRAINT payments_purpose_check CHECK (purpose IN ('event_ticket', 'match_unlock', 'subscription', 'shoot_your_shot', 'spark_deck'));
  END IF;
END $$;
