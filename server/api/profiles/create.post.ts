import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const config = useRuntimeConfig()

    // Create admin client with service role key
    const supabaseAdmin = createClient(
        config.supabaseUrl || process.env.SUPABASE_URL || '',
        config.supabaseServiceKey || '',
        { auth: { persistSession: false } }
    )

    const {
        userId,
        phone,
        displayName,
        gender,
        birthDate,
        location,
        interestedIn,
        intent,
        genotype,
        religion,
        heightCm,
        occupation,
        vibeAnswers
    } = body

    if (!userId || !phone) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing userId or phone'
        })
    }

    try {
        // Create profile using service role (bypasses RLS)
        const { error: profileError } = await supabaseAdmin
            .schema('m2m')
            .from('profiles')
            .upsert({
                id: userId,
                phone,
                display_name: displayName,
                gender,
                birth_date: birthDate,
                location,
                interested_in: interestedIn,
                intent,
                genotype: genotype || null,
                religion: religion || null,
                height_cm: heightCm || null,
                occupation: occupation || null,
                is_verified: true
            })

        if (profileError) {
            console.error('Profile creation error:', profileError)
            throw createError({
                statusCode: 500,
                statusMessage: profileError.message
            })
        }

        // Create vibe answers if provided
        if (vibeAnswers && Object.keys(vibeAnswers).length > 0) {
            const vibeEntries = Object.entries(vibeAnswers).map(([key, value]) => ({
                user_id: userId,
                question_key: key,
                answer_value: value
            }))

            const { error: vibeError } = await supabaseAdmin
                .schema('m2m')
                .from('vibe_answers')
                .upsert(vibeEntries, { onConflict: 'user_id,question_key' })

            if (vibeError) {
                console.error('Vibe answers error:', vibeError)
                // Don't throw, profile was created
            }
        }

        return { success: true }
    } catch (error: any) {
        console.error('Create profile error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Failed to create profile'
        })
    }
})
