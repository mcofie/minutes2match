/**
 * Vibe Check v2: question metadata shared by the Vibe Check, the compatibility
 * scorer and the match brief.
 *
 * The prompts live in m2m.questions (see migration 070); this file mirrors them so
 * scoring and storytelling work even if the table is unreachable.
 *
 * Questions are grouped into four chapters so a match brief (and, later, a
 * city-wide "State of Dating" report) can tell a story:
 *   What you want · How you relate · How you live · What you believe
 */

export type VibeChapter = 'want' | 'relate' | 'live' | 'believe'

export const VIBE_CHAPTERS: { id: VibeChapter; title: string; blurb: string }[] = [
  { id: 'want', title: 'What you want', blurb: 'Family, timing and the life you are building.' },
  { id: 'relate', title: 'How you relate', blurb: 'Love, closeness, conflict and family.' },
  { id: 'live', title: 'How you live', blurb: 'Money, energy and everyday habits.' },
  { id: 'believe', title: 'What you believe', blurb: 'Faith and roles in a relationship.' },
]

export interface ScaleQuestion {
  key: string
  question: string
  /** Short label used in briefs and reports, e.g. "Kids" */
  label: string
  minLabel: string
  maxLabel: string
  chapter: VibeChapter
  /** Relative importance in the vibe score */
  weight: number
}

/** 1–7 statements. 1 and 7 are labelled in the person's own voice. */
export const SCALE_QUESTIONS: ScaleQuestion[] = [
  { key: 'v2_kids', question: 'Having children is part of the life I want.', label: 'Kids', minLabel: 'Not for me', maxLabel: "It's my dream", chapter: 'want', weight: 12 },
  { key: 'v2_marriage_timeline', question: "I'd like to be married within the next three years.", label: 'Marriage timeline', minLabel: 'No rush', maxLabel: 'Yes, soon', chapter: 'want', weight: 8 },
  { key: 'v2_relocate', question: "For the right person, I'd move to another city or country.", label: 'Moving for love', minLabel: "I'm rooted here", maxLabel: "I'd go anywhere", chapter: 'want', weight: 4 },
  { key: 'v2_contact', question: 'I like to hear from my partner throughout the day.', label: 'Staying in touch', minLabel: 'I need my space', maxLabel: 'Constant contact', chapter: 'relate', weight: 6 },
  { key: 'v2_growth', question: 'My partner should push me to become a better person.', label: 'Growing together', minLabel: 'Accept me as I am', maxLabel: 'Challenge me', chapter: 'relate', weight: 4 },
  { key: 'v2_family_say', question: 'My family will have a real say in who I marry.', label: "Family's say", minLabel: 'My decision alone', maxLabel: 'Family comes first', chapter: 'relate', weight: 6 },
  { key: 'v2_money', question: "I'd rather save for the future than spend on enjoying today.", label: 'Money', minLabel: 'Enjoy it now', maxLabel: 'Build the nest egg', chapter: 'live', weight: 6 },
  { key: 'v2_drinking', question: "I'm comfortable with my partner drinking alcohol.", label: 'Drinking', minLabel: 'Not at all', maxLabel: 'Cheers to that', chapter: 'live', weight: 6 },
  { key: 'v2_faith', question: 'Faith is central to my daily life.', label: 'Faith', minLabel: 'Private or not religious', maxLabel: 'It guides everything', chapter: 'believe', weight: 10 },
  { key: 'v2_roles', question: 'Traditional roles have a place in my relationship.', label: 'Traditional roles', minLabel: 'Not at all', maxLabel: 'Very much so', chapter: 'believe', weight: 6 },
]

export const VALUES_KEY = 'v2_core_values'
export const VALUES_PICK = 5
export const VALUES_QUESTION = {
  key: VALUES_KEY,
  question: 'Pick the 5 values that matter most to you in a partner.',
  label: 'Core values',
  chapter: 'relate' as VibeChapter,
  weight: 10,
  options: [
    'Kind 💛', 'Loyal 🤝', 'Honest 🫶', 'God-fearing 🙏', 'Family-oriented 👨‍👩‍👧', 'Ambitious 🚀', 'Hardworking 💪',
    'Respectful 🎩', 'Funny 😂', 'Intelligent 🧠', 'Patient 🌿', 'Generous 🎁', 'Romantic 🌹', 'Adventurous 🧭', 'Calm 🧘',
  ],
}

/** Existing core questions (kept so current members' answers still match), mapped into chapters */
export const LEGACY_DIMENSION_CHAPTER: Record<string, VibeChapter> = {
  life_goals: 'want',
  pace: 'want',
  love_language: 'relate',
  communication: 'relate',
  social: 'live',
}

export const LEGACY_KEY_LABELS: Record<string, string> = {
  love_language: 'How you feel loved',
  conflict_style: 'When you disagree',
  social_energy: 'Social energy',
  life_priority: 'Biggest priority in 5 years',
  relationship_pace: 'Relationship pace',
}

const LEGACY_KEY_CHAPTER: Record<string, VibeChapter> = {
  love_language: 'relate',
  conflict_style: 'relate',
  social_energy: 'live',
  life_priority: 'want',
  relationship_pace: 'want',
}

export const getScaleQuestion = (key: string) => SCALE_QUESTIONS.find(q => q.key === key)

/** Pooled variants (love_language_v2 …) share their base key's label and chapter */
const baseKey = (key: string) => key.replace(/_v\d+$/, '')

export const chapterForKey = (key: string): VibeChapter | undefined =>
  getScaleQuestion(key)?.chapter ?? (key === VALUES_KEY ? VALUES_QUESTION.chapter : LEGACY_KEY_CHAPTER[baseKey(key)])

export const labelForKey = (key: string) =>
  getScaleQuestion(key)?.label ?? LEGACY_KEY_LABELS[baseKey(key)] ?? key.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())

/** Values answers are stored as a JSON array string in vibe_answers.answer_value */
export const parseValuesAnswer = (raw: unknown): string[] => {
  if (Array.isArray(raw)) return raw.map(String)
  if (typeof raw !== 'string' || !raw.trim()) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

export const parseScaleAnswer = (raw: unknown): number | null => {
  const n = Number(raw)
  return Number.isInteger(n) && n >= 1 && n <= 7 ? n : null
}

/** How two 1–7 answers relate: 0–1 apart is in sync, 2–3 is close, 4+ is far apart */
export const scaleRelation = (a: number, b: number): 'same' | 'complementary' | 'different' => {
  const d = Math.abs(a - b)
  return d <= 1 ? 'same' : d <= 3 ? 'complementary' : 'different'
}
