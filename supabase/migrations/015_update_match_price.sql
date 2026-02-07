-- Update default match unlock fee to 15 GHS
UPDATE m2m.settings 
SET value = '{"amount": 15, "currency": "GHS"}'::jsonb
WHERE key = 'default_match_unlock_fee';
