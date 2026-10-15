/**
 * Weekly matching: members opt in each week. An opt-in lasts until the end of
 * the current matching week (Sunday 23:59:59 UTC, i.e. Sunday night in Accra).
 */

export const currentMatchWeekEnd = (now: Date = new Date()): Date => {
  const end = new Date(now)
  const daysUntilSunday = (7 - end.getUTCDay()) % 7
  end.setUTCDate(end.getUTCDate() + daysUntilSunday)
  end.setUTCHours(23, 59, 59, 999)
  return end
}

export const isOptedInThisWeek = (optInUntil?: string | null, now: Date = new Date()) =>
  !!optInUntil && new Date(optInUntil).getTime() >= now.getTime()

/** Start of the current matching week (the moment the previous week ended). One match per member per week. */
export const currentMatchWeekStart = (now: Date = new Date()): Date =>
  new Date(currentMatchWeekEnd(now).getTime() - 7 * 24 * 60 * 60 * 1000 + 1)

/** Monday (UTC) of the matching week a moment falls in, as YYYY-MM-DD. Matches m2m.weekly_opt_ins.week_start. */
export const matchWeekKey = (at: Date | string): string => {
  const d = new Date(at)
  const day = (d.getUTCDay() + 6) % 7 // Monday = 0
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - day)).toISOString().slice(0, 10)
}

/**
 * Weekly matching runs on Sunday at this hour, UTC (noon in Accra, 3pm in Nairobi).
 * Keep it in step with the auto-match cron schedule.
 */
export const MATCH_RUN_UTC_HOUR = 12

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

/** When this week's matching runs (Sunday, MATCH_RUN_UTC_HOUR UTC) */
export const currentMatchRunTime = (now: Date = new Date()): Date => {
  const run = new Date(currentMatchWeekEnd(now))
  run.setUTCHours(MATCH_RUN_UTC_HOUR, 0, 0, 0)
  return run
}

/** End of the week an opt-in made now counts for: this week until Sunday's run, then next week */
export const optInWeekEnd = (now: Date = new Date()): Date => {
  const end = currentMatchWeekEnd(now)
  return now.getTime() >= currentMatchRunTime(now).getTime() ? new Date(end.getTime() + WEEK_MS) : end
}

export type WeeklyMatchState =
  | 'open'     // not opted in, this week's run is still ahead
  | 'closed'   // not opted in, this week's run has happened: opting in now is for next week
  | 'in'       // opted in, waiting for this week's run
  | 'done'     // opted in for this week and the run has happened
  | 'next'     // opted in for next week

/** Where a member stands in weekly matching, and when the run they're waiting for happens */
export const weeklyMatchStatus = (optInUntil?: string | null, active = true, now: Date = new Date()) => {
  const run = currentMatchRunTime(now)
  const runDone = now.getTime() >= run.getTime()
  const nextRun = new Date(run.getTime() + WEEK_MS)
  const until = optInUntil ? new Date(optInUntil).getTime() : 0
  const optedIn = active && until >= now.getTime()
  const forNextWeek = optedIn && until > currentMatchWeekEnd(now).getTime()

  const state: WeeklyMatchState = !optedIn ? (runDone ? 'closed' : 'open') : forNextWeek ? 'next' : runDone ? 'done' : 'in'
  // The run this member should look out for
  const runAt = state === 'open' || state === 'in' ? run : nextRun
  return { state, optedIn, runAt }
}

/** "Sunday 3 pm", in the viewer's own time zone */
export const formatMatchRun = (when: Date) =>
  when.toLocaleString('en-GB', { weekday: 'long', hour: 'numeric', hour12: true }).replace(' at ', ' ')
