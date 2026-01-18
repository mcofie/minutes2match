-- ================================================================
-- DYNAMIC QUESTIONS SYSTEM
-- ================================================================

-- 1. Create Questions Table
CREATE TABLE IF NOT EXISTS m2m.questions (
  key TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Stored as JSON array: ["Option A", "Option B"]
  category TEXT DEFAULT 'general',
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE m2m.questions ENABLE ROW LEVEL SECURITY;

-- 3. Policies
-- Everyone can read active questions (for onboarding)
CREATE POLICY "Anyone can read active questions" ON m2m.questions 
  FOR SELECT USING (is_active = TRUE);

-- Only admins can manage questions
CREATE POLICY "Admins can manage questions" ON m2m.questions 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM m2m.admins WHERE id = auth.uid())
  );

-- 4. Seed Default Questions (Migrate from hardcoded)
INSERT INTO m2m.questions (key, question, options, category, display_order) VALUES
('weekend_vibe', 'It''s Friday night. What''s the move?', '["Clubbing / Party 🪩", "Netflix & Chill 🍿", "Dinner with friends 🍽️", "Gaming all night 🎮", "Working on side hustle 💻"]'::jsonb, 'lifestyle', 1),
('music_taste', 'Pass the aux cord. What are we playing?', '["Afrobeats 🇬🇭🇳🇬", "Amapiano 🎹", "Hip Hop / Rap 🎤", "R&B / Soul 🎷", "Gospel 🙏", "Highlife 🎸"]'::jsonb, 'lifestyle', 2),
('deal_breaker', 'What is an absolute deal breaker for you?', '["Bad hygiene 🤢", "No ambition 📉", "Disrespectful to service staff 🚩", "Smoking 🚬", "Always on their phone 📱"]'::jsonb, 'values', 3),
('first_date', 'Ideal first date scenario?', '["Fancy Dinner 🍷", "Coffee & Walk ☕", "Activity (Bowling/Movies) 🎳", "Drinks at a bar 🍹", "Picnic at the park 🧺"]'::jsonb, 'romance', 4),
('love_language', 'What is your primary love language?', '["Words of Affirmation 💬", "Acts of Service 🛠️", "Receiving Gifts 🎁", "Quality Time ⏰", "Physical Touch 🫂"]'::jsonb, 'romance', 5)
ON CONFLICT (key) DO NOTHING;

-- 5. Grant Permissions
GRANT SELECT ON m2m.questions TO authenticated, anon;
GRANT ALL ON m2m.questions TO service_role;
