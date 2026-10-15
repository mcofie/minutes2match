-- Migration: 079_date_ideas.sql
--
-- Date ideas move from code (utils/dateIdeas.ts) into the database, so the team can add,
-- edit and retire them from the admin without a release.
--
-- 1. m2m.date_ideas: the catalogue. An idea is an activity ("Cook-off for two") or a real
--    place ("Gallery 1957"); venue_id links it to a partner venue whose offer is shown with it.
--    Seeded with the 44 ideas that were in code.
-- 2. m2m.date_idea_reactions: what each person in a match thinks of a suggested idea
--    ("We went", "Sounds fun", "Not for us"). "Not for us" hides it for that pair; across
--    everyone, reactions nudge ideas up or down.

CREATE TABLE IF NOT EXISTS m2m.date_ideas (
  id TEXT PRIMARY KEY CHECK (id ~ '^[a-z0-9-]+$'),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  energy TEXT NOT NULL DEFAULT 'any' CHECK (energy IN ('quiet', 'social', 'any')),
  slot TEXT NOT NULL DEFAULT 'evening' CHECK (slot IN ('afternoon', 'evening', 'night')),
  kind TEXT NOT NULL CHECK (kind IN ('food', 'outdoors', 'culture', 'active', 'nightlife', 'cosy', 'adventure')),
  city TEXT CHECK (city IS NULL OR city IN ('accra', 'nairobi')),
  country TEXT CHECK (country IS NULL OR country IN ('gh', 'ke')),
  place TEXT,
  day_trip BOOLEAN NOT NULL DEFAULT FALSE,
  deep BOOLEAN NOT NULL DEFAULT FALSE,
  price SMALLINT NOT NULL DEFAULT 2 CHECK (price BETWEEN 1 AND 3),
  alcohol BOOLEAN NOT NULL DEFAULT FALSE,
  outdoor BOOLEAN NOT NULL DEFAULT FALSE,
  zone TEXT CHECK (zone IS NULL OR zone IN ('accra-central', 'accra-north', 'accra-east', 'nairobi-central', 'nairobi-west', 'nairobi-south', 'nairobi-north')),
  venue_id UUID REFERENCES m2m.partner_venues(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS m2m.date_idea_reactions (
  match_id UUID NOT NULL REFERENCES m2m.matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES m2m.profiles(id) ON DELETE CASCADE,
  idea_id TEXT NOT NULL REFERENCES m2m.date_ideas(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL CHECK (reaction IN ('went', 'keen', 'not_for_us')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (match_id, user_id, idea_id)
);
CREATE INDEX IF NOT EXISTS date_idea_reactions_idea_idx ON m2m.date_idea_reactions (idea_id);

-- Ideas are public catalogue content: anyone signed in can read active ones; admins manage them.
-- Reactions are written through /api/matches/:id/date-idea (service role); admins can read them.
ALTER TABLE m2m.date_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE m2m.date_idea_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members read active date ideas" ON m2m.date_ideas;
CREATE POLICY "Members read active date ideas" ON m2m.date_ideas FOR SELECT USING (is_active OR m2m.is_admin());
DROP POLICY IF EXISTS "Admins manage date ideas" ON m2m.date_ideas;
CREATE POLICY "Admins manage date ideas" ON m2m.date_ideas FOR ALL USING (m2m.is_admin()) WITH CHECK (m2m.is_admin());

DROP POLICY IF EXISTS "Admins read date idea reactions" ON m2m.date_idea_reactions;
CREATE POLICY "Admins read date idea reactions" ON m2m.date_idea_reactions FOR SELECT USING (m2m.is_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON m2m.date_ideas TO authenticated;
GRANT SELECT ON m2m.date_idea_reactions TO authenticated;

INSERT INTO m2m.date_ideas
  (id, title, description, tags, energy, slot, kind, city, country, place, day_trip, deep, price, alcohol, outdoor, zone, sort_order)
VALUES
  ('cafe', 'Bookstore café afternoon', 'Find a cosy corner, order something warm and swap book, show or podcast recommendations.', ARRAY['reading', 'art', 'tech', 'entrepreneurship']::text[], 'quiet', 'afternoon', 'cosy', NULL, NULL, NULL, FALSE, TRUE, 1, FALSE, FALSE, NULL, 10),
  ('food-crawl', 'Food crawl', 'Three stops: small chops, a main and dessert. Take turns choosing the spot.', ARRAY['food', 'cooking', 'travel']::text[], 'social', 'evening', 'food', NULL, NULL, NULL, FALSE, FALSE, 2, FALSE, FALSE, NULL, 20),
  ('cook', 'Cook-off for two', 'Pick a dish neither of you has made, shop for it together and cook it.', ARRAY['cooking', 'food']::text[], 'quiet', 'evening', 'food', NULL, NULL, NULL, FALSE, TRUE, 1, FALSE, FALSE, NULL, 30),
  ('music', 'Live music night', 'Find a live band and let the music do some of the talking.', ARRAY['music', 'dancing']::text[], 'social', 'night', 'nightlife', NULL, NULL, NULL, FALSE, FALSE, 2, TRUE, FALSE, NULL, 40),
  ('dance', 'Beginner dance class', 'Try a salsa or afrobeats class. Laughing at yourselves is half the fun.', ARRAY['dancing', 'music', 'fitness']::text[], 'social', 'evening', 'active', NULL, NULL, NULL, FALSE, FALSE, 2, FALSE, FALSE, NULL, 50),
  ('gallery', 'Gallery hop', 'Walk through a local exhibition, then debate your favourite piece over a drink.', ARRAY['art', 'photography', 'fashion']::text[], 'any', 'afternoon', 'culture', NULL, NULL, NULL, FALSE, FALSE, 1, FALSE, FALSE, NULL, 60),
  ('picnic', 'Sunset picnic', 'Pack snacks, find a spot with a view and watch the sun go down together.', ARRAY['nature', 'photography', 'travel']::text[], 'quiet', 'evening', 'outdoors', NULL, NULL, NULL, FALSE, TRUE, 1, FALSE, TRUE, NULL, 70),
  ('movie', 'Movie, then a debrief', 'Catch a film, then compare reviews over dessert.', ARRAY['movies']::text[], 'quiet', 'evening', 'cosy', NULL, NULL, NULL, FALSE, FALSE, 2, FALSE, FALSE, NULL, 80),
  ('games', 'Board game café', 'A little friendly competition is one of the easiest ways to break the ice.', ARRAY['gaming', 'tech']::text[], 'any', 'afternoon', 'cosy', NULL, NULL, NULL, FALSE, FALSE, 2, FALSE, FALSE, NULL, 90),
  ('watch-match', 'Watch a match together', 'Pick a game, find a lively spot and back opposite teams for fun.', ARRAY['sports']::text[], 'social', 'evening', 'nightlife', NULL, NULL, NULL, FALSE, FALSE, 2, TRUE, FALSE, NULL, 100),
  ('dinner', 'Slow dinner with good questions', 'Somewhere calm with good food. Take turns asking the questions you would not ask on an app.', ARRAY[]::text[], 'any', 'evening', 'food', NULL, NULL, NULL, FALSE, TRUE, 3, FALSE, FALSE, NULL, 110),
  ('arcade', 'Arcade or bowling night', 'Loser buys the ice cream. Keeps things light and lets your competitive sides out.', ARRAY['gaming', 'sports']::text[], 'social', 'evening', 'active', NULL, NULL, NULL, FALSE, FALSE, 2, FALSE, FALSE, NULL, 120),
  ('paint', 'Paint and sip', 'Nobody needs to be good at it. Swap canvases at the end and keep each other''s.', ARRAY['art']::text[], 'any', 'evening', 'culture', NULL, NULL, NULL, FALSE, FALSE, 2, TRUE, FALSE, NULL, 130),
  ('photo-walk', 'Photo walk', 'Each of you shoots ten photos of the same streets, then compare who saw what.', ARRAY['photography', 'travel', 'art']::text[], 'any', 'afternoon', 'outdoors', NULL, NULL, NULL, FALSE, FALSE, 1, FALSE, TRUE, NULL, 140),
  ('workout', 'Workout, then smoothies', 'A gym class, run or court session together, then a smoothie and a proper chat.', ARRAY['fitness', 'sports']::text[], 'any', 'afternoon', 'active', NULL, NULL, NULL, FALSE, FALSE, 1, FALSE, FALSE, NULL, 150),
  ('thrift', 'Thrift and style each other', 'Set a small budget and pick an outfit for each other at a second-hand market.', ARRAY['fashion']::text[], 'social', 'afternoon', 'culture', NULL, NULL, NULL, FALSE, FALSE, 1, FALSE, FALSE, NULL, 160),
  ('founders', 'Big-ideas coffee', 'Bring one idea you would build if money were no object and pull each other''s apart, kindly.', ARRAY['entrepreneurship', 'tech']::text[], 'quiet', 'afternoon', 'cosy', NULL, NULL, NULL, FALSE, TRUE, 1, FALSE, FALSE, NULL, 170),
  ('karaoke', 'Karaoke night', 'One duet is compulsory. Song choice says a lot about a person.', ARRAY['music']::text[], 'social', 'night', 'nightlife', NULL, NULL, NULL, FALSE, FALSE, 2, TRUE, FALSE, NULL, 180),
  ('dessert', 'Dessert tasting', 'Share three desserts at three places and crown a winner.', ARRAY['food']::text[], 'any', 'evening', 'food', NULL, NULL, NULL, FALSE, FALSE, 2, FALSE, FALSE, NULL, 190),
  ('acc-labadi', 'Sunset at Labadi Beach', 'Walk the sand, grab a coconut and stay for the drummers as the sun goes down.', ARRAY['nature', 'music', 'travel']::text[], 'social', 'evening', 'outdoors', 'accra', NULL, 'Labadi Beach', FALSE, FALSE, 1, FALSE, TRUE, 'accra-central', 200),
  ('acc-jamestown', 'Jamestown walk', 'See the lighthouse and the murals, watch the fishing boats come in, then eat nearby.', ARRAY['photography', 'art', 'travel']::text[], 'any', 'afternoon', 'culture', 'accra', NULL, 'Jamestown', FALSE, FALSE, 1, FALSE, TRUE, 'accra-central', 210),
  ('acc-oxford', 'Osu street food night', 'Kelewele, khebab and a cold drink along Oxford Street, then wherever the music is.', ARRAY['food', 'music']::text[], 'social', 'night', 'food', 'accra', NULL, 'Oxford Street, Osu', FALSE, FALSE, 1, TRUE, FALSE, 'accra-central', 220),
  ('acc-aburi', 'Day trip to Aburi Gardens', 'Cool air, old trees and a slow lunch in the hills. Leave early and take the scenic drive.', ARRAY['nature', 'travel', 'photography']::text[], 'quiet', 'afternoon', 'adventure', 'accra', NULL, 'Aburi Botanical Gardens', TRUE, TRUE, 2, FALSE, TRUE, NULL, 230),
  ('acc-artscentre', 'Arts Centre craft market', 'Browse kente, carvings and beads, and pick a small something for each other.', ARRAY['art', 'fashion']::text[], 'social', 'afternoon', 'culture', 'accra', NULL, 'Centre for National Culture', FALSE, FALSE, 1, FALSE, TRUE, 'accra-central', 240),
  ('acc-legon', 'Canopy walk at Legon Botanical Garden', 'Walk among the treetops, then picnic on the lawns.', ARRAY['nature', 'fitness']::text[], 'any', 'afternoon', 'outdoors', 'accra', NULL, 'Legon Botanical Garden', FALSE, FALSE, 1, FALSE, TRUE, 'accra-north', 250),
  ('acc-jazz', 'Live highlife and jazz', 'A table near the band, good food and old-school highlife. Easy to talk between sets.', ARRAY['music', 'dancing']::text[], 'social', 'night', 'nightlife', 'accra', NULL, '+233 Jazz Bar & Grill', FALSE, FALSE, 3, TRUE, FALSE, 'accra-central', 260),
  ('acc-gallery', 'Contemporary art at Gallery 1957', 'Some of the best new Ghanaian art, then a drink close by to talk it through.', ARRAY['art', 'photography', 'fashion']::text[], 'quiet', 'afternoon', 'culture', 'accra', NULL, 'Gallery 1957', FALSE, FALSE, 1, FALSE, FALSE, 'accra-central', 270),
  ('acc-shai', 'Hike Shai Hills', 'Baboons, caves and wide views about an hour out of town. Bring water and good shoes.', ARRAY['nature', 'fitness', 'travel']::text[], 'any', 'afternoon', 'adventure', 'accra', NULL, 'Shai Hills Resource Reserve', TRUE, FALSE, 2, FALSE, TRUE, NULL, 280),
  ('acc-bojo', 'Boat across to Bojo Beach', 'A short canoe ride over the lagoon to a quieter beach. Spend the afternoon there.', ARRAY['nature', 'travel']::text[], 'quiet', 'afternoon', 'outdoors', 'accra', NULL, 'Bojo Beach', TRUE, FALSE, 2, FALSE, TRUE, NULL, 290),
  ('acc-nkrumah', 'History date at the Nkrumah Memorial', 'Walk the park and museum, then talk about what independence-era Ghana means to you both.', ARRAY['reading', 'travel']::text[], 'quiet', 'afternoon', 'culture', 'accra', NULL, 'Kwame Nkrumah Memorial Park', FALSE, TRUE, 1, FALSE, TRUE, 'accra-central', 300),
  ('gh-jollof', 'Settle the jollof debate', 'Each of you makes (or buys) your best jollof and the other judges. Bragging rights only.', ARRAY['cooking', 'food']::text[], 'quiet', 'evening', 'food', NULL, 'gh', NULL, FALSE, FALSE, 1, FALSE, FALSE, NULL, 310),
  ('gh-chopbar', 'Chop bar lunch', 'Fufu and light soup at a proper local spot. Eat with your hands and no phones.', ARRAY['food']::text[], 'any', 'afternoon', 'food', NULL, 'gh', NULL, FALSE, FALSE, 1, FALSE, FALSE, NULL, 320),
  ('nbo-karura', 'Walk or bike Karura Forest', 'Follow the trails to the waterfall and caves, then coffee at the forest café.', ARRAY['nature', 'fitness', 'photography']::text[], 'any', 'afternoon', 'outdoors', 'nairobi', NULL, 'Karura Forest', FALSE, FALSE, 1, FALSE, TRUE, 'nairobi-north', 330),
  ('nbo-giraffe', 'Feed the giraffes', 'Get up close at the Giraffe Centre in Karen, then lunch somewhere leafy nearby.', ARRAY['nature', 'photography', 'travel']::text[], 'any', 'afternoon', 'outdoors', 'nairobi', NULL, 'Giraffe Centre, Karen', FALSE, FALSE, 2, FALSE, TRUE, 'nairobi-south', 340),
  ('nbo-park', 'Game drive in the city', 'Lions and giraffes with skyscrapers behind them. Go early, then brunch after.', ARRAY['nature', 'photography', 'travel']::text[], 'quiet', 'afternoon', 'adventure', 'nairobi', NULL, 'Nairobi National Park', TRUE, FALSE, 3, FALSE, TRUE, 'nairobi-south', 350),
  ('nbo-ngong', 'Hike the Ngong Hills', 'Ridge walks with views over the Rift Valley. Pack snacks and stop at the top.', ARRAY['fitness', 'nature', 'sports']::text[], 'any', 'afternoon', 'adventure', 'nairobi', NULL, 'Ngong Hills', TRUE, FALSE, 1, FALSE, TRUE, 'nairobi-south', 360),
  ('nbo-arboretum', 'Picnic at the Arboretum', 'Shade, birdsong and a blanket. One of the calmest corners of the city.', ARRAY['nature', 'reading']::text[], 'quiet', 'afternoon', 'outdoors', 'nairobi', NULL, 'Nairobi Arboretum', FALSE, TRUE, 1, FALSE, TRUE, 'nairobi-west', 370),
  ('nbo-kicc', 'City views from KICC', 'Go up to the rooftop for the skyline, then dinner in town.', ARRAY['photography', 'travel']::text[], 'any', 'evening', 'culture', 'nairobi', NULL, 'KICC rooftop', FALSE, FALSE, 2, FALSE, FALSE, 'nairobi-central', 380),
  ('nbo-westlands', 'Live music in Westlands', 'Start with dinner, then find a band. There is always something on.', ARRAY['music', 'dancing']::text[], 'social', 'night', 'nightlife', 'nairobi', NULL, 'Westlands', FALSE, FALSE, 2, TRUE, FALSE, 'nairobi-west', 390),
  ('nbo-maasai', 'Maasai Market wander', 'Beads, fabrics and baskets. Haggle as a team and pick one thing for each other.', ARRAY['fashion', 'art']::text[], 'social', 'afternoon', 'culture', 'nairobi', NULL, 'Maasai Market', FALSE, FALSE, 1, FALSE, TRUE, 'nairobi-central', 400),
  ('nbo-art', 'Art at Circle Art Gallery', 'East African contemporary art and lots to talk about on the way out.', ARRAY['art', 'photography']::text[], 'quiet', 'afternoon', 'culture', 'nairobi', NULL, 'Circle Art Gallery', FALSE, FALSE, 1, FALSE, FALSE, 'nairobi-west', 410),
  ('nbo-naivasha', 'Cycle Hell''s Gate', 'Bike past zebras and gorges near Naivasha. A proper adventure for a full day out.', ARRAY['fitness', 'nature', 'travel', 'sports']::text[], 'any', 'afternoon', 'adventure', 'nairobi', NULL, 'Hell''s Gate, Naivasha', TRUE, FALSE, 3, FALSE, TRUE, NULL, 420),
  ('ke-nyama', 'Nyama choma Sunday', 'Grilled meat, kachumbari and a long, lazy afternoon of talking.', ARRAY['food']::text[], 'social', 'afternoon', 'food', NULL, 'ke', NULL, FALSE, FALSE, 2, FALSE, FALSE, NULL, 430),
  ('ke-cook', 'Cook pilau together', 'Pick up spices at the market and cook pilau the way your families make it.', ARRAY['cooking', 'food']::text[], 'quiet', 'evening', 'food', NULL, 'ke', NULL, FALSE, TRUE, 1, FALSE, FALSE, NULL, 440)
ON CONFLICT (id) DO NOTHING;
