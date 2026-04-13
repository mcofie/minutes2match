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
    .select('id, display_name, birth_date, dating_persona, photo_url, is_verified, about_me, interests, gender, interested_in, location, intent, dealbreakers', { count: 'exact' })
    .eq('is_active', true)
    .not('display_name', 'is', null)

  // Helper: map common terms to a binary target
  const getGenderTargets = (pref: string) => {
     if (['women', 'woman', 'female', 'females'].includes(pref)) return ['female', 'Female', 'women', 'Women', 'woman', 'Woman']
     if (['men', 'man', 'male', 'males'].includes(pref)) return ['male', 'Male', 'men', 'Men', 'man', 'Man']
     return [pref]
  }

  // 1. Gender Preference Enforcement
  let finalPref = (genderFilter || '').toLowerCase()

  // If the UI filter is set to "All" or empty, we strictly fall back to the Database preference
  if (['', 'all', 'everyone', 'both'].includes(finalPref) && user) {
    if (interestedIn && !['everyone', 'all', 'both'].includes(interestedIn.toLowerCase())) {
        finalPref = interestedIn.toLowerCase()
    } else if (userGender) {
        // ONLY if they have NO preference set, we fallback based on gender
        const ug = userGender.toLowerCase()
        if (['male', 'men', 'man'].includes(ug)) finalPref = 'female'
        else if (['female', 'women', 'woman'].includes(ug)) finalPref = 'male'
    }
  }

  // Normalization maps 'women' to 'female' for internal logic
  let normalizedFinalPref = finalPref
  if (['women', 'woman'].includes(finalPref)) normalizedFinalPref = 'female'
  if (['men', 'man'].includes(finalPref)) normalizedFinalPref = 'male'

  // Strictly enforce the filter IF we've determined a preference or targeting
  if (normalizedFinalPref && !['everyone', 'all', ''].includes(normalizedFinalPref)) {
    const targets = getGenderTargets(normalizedFinalPref)
    
    // 1. Include only the intended gender variations safely
    query = query.in('gender', targets)
  } else if (!user) {
    // SECURITY/UX: If unauthenticated, show nothing or a very limited set
    return { participants: [], totalCount: 0, hasMore: false }
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

  // 4. Exclusions (Handled in-memory for safety against PostgREST tuple crashes)
  // if (excludedIds.length > 0) {
  //   query = query.not('id', 'in', excludedIds)
  // }

  const { data, count, error } = await query
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Lobby Participants error:', error)
    return { participants: [], totalCount: 0, hasMore: false }
  }

  // 5. Final In-Memory Fail-Safe (Ensures we NEVER show the wrong gender)
  const rawParticipants = data || []
  const filteredData = rawParticipants.filter((u: any) => {
    // Exclude connected/matched users in-memory
    if (excludedIds.includes(u.id)) return false;

    // If we have a strict preference, enforce it here too
    if (normalizedFinalPref && !['everyone', 'all', ''].includes(normalizedFinalPref)) {
      const uGender = (u.gender || '').toLowerCase()
      const targets = getGenderTargets(normalizedFinalPref).map(t => t.toLowerCase())
      
      // If we seek a specific gender, the user's gender MUST be in the acceptable targets list
      if (!targets.includes(uGender)) {
         return false
      }
    }
    return true
  })

  const participants = filteredData.map((u: any) => ({
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
    intent: u.intent,
    occupation: u.occupation,
    dealbreakers: u.dealbreakers || {},
    matchScore: Math.floor(Math.random() * 30) + 70 // High match for lobby demo
  }))

    const debugDump = {
       userAuthId: user?.id || null,
       ownProfileFound: !!userGender,
       userGender,
       interestedIn,
       queryGenderFilter: genderFilter,
       finalPref,
       normalizedFinalPref,
       rawCount: rawParticipants.length,
       filteredCount: filteredData.length,
       returnedCount: participants.length
    }
  return {
    participants,
    totalCount: count || 0,
    hasMore: (count || 0) > (offset + (data?.length || 0)),
    page,
    limit,
    _debug: debugDump
  }
})
