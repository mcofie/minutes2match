import test from 'node:test'
import assert from 'node:assert/strict'

import { calculateCompatibility } from '../utils/compatibility.ts'

const richAnswersA = [
  { question_key: 'love_language', answer: 'Quality Time - Give me your undivided attention ⏰' },
  { question_key: 'conflict_style', answer: 'Talk it out immediately - Let\'s resolve this now 🗣️' },
  { question_key: 'life_priority', answer: 'Starting or growing a family 👨‍👩‍👧' },
  { question_key: 'social_energy', answer: 'Balanced - Depends on my mood ⚖️' },
  { question_key: 'relationship_pace', answer: 'Steady and intentional' }
]

const richAnswersB = [
  { question_key: 'love_language', answer: 'Physical Touch - Hold me, hug me 🫂' },
  { question_key: 'conflict_style', answer: 'Find a quick compromise - Let\'s meet in the middle 🤝' },
  { question_key: 'life_priority', answer: 'Starting or growing a family 👨‍👩‍👧' },
  { question_key: 'social_energy', answer: 'Mostly extroverted - I love being out 🌟' },
  { question_key: 'relationship_pace', answer: 'Steady and intentional' }
]

const buildProfile = (overrides = {}) => ({
  id: 'u1',
  gender: 'male',
  interested_in: 'female',
  intent: 'serious',
  location: 'Accra',
  religion: 'Christian',
  genotype: 'AA',
  birth_date: '1994-02-14',
  dating_persona: 'romantic',
  occupation: 'software engineer',
  badges: ['music', 'travel', 'faith', 'books'],
  dealbreakers: [],
  min_age: 24,
  max_age: 36,
  preferences_extracted: {
    seeking: {
      attributes: ['kind', 'intentional'],
      dealbreakers: [],
      lifestyle: ['faith']
    },
    self: {
      personality: ['kind', 'thoughtful'],
      values: ['faith', 'family'],
      lifestyle: ['intentional', 'active']
    }
  },
  ...overrides
})

test('aligned pair stays eligible with a strong score and high confidence', () => {
  const userA = buildProfile({ id: 'user-a' })
  const userB = buildProfile({
    id: 'user-b',
    gender: 'female',
    interested_in: 'male',
    birth_date: '1996-07-11',
    dating_persona: 'romantic',
    occupation: 'software analyst',
    preferences_extracted: {
      seeking: {
        attributes: ['kind', 'thoughtful'],
        dealbreakers: [],
        lifestyle: ['faith']
      },
      self: {
        personality: ['kind', 'intentional'],
        values: ['faith', 'family'],
        lifestyle: ['active', 'grounded']
      }
    }
  })

  const result = calculateCompatibility(userA, richAnswersA, userB, richAnswersB)

  assert.equal(result.eligibility.eligible, true)
  assert.ok(result.score >= 70, `expected a strong score, got ${result.score}`)
  assert.ok(result.confidence >= 65, `expected solid confidence, got ${result.confidence}`)
  assert.equal(result.eligibility.hardBlockers.length, 0)
})

test('gender preference mismatch hard-blocks the pair immediately', () => {
  const userA = buildProfile({ id: 'user-a', interested_in: 'female' })
  const userB = buildProfile({
    id: 'user-b',
    gender: 'male',
    interested_in: 'female'
  })

  const result = calculateCompatibility(userA, richAnswersA, userB, richAnswersB)

  assert.equal(result.score, 0)
  assert.equal(result.eligibility.eligible, false)
  assert.ok(result.eligibility.hardBlockers.includes('Gender Preference Mismatch'))
})

test('critical genotype risk blocks an otherwise promising match', () => {
  const userA = buildProfile({ id: 'user-a', genotype: 'AS' })
  const userB = buildProfile({
    id: 'user-b',
    gender: 'female',
    interested_in: 'male',
    genotype: 'AS'
  })

  const result = calculateCompatibility(userA, richAnswersA, userB, richAnswersB)

  assert.equal(result.eligibility.eligible, false)
  assert.ok(result.eligibility.hardBlockers.includes('⚠️ Critical Genotype Incompatibility'))
})

test('outside preferred age range is treated as a blocker, not just a lower rank', () => {
  const userA = buildProfile({ id: 'user-a', min_age: 24, max_age: 30 })
  const userB = buildProfile({
    id: 'user-b',
    gender: 'female',
    interested_in: 'male',
    birth_date: '1980-01-05'
  })

  const result = calculateCompatibility(userA, richAnswersA, userB, richAnswersB)

  assert.equal(result.eligibility.eligible, false)
  assert.ok(result.eligibility.hardBlockers.includes('Outside preferred age range'))
})

test('different short-term intents are a soft risk, not a blocker', () => {
  const userA = buildProfile({ id: 'user-a', intent: 'casual' })
  const userB = buildProfile({
    id: 'user-b',
    gender: 'female',
    interested_in: 'male',
    intent: 'friendship'
  })

  const result = calculateCompatibility(userA, richAnswersA, userB, richAnswersB)

  assert.equal(result.eligibility.eligible, true)
  assert.ok(result.eligibility.softRisks.includes('Conflict in relationship goals'))
})

test('long-term and short-term intents never match', () => {
  const userA = buildProfile({ id: 'user-a', intent: 'marriage' })
  const userB = buildProfile({ id: 'user-b', gender: 'female', interested_in: 'male', intent: 'casual' })

  const result = calculateCompatibility(userA, richAnswersA, userB, richAnswersB)

  assert.equal(result.eligibility.eligible, false)
  assert.ok(result.eligibility.hardBlockers.includes('One wants something long-term, the other does not'))
})

test('sparse profiles reduce confidence and surface missing data', () => {
  const richUser = buildProfile({ id: 'rich-user' })
  const sparseUser = buildProfile({
    id: 'sparse-user',
    gender: 'female',
    interested_in: 'male',
    birth_date: undefined,
    location: '',
    occupation: '',
    dating_persona: undefined,
    badges: [],
    preferences_extracted: undefined
  })

  const richResult = calculateCompatibility(
    richUser,
    richAnswersA,
    buildProfile({ id: 'rich-user-b', gender: 'female', interested_in: 'male', birth_date: '1995-06-02' }),
    richAnswersB
  )

  const sparseResult = calculateCompatibility(richUser, richAnswersA, sparseUser, [])

  assert.ok(sparseResult.confidence < richResult.confidence)
  assert.ok(sparseResult.missingData.includes('birth date'))
  assert.ok(sparseResult.missingData.includes('vibe answers'))
})

test('the same faith matches however it is written', () => {
  const userA = buildProfile({ id: 'user-a', religion: 'Christianity' })
  const userB = buildProfile({ id: 'user-b', gender: 'female', interested_in: 'male', religion: 'christian ' })
  const result = calculateCompatibility(userA, richAnswersA, userB, richAnswersB)
  assert.ok(result.strengths.includes('Shared Belief System 🙏'))
})

test('job fields match on whole words only', async () => {
  const { isCompatibleProfession } = await import('../utils/compatibility.ts')
  assert.equal(isCompatibleProfession('it support', 'software developer'), true)
  assert.equal(isCompatibleProfession('digital artist', 'software developer'), false)
})

test('same city is required but earns no points', () => {
  const userA = buildProfile({ id: 'user-a', dating_persona: undefined, occupation: '' })
  const userB = buildProfile({ id: 'user-b', gender: 'female', interested_in: 'male', dating_persona: undefined, occupation: '' })
  const result = calculateCompatibility(userA, richAnswersA, userB, richAnswersB)
  assert.equal(result.breakdown.lifestyleMatch, 0)
})

test('bios compared by meaning: close vectors earn points, distant ones none', () => {
  const unit = (v) => { const n = Math.hypot(...v); return v.map(x => x / n) }
  const near = unit([1, 0.1, 0])
  const far = unit([0, 0, 1])
  const close = {
    a: buildProfile({ id: 'a', bio_embeddings: { seeking: near, self: near } }),
    b: buildProfile({ id: 'b', gender: 'female', interested_in: 'male', bio_embeddings: { seeking: near, self: near } })
  }
  const apart = {
    a: buildProfile({ id: 'a', bio_embeddings: { seeking: near, self: near } }),
    b: buildProfile({ id: 'b', gender: 'female', interested_in: 'male', bio_embeddings: { seeking: far, self: far } })
  }
  const r1 = calculateCompatibility(close.a, richAnswersA, close.b, richAnswersB)
  const r2 = calculateCompatibility(apart.a, richAnswersA, apart.b, richAnswersB)
  assert.equal(r1.breakdown.aiSynergy, 10)
  assert.equal(r2.breakdown.aiSynergy, 0)
})

test('older question variants count once their dimension is known', () => {
  // Older members answered pooled variants (love_language_v2 …); only the dimension ties them to the core question
  const variant = richAnswersA.map(a => ({ ...a, question_key: `${a.question_key}_v2` }))
  const withDimension = richAnswersA.map((a, i) => ({ ...variant[i], dimension: ['love_language', 'communication', 'life_goals', 'social', 'pace'][i] }))
  const userA = buildProfile({ id: 'user-a' })
  const userB = buildProfile({ id: 'user-b', gender: 'female', interested_in: 'male' })

  const without = calculateCompatibility(userA, variant, userB, variant)
  const withDim = calculateCompatibility(userA, withDimension, userB, withDimension)

  assert.ok(without.eligibility.hardBlockers.includes('Not enough Vibe Check answers to compare'))
  assert.equal(withDim.eligibility.eligible, true)
})
