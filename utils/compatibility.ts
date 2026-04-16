/**
 * Shared Compatibility Scoring Engine
 *
 * Pure scoring utilities used by client/admin views and server-side match creation.
 */

export interface VibeAnswer {
  question_key: string
  answer: string
}

export interface UserProfile {
  id: string
  gender: 'male' | 'female'
  interested_in: 'male' | 'female' | 'everyone'
  intent: string
  location: string
  religion?: string
  genotype?: string
  birth_date?: string
  dating_persona?: string
  occupation?: string
  badges?: string[]
  dealbreakers?: string[]
  min_age?: number
  max_age?: number
  preferences_extracted?: {
    seeking: {
      attributes: string[]
      dealbreakers: string[]
      lifestyle: string[]
    }
    self: {
      personality: string[]
      values: string[]
      lifestyle: string[]
    }
  }
}

export type CompatibilitySignalCategory = 'hard_block' | 'soft_risk' | 'watchout' | 'difference_not_bad'

export interface CompatibilitySignal {
  category: CompatibilitySignalCategory
  message: string
}

export interface CompatibilityResult {
  score: number
  confidence: number
  missingData: string[]
  breakdown: {
    vibeMatch: number
    goalsMatch: number
    lifestyleMatch: number
    maturityMatch: number
    interestMatch: number
    aiSynergy?: number
  }
  strengths: string[]
  warnings: string[]
  eligibility: {
    eligible: boolean
    hardBlockers: string[]
    softRisks: string[]
    watchouts: string[]
    differences: string[]
  }
  signals: CompatibilitySignal[]
}

const COMPATIBILITY_MAP: Record<string, Record<string, string[]>> = {
  love_language: {
    'Words of Affirmation - Tell me you love me 💬': ['Words of Affirmation - Tell me you love me 💬', 'Quality Time - Give me your undivided attention ⏰'],
    'Acts of Service - Do things for me 🛠️': ['Acts of Service - Do things for me 🛠️', 'Quality Time - Give me your undivided attention ⏰'],
    'Receiving Gifts - Surprise me with something 🎁': ['Receiving Gifts - Surprise me with something 🎁', 'Acts of Service - Do things for me 🛠️'],
    'Quality Time - Give me your undivided attention ⏰': ['Quality Time - Give me your undivided attention ⏰', 'Words of Affirmation - Tell me you love me 💬', 'Physical Touch - Hold me, hug me 🫂'],
    'Physical Touch - Hold me, hug me 🫂': ['Physical Touch - Hold me, hug me 🫂', 'Quality Time - Give me your undivided attention ⏰']
  },
  conflict_style: {
    'Talk it out immediately - Let\'s resolve this now 🗣️': ['Talk it out immediately - Let\'s resolve this now 🗣️', 'Find a quick compromise - Let\'s meet in the middle 🤝'],
    'Take space first - I need time to process 🧘': ['Take space first - I need time to process 🧘', 'Write it out - Texting is easier 📝'],
    'Find a quick compromise - Let\'s meet in the middle 🤝': ['Find a quick compromise - Let\'s meet in the middle 🤝', 'Talk it out immediately - Let\'s resolve this now 🗣️'],
    'Avoid confrontation - It\'ll blow over 😶': ['Avoid confrontation - It\'ll blow over 😶', 'Take space first - I need time to process 🧘'],
    'Write it out - Texting is easier 📝': ['Write it out - Texting is easier 📝', 'Take space first - I need time to process 🧘']
  },
  social_energy: {
    'Full homebody - My couch is my bestie 🛋️': ['Full homebody - My couch is my bestie 🛋️', 'Mostly introverted - Small gatherings only 🏠'],
    'Mostly introverted - Small gatherings only 🏠': ['Mostly introverted - Small gatherings only 🏠', 'Balanced - Depends on my mood ⚖️', 'Full homebody - My couch is my bestie 🛋️'],
    'Balanced - Depends on my mood ⚖️': ['Balanced - Depends on my mood ⚖️', 'Mostly introverted - Small gatherings only 🏠', 'Mostly extroverted - I love being out 🌟'],
    'Mostly extroverted - I love being out 🌟': ['Mostly extroverted - I love being out 🌟', 'Balanced - Depends on my mood ⚖️', 'Life of the party - Where\'s the next event? 🦋'],
    'Life of the party - Where\'s the next event? 🦋': ['Life of the party - Where\'s the next event? 🦋', 'Mostly extroverted - I love being out 🌟']
  },
  life_priority: {
    'Building my career and wealth 💼': ['Building my career and wealth 💼', 'Making an impact in my community 🌱'],
    'Starting or growing a family 👨‍👩‍👧': ['Starting or growing a family 👨‍👩‍👧', 'Finding inner peace and balance 🧘'],
    'Traveling and experiencing life 🌍': ['Traveling and experiencing life 🌍', 'Finding inner peace and balance 🧘'],
    'Finding inner peace and balance 🧘': ['Finding inner peace and balance 🧘', 'Starting or growing a family 👨‍👩‍👧', 'Traveling and experiencing life 🌍'],
    'Making an impact in my community 🌱': ['Making an impact in my community 🌱', 'Building my career and wealth 💼', 'Finding inner peace and balance 🧘']
  }
}

const DIMENSIONS_TO_CHECK = [
  { dim: 'love_language', weight: 10, missingKey: 'love language' },
  { dim: 'communication', weight: 5, missingKey: 'communication style' },
  { dim: 'life_goals', weight: 12, missingKey: 'life goals' },
  { dim: 'social', weight: 8, missingKey: 'social energy' },
  { dim: 'pace', weight: 5, missingKey: 'relationship pace' }
]

const LEGACY_DIMENSION_KEYS: Record<string, string> = {
  communication: 'conflict_style',
  life_goals: 'life_priority',
  social: 'social_energy',
  pace: 'relationship_pace'
}

const hasGenotypeRisk = (g1: string, g2: string) => {
  const riskTraits = ['AS', 'SS', 'AC', 'SC']
  if (!riskTraits.includes(g1) || !riskTraits.includes(g2)) return false
  if (g1 === 'SS' || g2 === 'SS') return true
  return true
}

const addSignal = (signals: CompatibilitySignal[], category: CompatibilitySignalCategory, message: string) => {
  if (!signals.some(signal => signal.category === category && signal.message === message)) {
    signals.push({ category, message })
  }
}

export const calculateAge = (birthDate: string): number => {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

export const checkAgeViolation = (user: UserProfile, actualAge: number) => {
  if (user.min_age && actualAge < user.min_age) return true
  if (user.max_age && actualAge > user.max_age) return true
  return false
}

export const isCompatibleProfession = (p1: string, p2: string) => {
  const technology = ['tech', 'software', 'dev', 'engineer', 'it', 'cyber']
  const legalFinance = ['law', 'fin', 'bank', 'acc', 'analyst', 'audit']
  const health = ['med', 'nurse', 'doc', 'pharm']

  const check = (list: string[]) => list.some(k => p1.includes(k)) && list.some(k => p2.includes(k))
  return check(technology) || check(legalFinance) || check(health)
}

const getMissingData = (
  u1: UserProfile,
  ans1List: VibeAnswer[],
  u2: UserProfile,
  ans2List: VibeAnswer[],
  dims1: Map<string, string>,
  dims2: Map<string, string>
) => {
  const missing = new Set<string>()

  if (!u1.intent || !u2.intent) missing.add('relationship intent')
  if (!u1.birth_date || !u2.birth_date) missing.add('birth date')
  if (!u1.location || !u2.location) missing.add('location')
  if (!u1.dating_persona || !u2.dating_persona) missing.add('dating persona')
  if (!u1.occupation || !u2.occupation) missing.add('occupation')
  if (!Array.isArray(u1.badges) || !u1.badges.length || !Array.isArray(u2.badges) || !u2.badges.length) missing.add('interest badges')
  if (!u1.preferences_extracted || !u2.preferences_extracted) missing.add('AI preference extraction')
  if (!ans1List.length || !ans2List.length) missing.add('vibe answers')

  for (const dimension of DIMENSIONS_TO_CHECK) {
    if (!dims1.get(dimension.dim) || !dims2.get(dimension.dim)) {
      missing.add(dimension.missingKey)
    }
  }

  return Array.from(missing)
}

const calculateConfidence = (missingData: string[], u1: UserProfile, ans1List: VibeAnswer[], u2: UserProfile, ans2List: VibeAnswer[]) => {
  let confidence = 100
  confidence -= missingData.length * 8

  if (ans1List.length < 3 || ans2List.length < 3) confidence -= 12
  if (!u1.preferences_extracted || !u2.preferences_extracted) confidence -= 10
  if (!u1.birth_date || !u2.birth_date) confidence -= 10
  if (!u1.intent || !u2.intent) confidence -= 8

  return Math.max(30, Math.min(100, confidence))
}

export const calculateCompatibility = (
  u1: UserProfile,
  ans1List: VibeAnswer[],
  u2: UserProfile,
  ans2List: VibeAnswer[]
): CompatibilityResult => {
  const strengths: string[] = []
  const signals: CompatibilitySignal[] = []
  const breakdown = { vibeMatch: 0, goalsMatch: 0, lifestyleMatch: 0, maturityMatch: 0, interestMatch: 0, aiSynergy: 0 }
  let malus = 0

  const u1InterestedInU2 = !u1.interested_in || u1.interested_in === 'everyone' || u1.interested_in === u2.gender
  const u2InterestedInU1 = !u2.interested_in || u2.interested_in === 'everyone' || u2.interested_in === u1.gender

  if (!u1InterestedInU2 || !u2InterestedInU1) {
    return {
      score: 0,
      confidence: 100,
      missingData: [],
      breakdown,
      strengths: [],
      warnings: ['Gender Preference Mismatch'],
      eligibility: {
        eligible: false,
        hardBlockers: ['Gender Preference Mismatch'],
        softRisks: [],
        watchouts: [],
        differences: []
      },
      signals: [{ category: 'hard_block', message: 'Gender Preference Mismatch' }]
    }
  }

  const answers1 = new Map(ans1List.map(a => [a.question_key, a.answer]))
  const answers2 = new Map(ans2List.map(a => [a.question_key, a.answer]))
  const dims1 = new Map((ans1List as any[]).map(a => [a.dimension || a.question_key, a.answer]))
  const dims2 = new Map((ans2List as any[]).map(a => [a.dimension || a.question_key, a.answer]))
  const missingData = getMissingData(u1, ans1List, u2, ans2List, dims1, dims2)

  let vibePoints = 0
  let maxVibeWeight = 0

  for (const { dim, weight } of DIMENSIONS_TO_CHECK) {
    const legacyKey = LEGACY_DIMENSION_KEYS[dim] || dim
    const a1 = dims1.get(dim) || answers1.get(legacyKey)
    const a2 = dims2.get(dim) || answers2.get(legacyKey)

    if (!a1 || !a2) continue

    maxVibeWeight += weight
    if (a1 === a2) vibePoints += weight
    else if (COMPATIBILITY_MAP[dim]?.[a1]?.includes(a2) || COMPATIBILITY_MAP[legacyKey]?.[a1]?.includes(a2)) {
      vibePoints += weight * 0.5
      addSignal(signals, 'difference_not_bad', `${dim.replace('_', ' ')} is complementary rather than identical`)
    } else {
      addSignal(signals, 'watchout', `${dim.replace('_', ' ')} may require more work`)
    }
  }

  breakdown.vibeMatch = maxVibeWeight > 0 ? Math.round((vibePoints / maxVibeWeight) * 40) : 0
  if (breakdown.vibeMatch > 32) strengths.push('Deep Vibe Alignment ✨')

  if (u1.intent && u2.intent) {
    if (u1.intent === u2.intent) {
      breakdown.goalsMatch += 12
      strengths.push('Shared Lifecycle Intent 💍')
    } else if (
      (u1.intent === 'marriage' && u2.intent === 'serious') ||
      (u1.intent === 'serious' && u2.intent === 'marriage')
    ) {
      breakdown.goalsMatch += 7
      strengths.push('Long-term Intent Alignment')
      addSignal(signals, 'difference_not_bad', 'Intent timing is adjacent, not identical')
    } else {
      malus += 10
      addSignal(signals, 'soft_risk', 'Conflict in relationship goals')
    }
  }

  if (u1.religion && u2.religion && u1.religion === u2.religion) {
    breakdown.goalsMatch += 8
    strengths.push('Shared Belief System 🙏')
  }

  if (u1.dating_persona && u2.dating_persona) {
    breakdown.lifestyleMatch += u1.dating_persona === u2.dating_persona ? 10 : 5
    if (u1.dating_persona !== u2.dating_persona) {
      addSignal(signals, 'difference_not_bad', 'Different personas may still complement each other')
    }
  }

  if (u1.occupation && u2.occupation) {
    const occ1 = u1.occupation.toLowerCase()
    const occ2 = u2.occupation.toLowerCase()
    if (occ1 === occ2) {
      breakdown.lifestyleMatch += 5
      strengths.push('Same professional world 💼')
    } else if (isCompatibleProfession(occ1, occ2)) {
      breakdown.lifestyleMatch += 3
      strengths.push('Career Synergy')
    }
  }

  if (u1.location && u2.location) {
    if (u1.location === u2.location) {
      breakdown.lifestyleMatch += 5
      strengths.push(`Local Connection (${u1.location}) 📍`)
    } else {
      addSignal(signals, 'watchout', 'Different locations may add logistics friction')
    }
  }

  if (u1.birth_date && u2.birth_date) {
    const age1 = calculateAge(u1.birth_date)
    const age2 = calculateAge(u2.birth_date)
    const ageGap = Math.abs(age1 - age2)

    if (ageGap <= 3) breakdown.maturityMatch += 10
    else if (ageGap <= 6) breakdown.maturityMatch += 8
    else if (ageGap <= 10) breakdown.maturityMatch += 6
    else if (ageGap <= 15) breakdown.maturityMatch += 3

    if (checkAgeViolation(u1, age2) || checkAgeViolation(u2, age1)) {
      malus += 20
      addSignal(signals, 'hard_block', 'Outside preferred age range')
    } else if (ageGap > 12) {
      malus += 8
      addSignal(signals, 'soft_risk', 'Significant age gap')
    }
  }

  const b1 = Array.isArray(u1.badges) ? u1.badges : []
  const b2 = Array.isArray(u2.badges) ? u2.badges : []
  if (b1.length && b2.length) {
    const common = b1.filter(b => b2.includes(b))
    if (common.length >= 3) {
      breakdown.interestMatch = 10
      strengths.push('Numerous shared hobbies 🎨')
    } else if (common.length >= 1) {
      breakdown.interestMatch = 5
    } else {
      addSignal(signals, 'watchout', 'Few shared interest badges on record')
    }
  }

  if (u1.genotype && u2.genotype && hasGenotypeRisk(u1.genotype, u2.genotype)) {
    malus += 80
    addSignal(signals, 'hard_block', '⚠️ Critical Genotype Incompatibility')
  }

  const db1 = Array.isArray(u1.dealbreakers) ? u1.dealbreakers : []
  const db2 = Array.isArray(u2.dealbreakers) ? u2.dealbreakers : []
  if (db1.length && b2.length && db1.some(d => b2.includes(d))) {
    malus += 50
    addSignal(signals, 'hard_block', 'Matched User A\'s dealbreaker')
  }
  if (db2.length && b1.length && db2.some(d => b1.includes(d))) {
    malus += 50
    addSignal(signals, 'hard_block', 'Matched User B\'s dealbreaker')
  }

  if (u1.preferences_extracted && u2.preferences_extracted) {
    const p1 = u1.preferences_extracted
    const p2 = u2.preferences_extracted

    const match1 = (p1.seeking?.attributes || []).filter(a =>
      (p2.self?.personality || []).concat(p2.self?.lifestyle || []).some(s => s.toLowerCase().includes(a.toLowerCase()))
    ).length
    const match2 = (p2.seeking?.attributes || []).filter(a =>
      (p1.self?.personality || []).concat(p1.self?.lifestyle || []).some(s => s.toLowerCase().includes(a.toLowerCase()))
    ).length

    breakdown.aiSynergy = Math.min(10, (match1 + match2) * 2)
    if ((breakdown.aiSynergy || 0) >= 6) strengths.push('Bio Personalities Match ✨')

    const aiDealbreakers1 = p1.seeking?.dealbreakers || []
    const aiDealbreakers2 = p2.seeking?.dealbreakers || []
    const p1Self = (p1.self?.personality || []).concat(p1.self?.lifestyle || []).concat(p1.self?.values || []).map(s => s.toLowerCase())
    const p2Self = (p2.self?.personality || []).concat(p2.self?.lifestyle || []).concat(p2.self?.values || []).map(s => s.toLowerCase())

    if (aiDealbreakers1.some(d => p2Self.some(s => s.includes(d.toLowerCase())))) {
      malus += 20
      addSignal(signals, 'soft_risk', 'Bio-detected mismatch')
    }
    if (aiDealbreakers2.some(d => p1Self.some(s => s.includes(d.toLowerCase())))) {
      malus += 20
      addSignal(signals, 'soft_risk', 'Partner bio mismatch')
    }
  }

  const rawScore =
    breakdown.vibeMatch +
    breakdown.goalsMatch +
    breakdown.lifestyleMatch +
    breakdown.maturityMatch +
    breakdown.interestMatch +
    (breakdown.aiSynergy || 0)

  const finalScore = Math.max(0, Math.min(100, Math.round(rawScore - malus)))
  const confidence = calculateConfidence(missingData, u1, ans1List, u2, ans2List)
  const hardBlockers = signals.filter(signal => signal.category === 'hard_block').map(signal => signal.message)
  const softRisks = signals.filter(signal => signal.category === 'soft_risk').map(signal => signal.message)
  const watchouts = signals.filter(signal => signal.category === 'watchout').map(signal => signal.message)
  const differences = signals.filter(signal => signal.category === 'difference_not_bad').map(signal => signal.message)
  const warnings = Array.from(new Set([...hardBlockers, ...softRisks, ...watchouts])).slice(0, 3)

  return {
    score: finalScore,
    confidence,
    missingData,
    breakdown,
    strengths: strengths.slice(0, 5),
    warnings,
    eligibility: {
      eligible: hardBlockers.length === 0,
      hardBlockers,
      softRisks,
      watchouts,
      differences
    },
    signals
  }
}

export const getCompatibilityTier = (score: number) => {
  if (score >= 90) return { tier: 'Divine Connection', emoji: '✨', color: 'text-pink-600' }
  if (score >= 80) return { tier: 'High Affinity', emoji: '🔥', color: 'text-rose-500' }
  if (score >= 70) return { tier: 'Strong Potential', emoji: '🌟', color: 'text-orange-500' }
  if (score >= 60) return { tier: 'Good Alignment', emoji: '👍', color: 'text-blue-500' }
  if (score >= 50) return { tier: 'Explorable', emoji: '🤝', color: 'text-stone-500' }
  return { tier: 'Challenging Match', emoji: '⚠️', color: 'text-stone-400' }
}
