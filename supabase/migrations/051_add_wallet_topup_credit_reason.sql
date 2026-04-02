-- Update credit_transactions reason check constraint to include 'wallet_topup'
-- This allows logging top-up transactions in the ledger

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'm2m' AND table_name = 'credit_transactions') THEN
    ALTER TABLE m2m.credit_transactions DROP CONSTRAINT IF EXISTS credit_transactions_reason_check;
    ALTER TABLE m2m.credit_transactions ADD CONSTRAINT credit_transactions_reason_check CHECK (reason IN (
        'match_expired_refund',
        'match_unlock_spend',
        'admin_adjustment',
        'promotional_credit',
        'wallet_topup'
    ));
  END IF;
END $$;
