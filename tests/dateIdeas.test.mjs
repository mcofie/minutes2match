import test from 'node:test'
import assert from 'node:assert/strict'

import { pickDateIdeas, DATE_CATALOG, zoneOf } from '../utils/dateIdeas.ts'

const byId = Object.fromEntries(DATE_CATALOG.map(d => [d.id, d]))
const answers = (pairs = {}) => new Map(Object.entries(pairs))
const base = (overrides = {}) => ({
  shared: [],
  either: [],
  city: 'accra',
  mine: answers(),
  theirs: answers(),
  intents: ['serious'],
  windows: [],
  interestLabel: id => id,
  today: new Date('2026-01-15'), // dry season in both cities
  ...overrides
})

test('every idea carries a price', () => {
  for (const idea of DATE_CATALOG) assert.ok([1, 2, 3].includes(idea.price), idea.id)
})

test('no drinks-led dates when either person is not comfortable with alcohol', () => {
  const picks = pickDateIdeas(base({ shared: ['music', 'dancing'], mine: answers({ v2_drinking: '1' }), theirs: answers({ v2_drinking: '7' }) }), 5)
  assert.ok(picks.length > 0)
  assert.ok(picks.every(p => !p.alcohol), picks.map(p => p.id).join(', '))
})

test('two savers get affordable ideas', () => {
  const savers = { mine: answers({ v2_money: '6' }), theirs: answers({ v2_money: '7' }) }
  // Music and dancing lovers normally get the (pricey) jazz bar first
  assert.equal(pickDateIdeas(base({ shared: ['music', 'dancing'] }))[0].id, 'acc-jazz')
  const picks = pickDateIdeas(base({ shared: ['music', 'dancing'], ...savers }))
  assert.ok(picks.every(p => p.price <= 2), picks.map(p => `${p.id}:${p.price}`).join(', '))
})

test('a spot near both of them wins', () => {
  assert.equal(zoneOf('Accra, East Legon'), 'accra-north')
  const picks = pickDateIdeas(base({ shared: ['nature'], locations: ['Accra, East Legon', 'Madina, Accra'] }))
  const legon = picks.find(p => p.id === 'acc-legon')
  assert.ok(legon, picks.map(p => p.id).join(', '))
  assert.ok(legon.why.includes('Close to where you both are') || legon.why.length === 2)
})

test('rainy season pushes outdoor ideas down', () => {
  const input = { shared: ['nature', 'photography'] }
  const dry = pickDateIdeas(base({ ...input, today: new Date('2026-01-15') }), 5).filter(p => p.outdoor).length
  const wet = pickDateIdeas(base({ ...input, today: new Date('2026-06-15') }), 5).filter(p => p.outdoor).length
  assert.ok(wet < dry, `outdoor picks: dry ${dry}, rainy ${wet}`)
})

test('faith-first pairs are not sent to nightlife', () => {
  const picks = pickDateIdeas(base({ shared: ['music'], mine: answers({ v2_faith: '7' }), theirs: answers({ v2_faith: '6' }) }))
  assert.ok(picks.every(p => p.kind !== 'nightlife'), picks.map(p => p.id).join(', '))
})

test('adventurous values bring in an adventure', () => {
  const values = JSON.stringify(['Adventurous 🧭', 'Kind 💛', 'Honest 🫶', 'Funny 😂', 'Loyal 🤝'])
  const picks = pickDateIdeas(base({ mine: answers({ v2_core_values: values }), theirs: answers({ v2_core_values: values }) }))
  assert.ok(picks.some(p => p.kind === 'adventure' || p.kind === 'active'), picks.map(p => p.id).join(', '))
})

test('picks stay varied', () => {
  const picks = pickDateIdeas(base({ shared: ['food', 'cooking'] }))
  assert.equal(new Set(picks.map(p => p.kind)).size, picks.length)
})

test('catalogue ids used in tests exist', () => {
  assert.ok(byId['acc-legon'] && byId['acc-jazz'])
})
