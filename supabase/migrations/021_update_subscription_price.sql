-- Update subscription price to 1 GHS for testing
INSERT INTO m2m.settings (key, value)
VALUES (
  'subscription_price_monthly', 
  '{"amount": 1, "currency": "GHS"}'::jsonb
) 
ON CONFLICT (key) 
DO UPDATE SET value = EXCLUDED.value;
