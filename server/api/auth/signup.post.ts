import { createClient } from '@supabase/supabase-js'
import { enforceRateLimit } from '~/server/utils/rateLimiter'
import { notifyNewSignup } from '~/server/utils/discord'

export default defineEventHandler(async (event) => {
    // Rate limit: 3 signup attempts per 5 minutes per IP
    enforceRateLimit(event, {
        maxRequests: 3,
        windowSeconds: 300,
        prefix: 'signup'
    })

    const body = await readBody(event)
    const config = useRuntimeConfig()

    const {
        phone, // Full phone format expected: +233...
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
        vibeAnswers,
        referralCode // Optional referral code from URL
    } = body

    if (!phone) {
        throw createError({ statusCode: 400, message: 'Phone is required' })
    }

    // Log received data for debugging
    console.log('Signup received:', { phone, displayName, gender, birthDate, location, interestedIn, intent })

    // Validate required fields
    if (!gender || !['male', 'female'].includes(gender)) {
        throw createError({ statusCode: 400, message: `Invalid or missing gender: "${gender}"` })
    }

    // Create fake email for auth
    const cleanPhone = phone.replace(/\D/g, '')
    const email = `${cleanPhone}@m2m.app`
    const password = `m2m_${cleanPhone}_${Math.random().toString(36).slice(2)}`

    // Create admin client
    const supabaseAdmin = createClient(
        config.supabaseUrl || process.env.SUPABASE_URL || '',
        config.supabaseServiceKey || '',
        { auth: { persistSession: false } }
    )

    let userId: string

    try {
        // 1. Try to get existing user by email (phone)
        // We can't easily "get" by email with admin api without listUsers, 
        // relying on profiles is safer if they exist, but let's try create first.

        // Attempt to create user with auto-confirm
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // AUTO-CONFIRM USER
            user_metadata: { phone }
        })

        if (createError) {
            // If user checks fail but it's just "already registered", handle update
            // But admin.createUser doesn't return convenient error codes always.
            // Let's check if we can find the user.

            // Try to find profile by phone to get ID
            const { data: existingProfile } = await supabaseAdmin
                .schema('m2m')
                .from('profiles')
                .select('id')
                .eq('phone', phone)
                .single()

            if (existingProfile) {
                userId = existingProfile.id
                // Reset password AND force confirm
                await supabaseAdmin.auth.admin.updateUserById(userId, {
                    password,
                    email_confirm: true,
                    user_metadata: { phone }
                })
            } else {
                // Auth user might exist but no profile? Rare but possible.
                // Let's rely on the client-side to handle "login" if this fails generally,
                // but for now, let's assume if createUser fails, we can't proceed easily without ID.
                // Actually, we can listUsers by email to find them.
                const { data: usersData } = await supabaseAdmin.auth.admin.listUsers()
                const foundUser = usersData.users.find(u => u.email === email)

                if (foundUser) {
                    userId = foundUser.id
                    // Reset password AND force confirm
                    await supabaseAdmin.auth.admin.updateUserById(userId, {
                        password,
                        email_confirm: true,
                        user_metadata: { phone }
                    })
                } else {
                    console.error('Create User Error:', createError)
                    throw createError
                }
            }
        } else {
            userId = newUser.user.id
        }

        // 2. Check for existing profile to preserve seeded data (like about_me)
        let existingAboutMe: string | null = null
        const { data: existingProfile } = await supabaseAdmin
            .schema('m2m')
            .from('profiles')
            .select('about_me')
            .eq('id', userId)
            .single()

        if (existingProfile?.about_me) {
            existingAboutMe = existingProfile.about_me
        }

        // 3. Create/Update Profile (Bypass RLS) - preserve seeded about_me
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
                is_verified: true,
                // Preserve seeded about_me if it exists
                about_me: existingAboutMe || null
            })

        if (profileError) throw profileError

        // 3. Save Vibe Answers
        if (vibeAnswers && Object.keys(vibeAnswers).length > 0) {
            const vibeEntries = Object.entries(vibeAnswers).map(([key, value]) => ({
                user_id: userId,
                question_key: key,
                answer_value: value
            }))

            await supabaseAdmin
                .schema('m2m')
                .from('vibe_answers')
                .upsert(vibeEntries, { onConflict: 'user_id,question_key' })
        }

        // Send Discord notification for new signup
        await notifyNewSignup({
            email,
            phone,
            displayName
        })

        // Track referral if a code was provided
        if (referralCode) {
            try {
                // Find the referrer
                const { data: referrer } = await supabaseAdmin
                    .schema('m2m')
                    .from('profiles')
                    .select('id')
                    .eq('referral_code', referralCode.toUpperCase())
                    .single()

                if (referrer && referrer.id !== userId) {
                    // Update profile with referred_by
                    await supabaseAdmin
                        .schema('m2m')
                        .from('profiles')
                        .update({ referred_by: referrer.id })
                        .eq('id', userId)

                    // Create referral record
                    await supabaseAdmin
                        .schema('m2m')
                        .from('referrals')
                        .insert({
                            referrer_id: referrer.id,
                            referred_id: userId,
                            referral_code: referralCode.toUpperCase(),
                            status: 'signed_up'
                        })

                    console.log(`[Referral] Tracked: User ${userId} was referred by ${referrer.id}`)
                }
            } catch (refError) {
                console.error('[Referral] Failed to track:', refError)
                // Don't fail signup if referral tracking fails
            }
        }

        // Return credentials for client to sign in
        return {
            success: true,
            email,
            password
        }

    } catch (error: any) {
        console.error('Signup Error:', error)
        throw createError({
            statusCode: 500,
            message: error.message || 'Signup failed'
        })
    }
})
