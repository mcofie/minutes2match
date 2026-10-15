/**
 * GET /api/admin/matches
 * Every introduction with both people, including the private columns members can't read
 * (feedback answers, admin notes, AI selection note; see migration 077). Admins only.
 * Expired matches are left out: they're from the old pay-to-unlock flow and never became introductions.
 */
const PROFILE_FIELDS = 'id, display_name, phone, photo_url, location, gender'

export default defineEventHandler(async (event) => {
  const { client } = await requireAdminAccess(event)

  const matches = await fetchAllRows<any>(() => client
    .schema('m2m')
    .from('matches')
    .select(`
      *,
      user_1:profiles!matches_user_1_id_fkey(${PROFILE_FIELDS}),
      user_2:profiles!matches_user_2_id_fkey(${PROFILE_FIELDS})
    `)
    .neq('status', 'expired')
    .order('created_at', { ascending: false }))

  return { matches }
})
