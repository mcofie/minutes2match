-- Migration: 053_vibe_question_pools.sql
-- Adds support for question rotation/pools while maintaining compatibility

-- 1. Ensure dimension column exists in questions (already should, but for safety)
ALTER TABLE m2m.questions ADD COLUMN IF NOT EXISTS dimension TEXT DEFAULT 'general';

-- 2. Add dimension column to vibe_answers for easier matching across varied questions
ALTER TABLE m2m.vibe_answers ADD COLUMN IF NOT EXISTS dimension TEXT;

-- 3. Populate dimensions for existing answers based on the questions table
UPDATE m2m.vibe_answers va
SET dimension = q.dimension
FROM m2m.questions q
WHERE va.question_key = q.key;

-- 4. Add new variations for core questions (identical options to maintain matching logic)
INSERT INTO m2m.questions (key, question, options, category, dimension, display_order, is_core, weight) VALUES

-- Love Language Variations
('love_language_v2', 'In a relationship, which of these makes you feel most appreciated?', 
 '["Words of Affirmation - Tell me you love me 💬", "Acts of Service - Do things for me 🛠️", "Receiving Gifts - Surprise me with something 🎁", "Quality Time - Give me your undivided attention ⏰", "Physical Touch - Hold me, hug me 🫂"]'::jsonb, 
 'romance', 'love_language', 1, TRUE, 3),

('love_language_v3', 'What is your primary way of giving and receiving affection?', 
 '["Words of Affirmation - Tell me you love me 💬", "Acts of Service - Do things for me 🛠️", "Receiving Gifts - Surprise me with something 🎁", "Quality Time - Give me your undivided attention ⏰", "Physical Touch - Hold me, hug me 🫂"]'::jsonb, 
 'romance', 'love_language', 1, TRUE, 3),

-- Communication Style Variations
('conflict_style_v2', 'When you and a partner have a misunderstanding, how do you handle it?', 
 '["Talk it out immediately - Let''s resolve this now 🗣️", "Take space first - I need time to process 🧘", "Find a quick compromise - Let''s meet in the middle 🤝", "Avoid confrontation - It''ll blow over 😶", "Write it out - Texting is easier 📝"]'::jsonb, 
 'values', 'communication', 2, TRUE, 3),

('conflict_style_v3', 'Which best describes your approach to relationship disagreements?', 
 '["Talk it out immediately - Let''s resolve this now 🗣️", "Take space first - I need time to process 🧘", "Find a quick compromise - Let''s meet in the middle 🤝", "Avoid confrontation - It''ll blow over 😶", "Write it out - Texting is easier 📝"]'::jsonb, 
 'values', 'communication', 2, TRUE, 3),

-- Social Energy Variations
('social_energy_v2', 'How much social interaction do you usually need to feel energized?', 
 '["Full homebody - My couch is my bestie 🛋️", "Mostly introverted - Small gatherings only 🏠", "Balanced - Depends on my mood ⚖️", "Mostly extroverted - I love being out 🌟", "Life of the party - Where''s the next event? 🦋"]'::jsonb, 
 'lifestyle', 'social', 3, TRUE, 2),

('social_energy_v3', 'Are you more of a quiet night in or a big night out person?', 
 '["Full homebody - My couch is my bestie 🛋️", "Mostly introverted - Small gatherings only 🏠", "Balanced - Depends on my mood ⚖️", "Mostly extroverted - I love being out 🌟", "Life of the party - Where''s the next event? 🦋"]'::jsonb, 
 'lifestyle', 'social', 3, TRUE, 2),

-- Life Goals Variations
('life_priority_v2', 'What is the most important thing you are working towards right now?', 
 '["Building my career and wealth 💼", "Starting or growing a family 👨‍👩‍👧", "Traveling and experiencing life 🌍", "Finding inner peace and balance 🧘", "Making an impact in my community 🌱"]'::jsonb, 
 'values', 'life_goals', 4, TRUE, 3),

('life_priority_v3', 'If you had to pick one major focus for the next few years, it would be...', 
 '["Building my career and wealth 💼", "Starting or growing a family 👨‍👩‍👧", "Traveling and experiencing life 🌍", "Finding inner peace and balance 🧘", "Making an impact in my community 🌱"]'::jsonb, 
 'values', 'life_goals', 4, TRUE, 3),

-- Relationship Pace Variations
('relationship_pace_v2', 'What''s your preferred speed for getting to know someone serious?', 
 '["Take it slow - Let''s be friends first 🐢", "Go with the flow - See where it goes 🌊", "Move with intention - I know what I want 🎯", "Move fast if it feels right - Life is short 🚀"]'::jsonb, 
 'romance', 'pace', 5, TRUE, 2),

('relationship_pace_v3', 'How do you usually approach the early stages of dating?', 
 '["Take it slow - Let''s be friends first 🐢", "Go with the flow - See where it goes 🌊", "Move with intention - I know what I want 🎯", "Move fast if it feels right - Life is short 🚀"]'::jsonb, 
 'romance', 'pace', 5, TRUE, 2)

ON CONFLICT (key) DO NOTHING;

-- 5. Add some fresh Bonus Questions
INSERT INTO m2m.questions (key, question, options, category, dimension, display_order, is_core, weight) VALUES
('weekend_morning', 'Saturday morning – what are you doing?', '["Sleeping in late 💤", "Early morning gym/run 👟", "Brunch with besties 🥞", "Doing chores/errands 🧺", "Starting a new adventure 🚘"]'::jsonb, 'lifestyle', 'morning_routine', 30, FALSE, 1),
('dream_vacation', 'If you won a free trip, where would you go?', '["Luxury resort in the Maldives 🏝️", "Exploring European cities 🏰", "Adventure trip in the mountains 🏔️", "Cultural tour of Tokyo 🍣", "African Safari 🦁"]'::jsonb, 'fun', 'travel', 31, FALSE, 1),
('pet_person', 'How do you feel about pets?', '["Total dog person 🐶", "Cat lover 🐱", "Love all animals 🐾", "Not really a pet person 🙅", "Maybe one day... 💭"]'::jsonb, 'lifestyle', 'lifestyle', 32, FALSE, 1)
ON CONFLICT (key) DO NOTHING;
