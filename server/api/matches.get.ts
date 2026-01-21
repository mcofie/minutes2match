import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const client = serverSupabaseServiceRole(event)
    const userId = user.id

    // Fetch matches involving the user
    const { data: matches, error } = await client
        .schema('m2m')
        .from('matches')
        .select(`
      *,
      user_1:profiles!matches_user_1_id_fkey(*),
      user_2:profiles!matches_user_2_id_fkey(*)
    `)
        .or(`user_1_id.eq.${userId},user_2_id.eq.${userId}`)
        .in('status', ['pending_payment', 'partial_payment', 'unlocked'])
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching matches:', error)
        throw createError({ statusCode: 500, message: 'Error fetching matches' })
    }

    // Process matches to enrich with vibe answers and determine matched profile
    const processedMatches = await Promise.all((matches || []).map(async (match: any) => {
        // Determine which profile is the "other" person
        const matchedProfile = match.user_1_id === userId ? match.user_2 : match.user_1

        // Fetch vibe answers for the matched profile
        let vibeAnswers: any[] = []
        if (matchedProfile?.id) {
            const { data: answers } = await client
                .schema('m2m')
                .from('vibe_answers')
                .select('question_key, answer_value')
                .eq('user_id', matchedProfile.id)

            vibeAnswers = answers || []
        }

        return {
            ...match,
            matchedProfile,
            vibeAnswers,
            currentUserPaid: match.user_1_id === userId ? match.user_1_paid : match.user_2_paid
        }
    }))

    return processedMatches
})
