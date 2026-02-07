-- Update payments purpose check constraint to include 'subscription'
-- This fixes the issue where subscription payments fail due to constraint violation

DO $$
BEGIN
  -- Check if table is in m2m schema
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'm2m' AND table_name = 'payments') THEN
    ALTER TABLE m2m.payments DROP CONSTRAINT IF EXISTS payments_purpose_check;
    ALTER TABLE m2m.payments ADD CONSTRAINT payments_purpose_check CHECK (purpose IN ('event_ticket', 'match_unlock', 'subscription'));
    
  -- Check if table is in public schema (fallback)
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payments') THEN
    ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_purpose_check;
    ALTER TABLE public.payments ADD CONSTRAINT payments_purpose_check CHECK (purpose IN ('event_ticket', 'match_unlock', 'subscription'));
  END IF;
END $$;
