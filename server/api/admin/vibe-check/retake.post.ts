/**
 * POST /api/admin/vibe-check/retake
 *
 * Ask members to retake the new (v2) Vibe Check the next time they log in.
 * Body:
 *   { scope: 'missing_v2' }          flag everyone who hasn't answered the v2 questions
 *   { userIds: string[] }            flag specific members
 *   { userIds: string[], clear: true } remove the request again
 *
 * Nothing is deleted: profiles and earlier answers stay, and the flag clears itself
 * once the member saves their new answers (migration 075).
 */
export default defineEventHandler(async (event) => {
  const { client } = await requireAdminAccess(event)
  const body = await readBody<{ scope?: 'missing_v2'; userIds?: string[]; clear?: boolean }>(event)

  let ids: string[] = []
  if (body?.scope === 'missing_v2') {
    const [profiles, v2Users] = await Promise.all([
      fetchAllRows<{ id: string }>(() => client.schema('m2m').from('profiles').select('id').order('id')),
      fetchVibeV2UserIds(client)
    ])
    ids = profiles.map(p => p.id).filter(id => !v2Users.has(id))
  } else if (Array.isArray(body?.userIds)) {
    ids = body.userIds.filter(id => typeof id === 'string')
  } else {
    throw createError({ statusCode: 400, statusMessage: 'Pass scope: "missing_v2" or a list of userIds' })
  }

  const required = !body?.clear
  let updated = 0
  for (let i = 0; i < ids.length; i += 200) {
    const chunk = ids.slice(i, i + 200)
    const { error, count } = await (client.schema('m2m').from('profiles') as any)
      .update({ vibe_check_required: required }, { count: 'exact' })
      .in('id', chunk)
    if (error) {
      // 42703: column missing, migration 075 hasn't been run
      if (error.code === '42703') {
        throw createError({ statusCode: 409, statusMessage: 'Run migration 075 before asking members to retake the Vibe Check' })
      }
      throw createError({ statusCode: 500, statusMessage: error.message })
    }
    updated += count ?? chunk.length
  }

  return { success: true, updated, required }
})
