-- Update subscription price to 50 GHS
INSERT INTO m2m.settings (key, value)
VALUES (
  'subscription_price_monthly', 
  '{"amount": 50, "currency": "GHS"}'::jsonb
) 
ON CONFLICT (key) 
DO UPDATE SET value = EXCLUDED.value;
