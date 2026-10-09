-- Migration: 070_vibe_check_v2.sql
-- Vibe Check v2: 1–7 statements + "top 5 values", grouped into story chapters.
--
-- * Keeps the five existing core dimensions (love language, communication, social,
--   life goals, pace) so current members' answers keep matching.
-- * Adds ten 1–7 statements and a values pick (mirrored in utils/vibeQuestions.ts).
-- * Retires the random bonus questions to keep the check short (~16 taps).
-- * Answers keep using m2m.vibe_answers.answer_value (TEXT): scales store '1'..'7',
--   the values pick stores a JSON array string.

-- 1. New question metadata
ALTER TABLE m2m.questions ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'choice'
  CHECK (type IN ('choice', 'scale', 'values'));
ALTER TABLE m2m.questions ADD COLUMN IF NOT EXISTS chapter TEXT
  CHECK (chapter IS NULL OR chapter IN ('want', 'relate', 'live', 'believe'));
ALTER TABLE m2m.questions ADD COLUMN IF NOT EXISTS story_label TEXT;
ALTER TABLE m2m.questions ADD COLUMN IF NOT EXISTS scale_min_label TEXT;
ALTER TABLE m2m.questions ADD COLUMN IF NOT EXISTS scale_max_label TEXT;
ALTER TABLE m2m.questions ADD COLUMN IF NOT EXISTS max_picks INT;

-- 2. Place the existing core questions into chapters
UPDATE m2m.questions SET chapter = 'want'   WHERE dimension IN ('life_goals', 'pace');
UPDATE m2m.questions SET chapter = 'relate' WHERE dimension IN ('love_language', 'communication');
UPDATE m2m.questions SET chapter = 'live'   WHERE dimension = 'social';

-- 3. Retire bonus questions (non-core) so the check stays short
UPDATE m2m.questions SET is_active = FALSE WHERE COALESCE(is_core, FALSE) = FALSE AND chapter IS NULL;

-- 4. New 1–7 statements
INSERT INTO m2m.questions
  (key, question, options, category, dimension, display_order, is_core, weight, is_active, type, chapter, story_label, scale_min_label, scale_max_label)
VALUES
  ('v2_kids', 'Having children is part of the life I want.', '[]'::jsonb, 'values', 'v2_kids', 101, TRUE, 12, TRUE, 'scale', 'want', 'Kids', 'Not for me', 'It''s my dream'),
  ('v2_marriage_timeline', 'I''d like to be married within the next three years.', '[]'::jsonb, 'values', 'v2_marriage_timeline', 102, TRUE, 8, TRUE, 'scale', 'want', 'Marriage timeline', 'No rush', 'Yes, soon'),
  ('v2_relocate', 'For the right person, I''d move to another city or country.', '[]'::jsonb, 'lifestyle', 'v2_relocate', 103, TRUE, 4, TRUE, 'scale', 'want', 'Moving for love', 'I''m rooted here', 'I''d go anywhere'),
  ('v2_contact', 'I like to hear from my partner throughout the day.', '[]'::jsonb, 'romance', 'v2_contact', 201, TRUE, 6, TRUE, 'scale', 'relate', 'Staying in touch', 'I need my space', 'Constant contact'),
  ('v2_growth', 'My partner should push me to become a better person.', '[]'::jsonb, 'romance', 'v2_growth', 202, TRUE, 4, TRUE, 'scale', 'relate', 'Growing together', 'Accept me as I am', 'Challenge me'),
  ('v2_family_say', 'My family will have a real say in who I marry.', '[]'::jsonb, 'values', 'v2_family_say', 203, TRUE, 6, TRUE, 'scale', 'relate', 'Family''s say', 'My decision alone', 'Family comes first'),
  ('v2_money', 'I''d rather save for the future than spend on enjoying today.', '[]'::jsonb, 'lifestyle', 'v2_money', 301, TRUE, 6, TRUE, 'scale', 'live', 'Money', 'Enjoy it now', 'Build the nest egg'),
  ('v2_drinking', 'I''m comfortable with my partner drinking alcohol.', '[]'::jsonb, 'lifestyle', 'v2_drinking', 302, TRUE, 6, TRUE, 'scale', 'live', 'Drinking', 'Not at all', 'Cheers to that'),
  ('v2_faith', 'Faith is central to my daily life.', '[]'::jsonb, 'values', 'v2_faith', 401, TRUE, 10, TRUE, 'scale', 'believe', 'Faith', 'Private or not religious', 'It guides everything'),
  ('v2_roles', 'Traditional roles have a place in my relationship.', '[]'::jsonb, 'values', 'v2_roles', 402, TRUE, 6, TRUE, 'scale', 'believe', 'Traditional roles', 'Not at all', 'Very much so')
ON CONFLICT (key) DO UPDATE SET
  question = EXCLUDED.question, dimension = EXCLUDED.dimension, display_order = EXCLUDED.display_order,
  is_core = EXCLUDED.is_core, weight = EXCLUDED.weight, is_active = EXCLUDED.is_active, type = EXCLUDED.type,
  chapter = EXCLUDED.chapter, story_label = EXCLUDED.story_label,
  scale_min_label = EXCLUDED.scale_min_label, scale_max_label = EXCLUDED.scale_max_label;

-- 5. Top-5 values pick
INSERT INTO m2m.questions
  (key, question, options, category, dimension, display_order, is_core, weight, is_active, type, chapter, story_label, max_picks)
VALUES
  ('v2_core_values', 'Pick the 5 values that matter most to you in a partner.',
   '["Kind 💛", "Loyal 🤝", "Honest 🫶", "God-fearing 🙏", "Family-oriented 👨‍👩‍👧", "Ambitious 🚀", "Hardworking 💪", "Respectful 🎩", "Funny 😂", "Intelligent 🧠", "Patient 🌿", "Generous 🎁", "Romantic 🌹", "Adventurous 🧭", "Calm 🧘"]'::jsonb,
   'values', 'v2_core_values', 204, TRUE, 10, TRUE, 'values', 'relate', 'Core values', 5)
ON CONFLICT (key) DO UPDATE SET
  question = EXCLUDED.question, options = EXCLUDED.options, dimension = EXCLUDED.dimension,
  display_order = EXCLUDED.display_order, is_core = EXCLUDED.is_core, weight = EXCLUDED.weight,
  is_active = EXCLUDED.is_active, type = EXCLUDED.type, chapter = EXCLUDED.chapter,
  story_label = EXCLUDED.story_label, max_picks = EXCLUDED.max_picks;
