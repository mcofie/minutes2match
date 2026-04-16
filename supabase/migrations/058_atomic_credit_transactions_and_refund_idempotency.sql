-- ============================================================
-- Migration 058: Atomic credit transactions & idempotent match refunds
-- ============================================================

ALTER TABLE m2m.matches
  ADD COLUMN IF NOT EXISTS refund_credited_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS idx_credit_transactions_match_refund_unique
  ON m2m.credit_transactions(user_id, reference_id)
  WHERE reason = 'match_expired_refund' AND reference_id IS NOT NULL;

CREATE OR REPLACE FUNCTION m2m.apply_credit_transaction(
  p_user_id UUID,
  p_amount NUMERIC,
  p_type TEXT,
  p_reason TEXT,
  p_reference_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  new_balance NUMERIC,
  transaction_id UUID,
  error TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_balance NUMERIC(10, 2);
  v_new_balance NUMERIC(10, 2);
  v_transaction_id UUID;
BEGIN
  IF p_user_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 0::NUMERIC, NULL::UUID, 'Invalid User ID'::TEXT;
    RETURN;
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RETURN QUERY SELECT FALSE, 0::NUMERIC, NULL::UUID, 'Amount must be positive'::TEXT;
    RETURN;
  END IF;

  IF p_type NOT IN ('credit', 'debit') THEN
    RETURN QUERY SELECT FALSE, 0::NUMERIC, NULL::UUID, 'Invalid transaction type'::TEXT;
    RETURN;
  END IF;

  INSERT INTO m2m.user_credits (user_id, balance)
  VALUES (p_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  BEGIN
    SELECT balance
      INTO v_current_balance
      FROM m2m.user_credits
     WHERE user_id = p_user_id
     FOR UPDATE;

    v_current_balance := COALESCE(v_current_balance, 0);

    IF p_type = 'debit' AND v_current_balance < p_amount THEN
      RETURN QUERY
      SELECT FALSE, v_current_balance, NULL::UUID,
        format('Insufficient balance. Have GHS %s, need GHS %s', v_current_balance, p_amount)::TEXT;
      RETURN;
    END IF;

    v_new_balance := ROUND((
      CASE
        WHEN p_type = 'credit' THEN v_current_balance + p_amount
        ELSE v_current_balance - p_amount
      END
    )::NUMERIC, 2);

    UPDATE m2m.user_credits
       SET balance = v_new_balance,
           updated_at = now()
     WHERE user_id = p_user_id;

    INSERT INTO m2m.credit_transactions (
      user_id,
      amount,
      type,
      reason,
      reference_id,
      description,
      balance_after
    )
    VALUES (
      p_user_id,
      p_amount,
      p_type,
      p_reason,
      p_reference_id,
      COALESCE(p_description, initcap(replace(p_reason, '_', ' '))),
      v_new_balance
    )
    RETURNING id INTO v_transaction_id;

    RETURN QUERY SELECT TRUE, v_new_balance, v_transaction_id, NULL::TEXT;
    RETURN;
  EXCEPTION
    WHEN unique_violation THEN
      IF p_type = 'credit' AND p_reason = 'match_expired_refund' AND p_reference_id IS NOT NULL THEN
        SELECT id, balance_after
          INTO v_transaction_id, v_new_balance
          FROM m2m.credit_transactions
         WHERE user_id = p_user_id
           AND reason = p_reason
           AND reference_id = p_reference_id
         ORDER BY created_at DESC
         LIMIT 1;

        RETURN QUERY SELECT TRUE, COALESCE(v_new_balance, v_current_balance, 0), v_transaction_id, NULL::TEXT;
        RETURN;
      END IF;

      RETURN QUERY SELECT FALSE, COALESCE(v_current_balance, 0), NULL::UUID, 'Duplicate transaction'::TEXT;
      RETURN;
  END;
END;
$$;

GRANT EXECUTE ON FUNCTION m2m.apply_credit_transaction(UUID, NUMERIC, TEXT, TEXT, UUID, TEXT) TO authenticated, service_role;
