import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'No session found' })
  }

  const userId = user.id

  // 1. Fetch matching records (Comprehensive scan)
  const { data: m2mMatches, error: m2mErr } = await client
    .schema('m2m')
    .from('matches')
    .select('id, user_1_id, user_2_id, created_at, status')
    .or(`user_1_id.eq.${userId},user_2_id.eq.${userId}`)
    .eq('created_by_label', 'flash_lobby')
    .order('created_at', { ascending: false })

  const { data: publicMatches, error: publicErr } = await client
    .from('matches')
    .select('id, user_1_id, user_2_id, created_at, status')
    .or(`user_1_id.eq.${userId},user_2_id.eq.${userId}`)
    .eq('created_by_label', 'flash_lobby')
    .order('created_at', { ascending: false })

  const allMatches = [
    ...(m2mMatches || []),
    ...(publicMatches || [])
  ]

  if (allMatches.length === 0) {
    return { matches: [], debug: 'No matches found in any schema' }
  }

  // 2. Identify the 'Spark' partners
  const sparkPartnerIds = [...new Set(allMatches.map(m => {
    // Robust comparison using strings
    const u1 = String(m.user_1_id)
    const u2 = String(m.user_2_id)
    const me = String(userId)
    return u1 === me ? u2 : u1
  }))].filter(id => id && id !== 'undefined' && id !== 'null')

  if (sparkPartnerIds.length === 0) {
    return { matches: [], debug: 'No valid partner IDs extracted' }
  }

  // 3. Resolve profiles (Priority: m2m -> public)
  const [{ data: m2mP }, { data: publicP }] = await Promise.all([
    client.schema('m2m').from('profiles').select('id, display_name, photo_url, dating_persona').in('id', sparkPartnerIds),
    client.from('profiles').select('id, display_name, photo_url, dating_persona').in('id', sparkPartnerIds)
  ])

  const profiles = [...(m2mP || []), ...(publicP || [])]

  // 4. Map back to Sparks
  const sparks = allMatches.map(m => {
    const partnerId = String(m.user_1_id) === String(userId) ? String(m.user_2_id) : String(m.user_1_id)
    const p = profiles.find(prof => String(prof.id) === partnerId)
    
    if (!p) return null

    return {
      matchId: m.id,
      id: p.id,
      displayName: p.display_name,
      photoUrl: p.photo_url || null,
      persona: p.dating_persona || 'Participant',
      createdAt: m.created_at,
      status: m.status
    }
  }).filter(Boolean)

  return { 
    matches: sparks,
    count: sparks.length
  }
})
