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

test('intent mismatch is a soft risk but does not hard-block by itself', () => {
  const userA = buildProfile({ id: 'user-a', intent: 'marriage' })
  const userB = buildProfile({
    id: 'user-b',
    gender: 'female',
    interested_in: 'male',
    intent: 'casual'
  })

  const result = calculateCompatibility(userA, richAnswersA, userB, richAnswersB)

  assert.equal(result.eligibility.eligible, true)
  assert.ok(result.eligibility.softRisks.includes('Conflict in relationship goals'))
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
  assert.ok(sparseResult.missingData.includes('AI preference extraction'))
  assert.ok(sparseResult.missingData.includes('vibe answers'))
})
