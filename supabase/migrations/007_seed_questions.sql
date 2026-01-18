-- Migration 007: Seed Default Vibe Questions
-- Inserts the original hardcoded vibe questions into the questions table

INSERT INTO m2m.questions (key, question, category, options, display_order, is_active)
VALUES 
  (
    'money_talks',
    'The bill comes. What''s the move?',
    'values',
    '["Man pays 100%", "We split it 50/50", "Whoever invited pays"]'::jsonb,
    1,
    true
  ),
  (
    'sunday_morning',
    'Sunday morning at 9:00 AM...',
    'lifestyle',
    '["Church service, front row", "Sleeping in / Brunch", "At the gym / Hiking"]'::jsonb,
    2,
    true
  ),
  (
    'getaway',
    'Surprise Getaway. You hope it is...',
    'lifestyle',
    '["Luxury resort in Ada", "Paragliding in Kwahu", "Staycation in Accra"]'::jsonb,
    3,
    true
  ),
  (
    'communication_style',
    'Big argument. How do you handle it?',
    'values',
    '["I need space to cool off", "Talk it out immediately", "Write a thoughtful text"]'::jsonb,
    4,
    true
  ),
  (
    'social_battery',
    'After a long week of work...',
    'lifestyle',
    '["Going out with the crew", "Quiet night in alone", "Quality time with partner"]'::jsonb,
    5,
    true
  ),
  (
    'love_language',
    'How do you prefer to receive love?',
    'romance',
    '["Words of affirmation", "Quality time together", "Physical touch", "Gifts & surprises"]'::jsonb,
    6,
    true
  ),
  (
    'future_plans',
    'Where do you see yourself in 5 years?',
    'values',
    '["Building a family", "Career focused", "Traveling the world", "Still figuring it out"]'::jsonb,
    7,
    true
  ),
  (
    'deal_breaker',
    'What''s a deal breaker for you?',
    'values',
    '["Dishonesty", "Lack of ambition", "Different life goals", "Poor communication"]'::jsonb,
    8,
    true
  )
ON CONFLICT (key) DO UPDATE SET
  question = EXCLUDED.question,
  category = EXCLUDED.category,
  options = EXCLUDED.options,
  display_order = EXCLUDED.display_order;
