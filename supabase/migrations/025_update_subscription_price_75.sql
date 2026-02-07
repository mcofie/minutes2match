-- Update subscription price to 75 GHS
INSERT INTO m2m.settings (key, value)
VALUES (
  'subscription_price_monthly', 
  '{"amount": 75, "currency": "GHS"}'::jsonb
) 
ON CONFLICT (key) 
DO UPDATE SET value = EXCLUDED.value;
