import test from 'node:test'
import assert from 'node:assert/strict'

import { choosePairs } from '../utils/pairing.ts'

const pair = (a, b, weight) => ({ a, b, weight })
const asSet = pairs => new Set(pairs.map(p => [p.a, p.b].sort().join('-')))
const total = pairs => pairs.reduce((sum, p) => sum + p.weight, 0)

test('each person is used at most once', () => {
  const result = choosePairs([pair('A', 'B', 90), pair('A', 'C', 80), pair('B', 'C', 70), pair('C', 'D', 60)])
  const people = result.flatMap(p => [p.a, p.b])
  assert.equal(new Set(people).size, people.length)
})

test('matches more people than taking the best pair first', () => {
  // Greedy takes A-B (95) and strands C and D, who each only fit A or B
  const result = choosePairs([pair('A', 'B', 95), pair('A', 'C', 80), pair('B', 'D', 80)])
  assert.deepEqual(asSet(result), new Set(['A-C', 'B-D']))
})

test('swaps partners when it raises the total', () => {
  // Greedy: A-B 90 + C-D 10 = 100. Better: A-D 80 + B-C 80 = 160
  const result = choosePairs([pair('A', 'B', 90), pair('C', 'D', 10), pair('A', 'D', 80), pair('B', 'C', 80)])
  assert.equal(total(result), 160)
})

test('trades up to an unmatched person who fits better', () => {
  const result = choosePairs([pair('A', 'B', 60), pair('A', 'X', 50), pair('B', 'Y', 50), pair('C', 'D', 70)])
  assert.equal(result.length, 3)
})

test('keeps the higher weight when a pair is listed twice', () => {
  const result = choosePairs([pair('A', 'B', 50), pair('B', 'A', 75)])
  assert.equal(result[0].weight, 75)
})

test('empty input gives no pairs', () => {
  assert.deepEqual(choosePairs([]), [])
})
