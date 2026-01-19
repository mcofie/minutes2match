-- ================================================================
-- EXPANDED VIBE CHECK QUESTIONS + COMPATIBILITY SCORING
-- ================================================================

-- Add is_core column to questions table for fixed vs random questions
ALTER TABLE m2m.questions ADD COLUMN IF NOT EXISTS is_core BOOLEAN DEFAULT FALSE;
ALTER TABLE m2m.questions ADD COLUMN IF NOT EXISTS weight INTEGER DEFAULT 1;
ALTER TABLE m2m.questions ADD COLUMN IF NOT EXISTS dimension TEXT DEFAULT 'general';

-- Clear existing and insert comprehensive question set
TRUNCATE m2m.questions;

-- ================================================================
-- CORE QUESTIONS (5) - Everyone answers these for reliable matching
-- ================================================================

INSERT INTO m2m.questions (key, question, options, category, dimension, display_order, is_core, weight) VALUES

-- 1. Love Language (Critical for relationship compatibility)
('love_language', 'How do you most feel loved?', 
 '["Words of Affirmation - Tell me you love me 💬", "Acts of Service - Do things for me 🛠️", "Receiving Gifts - Surprise me with something 🎁", "Quality Time - Give me your undivided attention ⏰", "Physical Touch - Hold me, hug me 🫂"]'::jsonb, 
 'romance', 'love_language', 1, TRUE, 3),

-- 2. Communication Style (How they handle conflict)
('conflict_style', 'When we disagree, I prefer to...', 
 '["Talk it out immediately - Let''s resolve this now 🗣️", "Take space first - I need time to process 🧘", "Find a quick compromise - Let''s meet in the middle 🤝", "Avoid confrontation - It''ll blow over 😶", "Write it out - Texting is easier 📝"]'::jsonb, 
 'values', 'communication', 2, TRUE, 3),

-- 3. Social Energy (Introvert/Extrovert spectrum)
('social_energy', 'On a scale of homebody to social butterfly, I am...', 
 '["Full homebody - My couch is my bestie 🛋️", "Mostly introverted - Small gatherings only 🏠", "Balanced - Depends on my mood ⚖️", "Mostly extroverted - I love being out 🌟", "Life of the party - Where''s the next event? 🦋"]'::jsonb, 
 'lifestyle', 'social', 3, TRUE, 2),

-- 4. Life Goals (Kids/Career/Family)
('life_priority', 'In 5 years, my biggest priority is...', 
 '["Building my career and wealth 💼", "Starting or growing a family 👨‍👩‍👧", "Traveling and experiencing life 🌍", "Finding inner peace and balance 🧘", "Making an impact in my community 🌱"]'::jsonb, 
 'values', 'life_goals', 4, TRUE, 3),

-- 5. Relationship Pace
('relationship_pace', 'When it comes to relationships, I prefer to...', 
 '["Take it slow - Let''s be friends first 🐢", "Go with the flow - See where it goes 🌊", "Move with intention - I know what I want 🎯", "Move fast if it feels right - Life is short 🚀"]'::jsonb, 
 'romance', 'pace', 5, TRUE, 2);

-- ================================================================
-- BONUS QUESTIONS (Pick 2-3 randomly) - Adds variety and depth
-- ================================================================

INSERT INTO m2m.questions (key, question, options, category, dimension, display_order, is_core, weight) VALUES

-- Lifestyle
('weekend_vibe', 'It''s Friday night. What''s the move?', 
 '["Clubbing / Party 🪩", "Netflix & Chill 🍿", "Dinner with friends 🍽️", "Gaming / Hobbies 🎮", "Working on my goals 💻"]'::jsonb, 
 'lifestyle', 'lifestyle', 10, FALSE, 1),

('morning_person', 'I am definitely a...', 
 '["Morning person - Up at 5am 🌅", "Night owl - My brain works at midnight 🦉", "Somewhere in between ☀️🌙"]'::jsonb, 
 'lifestyle', 'lifestyle', 11, FALSE, 1),

('fitness_level', 'My relationship with fitness is...', 
 '["Gym is my second home 💪", "I try to stay active 🏃", "Occasional when motivated 🚶", "Exercise? I walk to the fridge 😅"]'::jsonb, 
 'lifestyle', 'lifestyle', 12, FALSE, 1),

-- Values
('deal_breaker', 'What is an absolute deal breaker for you?', 
 '["Bad hygiene 🤢", "No ambition 📉", "Disrespectful to service staff 🚩", "Smoking 🚬", "Always on their phone 📱"]'::jsonb, 
 'values', 'dealbreakers', 13, FALSE, 2),

('money_mindset', 'When it comes to money, I believe in...', 
 '["Save first, enjoy later 🏦", "YOLO - Life is for living 💸", "Balance between saving and spending ⚖️", "Invest everything - Build wealth 📈"]'::jsonb, 
 'values', 'finance', 14, FALSE, 1),

('ambition_level', 'My approach to career/hustle is...', 
 '["All in - I''m building an empire 👑", "Ambitious but work-life balance matters ⚖️", "Work to live, not live to work 🏖️", "Still figuring it out 🤔"]'::jsonb, 
 'values', 'ambition', 15, FALSE, 1),

-- Romance
('first_date', 'Ideal first date scenario?', 
 '["Fancy Dinner 🍷", "Coffee & Walk ☕", "Activity (Bowling/Movies) 🎳", "Drinks at a bar 🍹", "Something adventurous 🏄"]'::jsonb, 
 'romance', 'dating', 16, FALSE, 1),

('affection_public', 'When it comes to PDA (public affection)...', 
 '["All for it - Kiss me everywhere 💋", "Hand holding and light touches 🤝", "Keep it private - Respect the public 🔒", "Depends on the situation 🤷"]'::jsonb, 
 'romance', 'affection', 17, FALSE, 1),

-- Fun/Culture
('music_taste', 'Pass the aux cord. What are we playing?', 
 '["Afrobeats 🇬🇭🇳🇬", "Amapiano 🎹", "Hip Hop / Rap 🎤", "R&B / Soul 🎷", "Gospel 🙏", "Highlife / Classics 🎸"]'::jsonb, 
 'fun', 'culture', 18, FALSE, 1),

('food_adventurous', 'When trying new food, I am...', 
 '["Super adventurous - I''ll try anything 🍜", "Open but cautious 🍲", "Stick to what I know 🍕", "Extremely picky 😬"]'::jsonb, 
 'fun', 'culture', 19, FALSE, 1),

('travel_style', 'My travel style is...', 
 '["Luxury all the way ✨", "Backpacker/Budget traveler 🎒", "Mix of comfort and adventure 🗺️", "I prefer staycations 🏠"]'::jsonb, 
 'fun', 'culture', 20, FALSE, 1);

-- ================================================================
-- GRANT PERMISSIONS
-- ================================================================
GRANT SELECT ON m2m.questions TO authenticated, anon;
GRANT ALL ON m2m.questions TO service_role;
