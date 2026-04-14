import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import { calculateFlashLobbyPreviewScore, processFlashLobbyLiveReminders } from '~/server/utils/flashLobby'
import { canUsersSeeEachOther, normalizeGender, normalizeInterest } from '~/server/utils/flashLobbyRules'

export default defineEventHandler(async (event) => {
  await processFlashLobbyLiveReminders()

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
  let userGender: 'male' | 'female' | null = null
  let interestedIn: 'male' | 'female' | 'everyone' | null = null
  let currentUserProfile: any = null
  let currentUserAnswers: Array<{ question_key: string, answer: string }> = []

  const shuffleParticipants = <T>(items: T[]) => {
    const copy = [...items]
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
  }

  if (user) {
    const { data: ownProfile } = await client
      .schema('m2m')
      .from('profiles')
      .select('id, gender, interested_in, intent, location, religion, genotype, birth_date, dating_persona, occupation, badges, dealbreakers, min_age, max_age, preferences_extracted, interests')
      .eq('id', user.id)
      .maybeSingle()

    if (ownProfile) {
      currentUserProfile = ownProfile
      currentUserInterests = ownProfile.interests || []
      userGender = normalizeGender(ownProfile.gender)
      interestedIn = normalizeInterest(ownProfile.interested_in)
    }

    const { data: ownAnswers } = await client
      .schema('m2m')
      .from('vibe_answers')
      .select('question_key, answer_value')
      .eq('user_id', user.id)

    currentUserAnswers = (ownAnswers || []).map((answer: any) => ({
      question_key: answer.question_key,
      answer: answer.answer_value
    }))

    const { data: matches } = await client
      .schema('m2m')
      .from('matches')
      .select('user_1_id, user_2_id')
      .or(`user_1_id.eq.${user.id},user_2_id.eq.${user.id}`)

    if (matches) {
      matches.forEach((match: any) => {
        if (match.user_1_id) excludedIds.push(match.user_1_id)
        if (match.user_2_id) excludedIds.push(match.user_2_id)
      })
    }

    const now = new Date().toISOString()
    const { data: activeLobby } = await client
      .schema('m2m')
      .from('flash_lobbies')
      .select('id')
      .lte('start_at', now)
      .gte('end_at', now)
      .maybeSingle()

    if (activeLobby?.id) {
      const { data: sparkIntents } = await client
        .schema('m2m')
        .from('flash_lobby_intents')
        .select('sender_id, receiver_id, status')
        .eq('lobby_id', activeLobby.id)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)

      ;(sparkIntents || []).forEach((intent: any) => {
        const counterpartId = intent.sender_id === user.id ? intent.receiver_id : intent.sender_id
        if (counterpartId) excludedIds.push(counterpartId)
      })
    }
  }

  excludedIds = [...new Set(excludedIds)]

  let query = client
    .schema('m2m')
    .from('profiles')
    .select('id, display_name, birth_date, dating_persona, photo_url, is_verified, about_me, interests, gender, interested_in, location, intent, dealbreakers, occupation, religion, genotype, badges, min_age, max_age, preferences_extracted', { count: 'exact' })
    .eq('is_active', true)
    .not('display_name', 'is', null)

  const explicitGenderFilter = normalizeInterest(genderFilter)
  let normalizedFinalPref: 'male' | 'female' | 'everyone' | null = explicitGenderFilter

  if ((!normalizedFinalPref || normalizedFinalPref === 'everyone') && user) {
    if (interestedIn && interestedIn !== 'everyone') {
      normalizedFinalPref = interestedIn
    } else if (userGender === 'male') {
      normalizedFinalPref = 'female'
    } else if (userGender === 'female') {
      normalizedFinalPref = 'male'
    }
  }

  if (normalizedFinalPref && normalizedFinalPref !== 'everyone') {
    query = query.eq('gender', normalizedFinalPref)
  } else if (!user) {
    return { participants: [], totalCount: 0, hasMore: false }
  }

  if (location && location !== 'All') {
    query = query.ilike('location', `%${location}%`)
  }

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

  if (persona && persona !== 'All') {
    query = query.eq('dating_persona', persona)
  }

  const { data, count, error } = await query.range(offset, offset + limit - 1)

  if (error) {
    console.error('Lobby Participants error:', error)
    return { participants: [], totalCount: 0, hasMore: false }
  }

  const rawParticipants = data || []
  const filteredData = rawParticipants.filter((candidate: any) => {
    if (excludedIds.includes(candidate.id)) return false

    const visibility = canUsersSeeEachOther({
      viewerGender: userGender,
      viewerInterest: interestedIn,
      candidateGender: candidate.gender,
      candidateInterest: candidate.interested_in
    })

    if (normalizedFinalPref && normalizedFinalPref !== 'everyone') {
      if (visibility.candidateGender !== normalizedFinalPref) return false
    }

    if (!visibility.viewerCanSeeCandidate) return false

    return true
  })

  const participantIds = filteredData.map((candidate: any) => candidate.id)
  const { data: vibeAnswers } = participantIds.length
    ? await client
      .schema('m2m')
      .from('vibe_answers')
      .select('user_id, question_key, answer_value')
      .in('user_id', participantIds)
    : { data: [] as any[] }

  const answersByUser = new Map<string, Array<{ question_key: string, answer: string }>>()
  ;(vibeAnswers || []).forEach((answer: any) => {
    const existing = answersByUser.get(answer.user_id) || []
    existing.push({
      question_key: answer.question_key,
      answer: answer.answer_value
    })
    answersByUser.set(answer.user_id, existing)
  })

  const participants = shuffleParticipants(filteredData)
    .map((candidate: any) => {
      const matchScore = currentUserProfile
        ? calculateFlashLobbyPreviewScore({
          viewerProfile: currentUserProfile,
          viewerAnswers: currentUserAnswers,
          candidateProfile: candidate,
          candidateAnswers: answersByUser.get(candidate.id) || []
        })
        : 0

      return {
        id: candidate.id,
        displayName: candidate.display_name,
        age: candidate.birth_date ? new Date().getFullYear() - new Date(candidate.birth_date).getFullYear() : 25,
        gender: candidate.gender || 'Unknown',
        mood: candidate.dating_persona || 'The Optimist',
        photoUrl: candidate.photo_url,
        isVerified: candidate.is_verified,
        bio: candidate.about_me,
        interests: candidate.interests || [],
        sharedInterests: (candidate.interests || []).filter((interest: string) => currentUserInterests.includes(interest)),
        intent: candidate.intent,
        occupation: candidate.occupation,
        dealbreakers: candidate.dealbreakers || {},
        matchScore
      }
    })

  const debugDump = {
    userAuthId: user?.id || null,
    ownProfileFound: !!userGender,
    userGender,
    interestedIn,
    queryGenderFilter: genderFilter,
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
