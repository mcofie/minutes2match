INSERT INTO m2m.settings (key, value)
VALUES (
  'auto_match_min_score',
  '{"score": 75}'::jsonb
)
ON CONFLICT (key) DO NOTHING;
