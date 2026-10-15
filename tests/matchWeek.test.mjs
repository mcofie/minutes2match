import test from 'node:test'
import assert from 'node:assert/strict'

import { currentMatchRunTime, optInWeekEnd, weeklyMatchStatus, currentMatchWeekEnd } from '../utils/matchWeek.ts'

const wed = new Date('2026-10-14T09:00:00Z')        // Wednesday
const sunMorning = new Date('2026-10-18T08:00:00Z') // before the noon run
const sunEvening = new Date('2026-10-18T18:00:00Z') // after the run

test('the run is Sunday at noon UTC of the current week', () => {
  assert.equal(currentMatchRunTime(wed).toISOString(), '2026-10-18T12:00:00.000Z')
})

test('opting in before the run counts for this week, after it for next week', () => {
  assert.equal(optInWeekEnd(wed).toISOString(), currentMatchWeekEnd(wed).toISOString())
  assert.equal(optInWeekEnd(sunMorning).toISOString(), currentMatchWeekEnd(sunMorning).toISOString())
  assert.equal(optInWeekEnd(sunEvening).toISOString(), '2026-10-25T23:59:59.999Z')
})

test('member states through the week', () => {
  const thisWeek = currentMatchWeekEnd(wed).toISOString()
  assert.equal(weeklyMatchStatus(null, true, wed).state, 'open')
  assert.equal(weeklyMatchStatus(thisWeek, true, wed).state, 'in')
  assert.equal(weeklyMatchStatus(thisWeek, true, sunEvening).state, 'done')
  assert.equal(weeklyMatchStatus(null, true, sunEvening).state, 'closed')
  assert.equal(weeklyMatchStatus('2026-10-25T23:59:59.999Z', true, sunEvening).state, 'next')
  // Incognito members aren't in, whatever their opt-in says
  assert.equal(weeklyMatchStatus(thisWeek, false, wed).state, 'open')
})

test('the run to look out for moves to next week once this one has happened', () => {
  assert.equal(weeklyMatchStatus(null, true, wed).runAt.toISOString(), '2026-10-18T12:00:00.000Z')
  assert.equal(weeklyMatchStatus(null, true, sunEvening).runAt.toISOString(), '2026-10-25T12:00:00.000Z')
})
