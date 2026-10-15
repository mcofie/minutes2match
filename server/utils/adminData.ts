/**
 * Helpers for admin reporting: paging past Supabase's 1,000-row limit and finding
 * who has answered the v2 Vibe Check.
 */

const PAGE = 1000

/** Runs a query page by page until it runs out of rows. `build` must return a fresh query each call. */
export const fetchAllRows = async <T = any>(build: () => any): Promise<T[]> => {
  const rows: T[] = []
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await build().range(from, from + PAGE - 1)
    if (error) throw error
    rows.push(...((data || []) as T[]))
    if (!data || data.length < PAGE) break
  }
  return rows
}

/** IDs of members with at least one v2 Vibe Check answer (question keys start with 'v2_'). */
export const fetchVibeV2UserIds = async (client: any): Promise<Set<string>> => {
  const rows = await fetchAllRows<{ user_id: string }>(() =>
    client.schema('m2m').from('vibe_answers').select('user_id').like('question_key', 'v2_%').order('user_id')
  )
  return new Set(rows.map(r => r.user_id))
}
