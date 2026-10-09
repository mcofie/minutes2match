// Date ideas for a matched pair: a wide catalogue scored on what they share, where they live and how
// they like to spend time, trimmed to the three best (and varied) picks for the match brief.

export type Slot = 'afternoon' | 'evening' | 'night'
type Energy = 'quiet' | 'social' | 'any'
type Kind = 'food' | 'outdoors' | 'culture' | 'active' | 'nightlife' | 'cosy' | 'adventure'

export interface DateIdea {
  id: string
  title: string
  desc: string
  /** interest ids from the profile (music, food, art …) */
  tags: string[]
  energy: Energy
  slot: Slot
  kind: Kind
  /** only offered when the pair lives here */
  city?: 'accra' | 'nairobi'
  /** country-wide ideas (Ghana / Kenya) */
  country?: 'gh' | 'ke'
  /** where to go, shown under the idea */
  place?: string
  /** needs most of a day: best on a weekend */
  dayTrip?: boolean
  /** good for going deeper: marriage / serious intent */
  deep?: boolean
}

export const DATE_CATALOG: DateIdea[] = [
  // ---------- Anywhere ----------
  { id: 'cafe', title: 'Bookstore café afternoon', desc: 'Find a cosy corner, order something warm and swap book, show or podcast recommendations.', tags: ['reading', 'art', 'tech', 'entrepreneurship'], energy: 'quiet', slot: 'afternoon', kind: 'cosy', deep: true },
  { id: 'food-crawl', title: 'Food crawl', desc: 'Three stops: small chops, a main and dessert. Take turns choosing the spot.', tags: ['food', 'cooking', 'travel'], energy: 'social', slot: 'evening', kind: 'food' },
  { id: 'cook', title: 'Cook-off for two', desc: 'Pick a dish neither of you has made, shop for it together and cook it.', tags: ['cooking', 'food'], energy: 'quiet', slot: 'evening', kind: 'food', deep: true },
  { id: 'music', title: 'Live music night', desc: 'Find a live band and let the music do some of the talking.', tags: ['music', 'dancing'], energy: 'social', slot: 'night', kind: 'nightlife' },
  { id: 'dance', title: 'Beginner dance class', desc: 'Try a salsa or afrobeats class. Laughing at yourselves is half the fun.', tags: ['dancing', 'music', 'fitness'], energy: 'social', slot: 'evening', kind: 'active' },
  { id: 'gallery', title: 'Gallery hop', desc: 'Walk through a local exhibition, then debate your favourite piece over a drink.', tags: ['art', 'photography', 'fashion'], energy: 'any', slot: 'afternoon', kind: 'culture' },
  { id: 'picnic', title: 'Sunset picnic', desc: 'Pack snacks, find a spot with a view and watch the sun go down together.', tags: ['nature', 'photography', 'travel'], energy: 'quiet', slot: 'evening', kind: 'outdoors', deep: true },
  { id: 'movie', title: 'Movie, then a debrief', desc: 'Catch a film, then compare reviews over dessert.', tags: ['movies'], energy: 'quiet', slot: 'evening', kind: 'cosy' },
  { id: 'games', title: 'Board game café', desc: 'A little friendly competition is one of the easiest ways to break the ice.', tags: ['gaming', 'tech'], energy: 'any', slot: 'afternoon', kind: 'cosy' },
  { id: 'watch-match', title: 'Watch a match together', desc: 'Pick a game, find a lively spot and back opposite teams for fun.', tags: ['sports'], energy: 'social', slot: 'evening', kind: 'nightlife' },
  { id: 'dinner', title: 'Slow dinner with good questions', desc: 'Somewhere calm with good food. Take turns asking the questions you would not ask on an app.', tags: [], energy: 'any', slot: 'evening', kind: 'food', deep: true },
  { id: 'arcade', title: 'Arcade or bowling night', desc: 'Loser buys the ice cream. Keeps things light and lets your competitive sides out.', tags: ['gaming', 'sports'], energy: 'social', slot: 'evening', kind: 'active' },
  { id: 'paint', title: 'Paint and sip', desc: 'Nobody needs to be good at it. Swap canvases at the end and keep each other\'s.', tags: ['art'], energy: 'any', slot: 'evening', kind: 'culture' },
  { id: 'photo-walk', title: 'Photo walk', desc: 'Each of you shoots ten photos of the same streets, then compare who saw what.', tags: ['photography', 'travel', 'art'], energy: 'any', slot: 'afternoon', kind: 'outdoors' },
  { id: 'workout', title: 'Workout, then smoothies', desc: 'A gym class, run or court session together, then a smoothie and a proper chat.', tags: ['fitness', 'sports'], energy: 'any', slot: 'afternoon', kind: 'active' },
  { id: 'thrift', title: 'Thrift and style each other', desc: 'Set a small budget and pick an outfit for each other at a second-hand market.', tags: ['fashion'], energy: 'social', slot: 'afternoon', kind: 'culture' },
  { id: 'founders', title: 'Big-ideas coffee', desc: 'Bring one idea you would build if money were no object and pull each other\'s apart, kindly.', tags: ['entrepreneurship', 'tech'], energy: 'quiet', slot: 'afternoon', kind: 'cosy', deep: true },
  { id: 'karaoke', title: 'Karaoke night', desc: 'One duet is compulsory. Song choice says a lot about a person.', tags: ['music'], energy: 'social', slot: 'night', kind: 'nightlife' },
  { id: 'dessert', title: 'Dessert tasting', desc: 'Share three desserts at three places and crown a winner.', tags: ['food'], energy: 'any', slot: 'evening', kind: 'food' },

  // ---------- Accra ----------
  { id: 'acc-labadi', title: 'Sunset at Labadi Beach', desc: 'Walk the sand, grab a coconut and stay for the drummers as the sun goes down.', tags: ['nature', 'music', 'travel'], energy: 'social', slot: 'evening', kind: 'outdoors', city: 'accra', place: 'Labadi Beach' },
  { id: 'acc-jamestown', title: 'Jamestown walk', desc: 'See the lighthouse and the murals, watch the fishing boats come in, then eat nearby.', tags: ['photography', 'art', 'travel'], energy: 'any', slot: 'afternoon', kind: 'culture', city: 'accra', place: 'Jamestown' },
  { id: 'acc-oxford', title: 'Osu street food night', desc: 'Kelewele, khebab and a cold drink along Oxford Street, then wherever the music is.', tags: ['food', 'music'], energy: 'social', slot: 'night', kind: 'food', city: 'accra', place: 'Oxford Street, Osu' },
  { id: 'acc-aburi', title: 'Day trip to Aburi Gardens', desc: 'Cool air, old trees and a slow lunch in the hills. Leave early and take the scenic drive.', tags: ['nature', 'travel', 'photography'], energy: 'quiet', slot: 'afternoon', kind: 'adventure', city: 'accra', place: 'Aburi Botanical Gardens', dayTrip: true, deep: true },
  { id: 'acc-artscentre', title: 'Arts Centre craft market', desc: 'Browse kente, carvings and beads, and pick a small something for each other.', tags: ['art', 'fashion'], energy: 'social', slot: 'afternoon', kind: 'culture', city: 'accra', place: 'Centre for National Culture' },
  { id: 'acc-legon', title: 'Canopy walk at Legon Botanical Garden', desc: 'Walk among the treetops, then picnic on the lawns.', tags: ['nature', 'fitness'], energy: 'any', slot: 'afternoon', kind: 'outdoors', city: 'accra', place: 'Legon Botanical Garden' },
  { id: 'acc-jazz', title: 'Live highlife and jazz', desc: 'A table near the band, good food and old-school highlife. Easy to talk between sets.', tags: ['music', 'dancing'], energy: 'social', slot: 'night', kind: 'nightlife', city: 'accra', place: '+233 Jazz Bar & Grill' },
  { id: 'acc-gallery', title: 'Contemporary art at Gallery 1957', desc: 'Some of the best new Ghanaian art, then a drink close by to talk it through.', tags: ['art', 'photography', 'fashion'], energy: 'quiet', slot: 'afternoon', kind: 'culture', city: 'accra', place: 'Gallery 1957' },
  { id: 'acc-shai', title: 'Hike Shai Hills', desc: 'Baboons, caves and wide views about an hour out of town. Bring water and good shoes.', tags: ['nature', 'fitness', 'travel'], energy: 'any', slot: 'afternoon', kind: 'adventure', city: 'accra', place: 'Shai Hills Resource Reserve', dayTrip: true },
  { id: 'acc-bojo', title: 'Boat across to Bojo Beach', desc: 'A short canoe ride over the lagoon to a quieter beach. Spend the afternoon there.', tags: ['nature', 'travel'], energy: 'quiet', slot: 'afternoon', kind: 'outdoors', city: 'accra', place: 'Bojo Beach', dayTrip: true },
  { id: 'acc-nkrumah', title: 'History date at the Nkrumah Memorial', desc: 'Walk the park and museum, then talk about what independence-era Ghana means to you both.', tags: ['reading', 'travel'], energy: 'quiet', slot: 'afternoon', kind: 'culture', city: 'accra', place: 'Kwame Nkrumah Memorial Park', deep: true },

  // ---------- Ghana-wide ----------
  { id: 'gh-jollof', title: 'Settle the jollof debate', desc: 'Each of you makes (or buys) your best jollof and the other judges. Bragging rights only.', tags: ['cooking', 'food'], energy: 'quiet', slot: 'evening', kind: 'food', country: 'gh' },
  { id: 'gh-chopbar', title: 'Chop bar lunch', desc: 'Fufu and light soup at a proper local spot. Eat with your hands and no phones.', tags: ['food'], energy: 'any', slot: 'afternoon', kind: 'food', country: 'gh' },

  // ---------- Nairobi ----------
  { id: 'nbo-karura', title: 'Walk or bike Karura Forest', desc: 'Follow the trails to the waterfall and caves, then coffee at the forest café.', tags: ['nature', 'fitness', 'photography'], energy: 'any', slot: 'afternoon', kind: 'outdoors', city: 'nairobi', place: 'Karura Forest' },
  { id: 'nbo-giraffe', title: 'Feed the giraffes', desc: 'Get up close at the Giraffe Centre in Karen, then lunch somewhere leafy nearby.', tags: ['nature', 'photography', 'travel'], energy: 'any', slot: 'afternoon', kind: 'outdoors', city: 'nairobi', place: 'Giraffe Centre, Karen' },
  { id: 'nbo-park', title: 'Game drive in the city', desc: 'Lions and giraffes with skyscrapers behind them. Go early, then brunch after.', tags: ['nature', 'photography', 'travel'], energy: 'quiet', slot: 'afternoon', kind: 'adventure', city: 'nairobi', place: 'Nairobi National Park', dayTrip: true },
  { id: 'nbo-ngong', title: 'Hike the Ngong Hills', desc: 'Ridge walks with views over the Rift Valley. Pack snacks and stop at the top.', tags: ['fitness', 'nature', 'sports'], energy: 'any', slot: 'afternoon', kind: 'adventure', city: 'nairobi', place: 'Ngong Hills', dayTrip: true },
  { id: 'nbo-arboretum', title: 'Picnic at the Arboretum', desc: 'Shade, birdsong and a blanket. One of the calmest corners of the city.', tags: ['nature', 'reading'], energy: 'quiet', slot: 'afternoon', kind: 'outdoors', city: 'nairobi', place: 'Nairobi Arboretum', deep: true },
  { id: 'nbo-kicc', title: 'City views from KICC', desc: 'Go up to the rooftop for the skyline, then dinner in town.', tags: ['photography', 'travel'], energy: 'any', slot: 'evening', kind: 'culture', city: 'nairobi', place: 'KICC rooftop' },
  { id: 'nbo-westlands', title: 'Live music in Westlands', desc: 'Start with dinner, then find a band. There is always something on.', tags: ['music', 'dancing'], energy: 'social', slot: 'night', kind: 'nightlife', city: 'nairobi', place: 'Westlands' },
  { id: 'nbo-maasai', title: 'Maasai Market wander', desc: 'Beads, fabrics and baskets. Haggle as a team and pick one thing for each other.', tags: ['fashion', 'art'], energy: 'social', slot: 'afternoon', kind: 'culture', city: 'nairobi', place: 'Maasai Market' },
  { id: 'nbo-art', title: 'Art at Circle Art Gallery', desc: 'East African contemporary art and lots to talk about on the way out.', tags: ['art', 'photography'], energy: 'quiet', slot: 'afternoon', kind: 'culture', city: 'nairobi', place: 'Circle Art Gallery' },
  { id: 'nbo-naivasha', title: 'Cycle Hell\'s Gate', desc: 'Bike past zebras and gorges near Naivasha. A proper adventure for a full day out.', tags: ['fitness', 'nature', 'travel', 'sports'], energy: 'any', slot: 'afternoon', kind: 'adventure', city: 'nairobi', place: "Hell's Gate, Naivasha", dayTrip: true },

  // ---------- Kenya-wide ----------
  { id: 'ke-nyama', title: 'Nyama choma Sunday', desc: 'Grilled meat, kachumbari and a long, lazy afternoon of talking.', tags: ['food'], energy: 'social', slot: 'afternoon', kind: 'food', country: 'ke' },
  { id: 'ke-cook', title: 'Cook pilau together', desc: 'Pick up spices at the market and cook pilau the way your families make it.', tags: ['cooking', 'food'], energy: 'quiet', slot: 'evening', kind: 'food', country: 'ke', deep: true },
]

export interface DateIdeaInput {
  shared: string[]
  either: string[]
  /** "accra" | "nairobi" | other normalised city */
  city: string
  /** answer text by question key, for each person (v2/v3 keys included) */
  mine: Map<string, string>
  theirs: Map<string, string>
  intents: string[]
  /** both people's free time */
  windows: { day: string; slots: string[] }[]
  interestLabel: (id: string) => string
}

export interface PickedIdea extends DateIdea {
  why: string[]
  when: string
  where: string
}

const answerFor = (answers: Map<string, string>, base: string) => {
  for (const [k, v] of answers) if (k === base || k.startsWith(`${base}_v`)) return v.toLowerCase()
  return ''
}
const energyOf = (a: string): Energy => (/homebody|introvert/.test(a) ? 'quiet' : /extrovert|party/.test(a) ? 'social' : 'any')
const join = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`)
const COUNTRY_OF: Record<string, 'gh' | 'ke'> = { accra: 'gh', nairobi: 'ke' }
const CITY_NAME: Record<string, string> = { accra: 'Accra', nairobi: 'Nairobi' }
const isWeekend = (day: string) => /sat|sun/i.test(day)

export function pickDateIdeas(input: DateIdeaInput, count = 3): PickedIdea[] {
  const { shared, either, city, mine, theirs, intents, windows, interestLabel } = input
  const country = COUNTRY_OF[city]
  const e1 = energyOf(answerFor(mine, 'social_energy'))
  const e2 = energyOf(answerFor(theirs, 'social_energy'))
  const pairEnergy: Energy = e1 === e2 ? e1 : 'any'
  const love = `${answerFor(mine, 'love_language')} ${answerFor(theirs, 'love_language')}`
  const priorities = `${answerFor(mine, 'life_priority')} ${answerFor(theirs, 'life_priority')}`
  const wantsDeep = intents.some(i => i === 'marriage' || i === 'serious')
  const freeSlots = new Set(windows.flatMap(w => w.slots))
  const freeWeekend = windows.some(w => isWeekend(w.day))

  const pool = DATE_CATALOG.filter(d => (!d.city || d.city === city) && (!d.country || d.country === country))

  const scored = pool.map(idea => {
    let score = 0
    const why: string[] = []

    // 1. What they share
    const sharedHits = idea.tags.filter(t => shared.includes(t))
    const eitherHits = idea.tags.filter(t => either.includes(t) && !shared.includes(t))
    if (sharedHits.length) { score += 6 + 3 * (sharedHits.length - 1); why.push(`You both love ${join(sharedHits.slice(0, 2).map(interestLabel).map(s => s.toLowerCase()))}`) }
    else if (eitherHits.length) { score += 2; why.push(`Built around ${interestLabel(eitherHits[0]).toLowerCase()}`) }

    // 2. Where they live
    if (idea.city) { score += 4; why.push(`${/^[aeiou]/i.test(CITY_NAME[idea.city]) ? 'An' : 'A'} ${CITY_NAME[idea.city]} favourite`) }
    else if (idea.country) { score += 3; why.push(idea.country === 'gh' ? 'Made for a Ghanaian first date' : 'A proper Kenyan classic') }

    // 3. Everything else: energy, love language, intent, priorities and time
    if (pairEnergy !== 'any' && idea.energy === pairEnergy) { score += 3; why.push(pairEnergy === 'quiet' ? 'Suits two people who like it low-key' : 'Suits two people who love being out') }
    else if (pairEnergy !== 'any' && idea.energy !== 'any') score -= 2
    if (love.includes('quality time') && idea.energy === 'quiet') { score += 1.5; why.push('Plenty of one-on-one time') }
    if (love.includes('acts of service') && (idea.id.includes('cook') || idea.id.includes('jollof'))) { score += 2; why.push('Doing something for each other') }
    if (love.includes('receiving gifts') && /market|thrift|artscentre|maasai|paint/.test(idea.id)) { score += 2; why.push('Room for a small gift') }
    if (love.includes('physical touch') && (idea.id.includes('dance') || idea.id === 'acc-bojo')) { score += 1.5 }
    if (wantsDeep && idea.deep) { score += 2; why.push('Calm enough to really talk') }
    if (priorities.includes('travel') && (idea.kind === 'adventure' || idea.tags.includes('travel'))) score += 1.5
    if (priorities.includes('career') && idea.id === 'founders') score += 2
    if (windows.length) {
      if (freeSlots.has(idea.slot)) score += 1.5
      if (idea.dayTrip && !freeWeekend) score -= 5
    }
    if (idea.id === 'dinner') score += 0.5 // a safe fallback when little else is known

    return { ...idea, score, why }
  }).sort((a, b) => b.score - a.score)

  // Pick the best, but keep them varied: no two of the same kind, at most two local spots
  // (so there's room for a shared-interest idea that works anywhere), and at least one local when we know the city
  const isLocal = (d: DateIdea) => !!(d.city || d.country)
  const picked: typeof scored = []
  const fits = (idea: DateIdea, strictKind: boolean) =>
    !picked.includes(idea as any) &&
    !(strictKind && picked.some(p => p.kind === idea.kind)) &&
    !(isLocal(idea) && picked.filter(isLocal).length >= Math.max(1, count - 1))
  for (const strict of [true, false]) {
    for (const idea of scored) {
      if (picked.length >= count) break
      if (fits(idea, strict)) picked.push(idea)
    }
  }
  for (const idea of scored) {
    if (picked.length >= count) break
    if (!picked.includes(idea)) picked.push(idea)
  }
  const hasLocal = picked.some(p => p.city || p.country)
  const bestLocal = scored.find(s => (s.city || s.country) && !picked.includes(s))
  if (!hasLocal && bestLocal && picked.length) picked[picked.length - 1] = bestLocal

  // Suggest a time from their overlap: weekends for day trips, otherwise the idea's time of day
  const whenFor = (idea: DateIdea) => {
    const options = idea.dayTrip ? windows.filter(w => isWeekend(w.day)) : windows
    const w = options.find(x => x.slots.includes(idea.slot)) || options[0] || (idea.dayTrip ? undefined : windows[0])
    if (!w) return idea.dayTrip ? 'A free weekend day' : ''
    const s = w.slots.includes(idea.slot) ? idea.slot : w.slots[0]
    const day = /^weekdays$/i.test(w.day) ? 'A weekday' : w.day
    return `${day} ${s}`.toLowerCase().replace(/^\w/, c => c.toUpperCase())
  }

  return picked.map(idea => ({
    ...idea,
    why: (idea.why.length ? idea.why : ['An easy, low-pressure way to meet']).slice(0, 2),
    when: whenFor(idea),
    where: idea.place ? (idea.city ? `${idea.place}, ${CITY_NAME[idea.city]}` : idea.place) : (CITY_NAME[city] || ''),
  }))
}
