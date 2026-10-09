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
