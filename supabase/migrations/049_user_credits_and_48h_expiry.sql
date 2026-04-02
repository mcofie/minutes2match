-- ============================================================
-- Migration 049: User Credits (M2M Credit) & 48-Hour Match Expiry
-- ============================================================
-- 1. Creates user_credits table for balance tracking
-- 2. Creates credit_transactions ledger for audit trail
-- 3. Existing matches keep their current expires_at
-- 4. New matches will be created with 48h expiry by application code
-- ============================================================

-- 1. User Credit Balances
CREATE TABLE IF NOT EXISTS m2m.user_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT user_credits_balance_non_negative CHECK (balance >= 0),
    CONSTRAINT user_credits_user_id_unique UNIQUE (user_id)
);

-- 2. Credit Transaction Ledger (immutable audit trail)
CREATE TABLE IF NOT EXISTS m2m.credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
    reason TEXT NOT NULL CHECK (reason IN (
        'match_expired_refund',
        'match_unlock_spend',
        'admin_adjustment',
        'promotional_credit'
    )),
    reference_id UUID,  -- match_id or payment_id for traceability
    description TEXT,
    balance_after NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON m2m.user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON m2m.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON m2m.credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON m2m.credit_transactions(type);

-- RLS Policies
ALTER TABLE m2m.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE m2m.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Users can read their own credit balance
CREATE POLICY "Users can view own credits"
    ON m2m.user_credits FOR SELECT
    USING (auth.uid() = user_id);

-- Users can read their own transaction history
CREATE POLICY "Users can view own transactions"
    ON m2m.credit_transactions FOR SELECT
    USING (auth.uid() = user_id);

-- Service role bypass (for cron jobs and server operations)
CREATE POLICY "Service role full access to credits"
    ON m2m.user_credits FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role full access to transactions"
    ON m2m.credit_transactions FOR ALL
    USING (true)
    WITH CHECK (true);

-- Auto-update updated_at on user_credits
CREATE OR REPLACE FUNCTION m2m.update_credits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_credits_updated_at
    BEFORE UPDATE ON m2m.user_credits
    FOR EACH ROW
    EXECUTE FUNCTION m2m.update_credits_updated_at();
