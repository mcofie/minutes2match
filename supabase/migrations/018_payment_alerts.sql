-- Migration: Payment alerts and audit logging
-- Creates tables for payment monitoring and admin alerts

-- Payment alerts table for failed payments and errors
CREATE TABLE IF NOT EXISTS m2m.payment_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_ref TEXT,
    user_id UUID REFERENCES m2m.profiles(id),
    amount DECIMAL(10,2),
    purpose TEXT,
    error_message TEXT,
    alert_type TEXT CHECK (alert_type IN ('payment_failed', 'verification_error', 'webhook_error', 'refund_needed')),
    resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID REFERENCES m2m.profiles(id),
    resolved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for unresolved alerts
CREATE INDEX IF NOT EXISTS idx_payment_alerts_unresolved 
ON m2m.payment_alerts(resolved, created_at DESC) 
WHERE resolved = FALSE;

-- Add payment tracking columns to matches if not exist
ALTER TABLE m2m.matches 
    ADD COLUMN IF NOT EXISTS user_1_paid_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS user_2_paid_at TIMESTAMPTZ;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✓ Migration 018: Payment alerts table created successfully!';
END $$;
