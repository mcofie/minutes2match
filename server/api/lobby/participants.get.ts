import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  // 0. Get filters from query
  const queryParams = getQuery(event)
  const page = parseInt(queryParams.page as string) || 1
  const limit = parseInt(queryParams.limit as string) || 12
  const offset = (page - 1) * limit
  
  const minAge = parseInt(queryParams.minAge as string)
  const maxAge = parseInt(queryParams.maxAge as string)
  const persona = queryParams.persona as string
  const genderFilter = queryParams.gender as string
  const location = queryParams.location as string

  const client = serverSupabaseServiceRole(event)
  const user = await serverSupabaseUser(event)
  
  let currentUserInterests: string[] = []
  let excludedIds: string[] = [user?.id].filter(Boolean) as string[]
  let userGender: string | null = null
  let interestedIn: string | null = null

  if (user) {
    const { data: ownProfile } = await client
      .schema('m2m')
      .from('profiles')
      .select('interests, gender, interested_in')
      .eq('id', user.id)
      .maybeSingle()
    
    if (ownProfile) {
      currentUserInterests = ownProfile.interests || []
      userGender = (ownProfile.gender || '').toLowerCase()
      interestedIn = (ownProfile.interested_in || '').toLowerCase()
    }

    const { data: matches } = await client
      .schema('m2m')
      .from('matches')
      .select('user_1_id, user_2_id')
      .or(`user_1_id.eq.${user.id},user_2_id.eq.${user.id}`)
    
    if (matches) {
       matches.forEach((m: any) => {
          if (m.user_1_id) excludedIds.push(m.user_1_id)
          if (m.user_2_id) excludedIds.push(m.user_2_id)
       })
    }
  }

  // Final list of exclusions (unique)
  excludedIds = [...new Set(excludedIds)]

  // Build Query
  let query = client
    .schema('m2m')
    .from('profiles')
    .select('id, display_name, birth_date, dating_persona, photo_url, is_verified, about_me, interests, gender, interested_in, location', { count: 'exact' })
    .not('display_name', 'is', null)

  // 1. Gender Restriction Rule: If Male, show only Female (and vice versa)
  let finalPref = genderFilter // Manual override toggle from UI if allowed
  
  // Mandatory enforcement for males as per user request
  if (userGender === 'male') {
    finalPref = 'female'
  } else if (userGender === 'female') {
    finalPref = 'male'
  }

  if (finalPref && finalPref !== 'everyone') {
    query = query.eq('gender', finalPref.toLowerCase())
  }

  // 2. Location Filter
  if (location && location !== 'All') {
    query = query.ilike('location', `%${location}%`)
  }

  // 3. Age Range Filter 
  if (minAge) {
    const minDate = new Date()
    minDate.setFullYear(minDate.getFullYear() - minAge)
    query = query.lte('birth_date', minDate.toISOString().split('T')[0])
  }
  if (maxAge) {
    const maxDate = new Date()
    maxDate.setFullYear(maxDate.getFullYear() - maxAge)
    query = query.gte('birth_date', maxDate.toISOString().split('T')[0])
  }

  // 3. Persona Filter
  if (persona && persona !== 'All') {
    query = query.eq('dating_persona', persona)
  }

  // 4. Exclusions
  if (excludedIds.length > 0) {
    query = query.not('id', 'in', excludedIds)
  }

  const { data, count, error } = await query
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Lobby Participants error:', error)
    return { participants: [], totalCount: 0, hasMore: false }
  }

  const participants = (data || []).map((u: any) => ({
    id: u.id,
    displayName: u.display_name,
    age: u.birth_date ? new Date().getFullYear() - new Date(u.birth_date).getFullYear() : 25,
    gender: u.gender || 'Unknown',
    mood: u.dating_persona || 'The Optimist',
    photoUrl: u.photo_url,
    isVerified: u.is_verified,
    bio: u.about_me,
    interests: u.interests || [],
    sharedInterests: (u.interests || []).filter((i: string) => currentUserInterests.includes(i)),
    matchScore: 85
  }))

  return {
    participants,
    totalCount: count || 0,
    hasMore: (count || 0) > (offset + (data?.length || 0)),
    page,
    limit
  }
})
