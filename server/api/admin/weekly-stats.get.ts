/**
 * GET /api/admin/weekly-stats?weeks=8
 *
 * Week-on-week view of weekly matching, split by city:
 * - opt-ins per week (from m2m.weekly_opt_ins; the current week also reads live from profiles)
 * - matches made and people matched per week (from m2m.matches)
 * - this week's pool per city: members, opted in, matched, still waiting
 * - Vibe Check v2 progress: who has the new answers, who is still on the old ones, who is flagged to retake
 */
import { normalizeCity } from '~/utils/compatibility'
import { matchWeekKey } from '~/utils/matchWeek'

type CityKey = 'accra' | 'nairobi' | 'other'
const CITIES: CityKey[] = ['accra', 'nairobi', 'other']
const cityOf = (location?: string | null): CityKey => {
  const c = normalizeCity(location)
  return c === 'accra' || c === 'nairobi' ? c : 'other'
}

export default defineEventHandler(async (event) => {
  const { client } = await requireAdminAccess(event)
  const weeksBack = Math.min(26, Math.max(1, Number(getQuery(event).weeks) || 8))

  const now = new Date()
  const thisWeek = matchWeekKey(now)
  const weekKeys = Array.from({ length: weeksBack }, (_, i) => matchWeekKey(new Date(Date.parse(thisWeek) - i * 7 * 86400000)))
  const oldestWeek = weekKeys[weekKeys.length - 1]

  // Profiles: fall back to the pre-075 column set if the retake flag doesn't exist yet
  let retakeColumn = true
  let profiles: any[]
  try {
    profiles = await fetchAllRows(() => client.schema('m2m').from('profiles')
      .select('id, location, gender, is_active, weekly_opt_in_until, vibe_check_required').order('id'))
  } catch {
    retakeColumn = false
    profiles = await fetchAllRows(() => client.schema('m2m').from('profiles')
      .select('id, location, gender, is_active, weekly_opt_in_until').order('id'))
  }
  const cityById = new Map<string, CityKey>(profiles.map(p => [p.id, cityOf(p.location)]))

  // Opt-in history (needs migration 075)
  let historyAvailable = true
  let optIns: { user_id: string; week_start: string; opted_out_at: string | null }[] = []
  try {
    optIns = await fetchAllRows(() => client.schema('m2m').from('weekly_opt_ins')
      .select('user_id, week_start, opted_out_at').order('week_start').order('user_id'))
  } catch {
    historyAvailable = false
  }

  const matches = await fetchAllRows<any>(() => client.schema('m2m').from('matches')
    .select('id, created_at, user_1_id, user_2_id, feedback_status')
    .gte('created_at', `${oldestWeek}T00:00:00Z`)
    // Expired matches are from the old pay-to-unlock flow and never became introductions
    .neq('status', 'expired')
    .order('created_at'))

  // Who has answered anything, and who has answered the v2 questions
  const answers = await fetchAllRows<{ user_id: string; question_key: string }>(() =>
    client.schema('m2m').from('vibe_answers').select('user_id, question_key').order('user_id').order('question_key'))
  const anyAnswerUsers = new Set<string>()
  const v2Users = new Set<string>()
  for (const a of answers) {
    anyAnswerUsers.add(a.user_id)
    if (a.question_key?.startsWith('v2_')) v2Users.add(a.user_id)
  }

  // First week each member ever opted in, to count first-timers
  const firstWeekByUser = new Map<string, string>()
  for (const row of optIns) {
    if (row.opted_out_at) continue
    const prev = firstWeekByUser.get(row.user_id)
    if (!prev || row.week_start < prev) firstWeekByUser.set(row.user_id, row.week_start)
  }

  const isOptedInNow = (p: any) => p.is_active !== false && !!p.weekly_opt_in_until && new Date(p.weekly_opt_in_until) >= now

  // One week's figures, optionally for a single city (a match counts toward a city when either person lives there)
  const weekRow = (week: string, city?: CityKey) => {
    const inCity = (id: string) => !city || cityById.get(id) === city
    const optedInIds = new Set<string>()
    let skipped = 0
    for (const row of optIns) {
      if (row.week_start !== week || !inCity(row.user_id)) continue
      if (row.opted_out_at) skipped++
      else optedInIds.add(row.user_id)
    }
    if (week === thisWeek) {
      // This week the live pool is the source of truth (it's what the matchmaker reads)
      optedInIds.clear()
      for (const p of profiles) if (isOptedInNow(p) && inCity(p.id)) optedInIds.add(p.id)
    }

    const weekMatches = matches.filter(m => matchWeekKey(m.created_at) === week && (inCity(m.user_1_id) || inCity(m.user_2_id)))
    const matchedIds = new Set<string>()
    let connected = 0
    for (const m of weekMatches) {
      if (inCity(m.user_1_id)) matchedIds.add(m.user_1_id)
      if (inCity(m.user_2_id)) matchedIds.add(m.user_2_id)
      if (m.feedback_status === 'connected' || m.feedback_status === 'dating') connected++
    }
    const matchedOptedIn = [...matchedIds].filter(id => optedInIds.has(id)).length

    return {
      weekStart: week,
      optedIn: optedInIds.size,
      firstTime: [...optedInIds].filter(id => firstWeekByUser.get(id) === week).length,
      skipped,
      matches: weekMatches.length,
      peopleMatched: matchedIds.size,
      // Share of that week's opted-in members who got a match
      matchRate: optedInIds.size ? Math.round((matchedOptedIn / optedInIds.size) * 100) : null,
      connected
    }
  }

  const weeks = {
    all: weekKeys.map(w => weekRow(w)),
    accra: weekKeys.map(w => weekRow(w, 'accra')),
    nairobi: weekKeys.map(w => weekRow(w, 'nairobi'))
  }

  // This week's pool, per city
  const matchedThisWeek = new Set<string>()
  for (const m of matches) {
    if (matchWeekKey(m.created_at) !== thisWeek) continue
    matchedThisWeek.add(m.user_1_id)
    matchedThisWeek.add(m.user_2_id)
  }
  const pool = Object.fromEntries(CITIES.map(c => [c, { members: 0, optedIn: 0, matched: 0, waiting: 0 }])) as Record<CityKey, { members: number; optedIn: number; matched: number; waiting: number }>
  for (const p of profiles) {
    const c = cityById.get(p.id) || 'other'
    pool[c].members++
    if (matchedThisWeek.has(p.id)) pool[c].matched++
    if (isOptedInNow(p)) {
      pool[c].optedIn++
      if (!matchedThisWeek.has(p.id)) pool[c].waiting++
    }
  }

  // Vibe Check v2 progress
  let onNew = 0
  let onOld = 0
  let notStarted = 0
  let retakeRequired = 0
  for (const p of profiles) {
    if (v2Users.has(p.id)) onNew++
    else if (anyAnswerUsers.has(p.id)) onOld++
    else notStarted++
    if (p.vibe_check_required) retakeRequired++
  }

  return {
    thisWeek,
    historyAvailable,
    // First week with logged opt-ins; earlier weeks only have match figures
    historyStartsWeek: optIns.length ? optIns.reduce((min, r) => (r.week_start < min ? r.week_start : min), optIns[0].week_start) : null,
    retakeAvailable: retakeColumn,
    weeks,
    pool,
    totals: {
      members: profiles.length,
      optedIn: weeks.all[0].optedIn,
      matched: [...matchedThisWeek].length,
      waiting: CITIES.reduce((sum, c) => sum + pool[c].waiting, 0)
    },
    vibe: { onNew, onOld, notStarted, retakeRequired }
  }
})
