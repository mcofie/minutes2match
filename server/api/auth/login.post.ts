import { createClient } from '@supabase/supabase-js'
import { enforceRateLimit } from '~/server/utils/rateLimiter'

export default defineEventHandler(async (event) => {
    // Rate limit: 5 login attempts per minute per IP
    enforceRateLimit(event, {
        maxRequests: 5,
        windowSeconds: 60,
        prefix: 'login'
    })

    const body = await readBody(event)
    const config = useRuntimeConfig()

    const { phone, code } = body

    if (!phone || !code) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Phone and code are required'
        })
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(
        process.env.SUPABASE_URL || '',
        config.supabaseServiceKey || '',
        { auth: { persistSession: false } }
    )

    try {
        // 1. Verify OTP
        const { data: otpData, error: otpError } = await supabaseAdmin
            .schema('m2m')
            .from('otp_codes')
            .select('*')
            .eq('phone', phone)
            .eq('code', code)
            .eq('used', false)
            .gt('expires_at', new Date().toISOString())
            .single()

        if (otpError || !otpData) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Invalid or expired code'
            })
        }

        // 2. Mark OTP as used
        await supabaseAdmin
            .schema('m2m')
            .from('otp_codes')
            .update({ used: true })
            .eq('id', otpData.id)

        // 3. Find profile by phone (fetch key fields to check vibe check completion)
        const { data: profile, error: profileError } = await supabaseAdmin
            .schema('m2m')
            .from('profiles')
            .select('id, phone, display_name, gender, intent, interested_in')
            .eq('phone', phone)
            .single()

        if (profileError || !profile) {
            throw createError({
                statusCode: 404,
                statusMessage: 'No account found with this phone number. Please sign up first.'
            })
        }

        // 4. Check if user has completed vibe check (has vibe answers)
        const { count: vibeAnswerCount } = await supabaseAdmin
            .schema('m2m')
            .from('vibe_answers')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', profile.id)

        // User has completed vibe check if they have key profile fields AND some vibe answers
        const hasCompletedVibeCheck = !!(
            profile.gender &&
            profile.intent &&
            profile.interested_in &&
            vibeAnswerCount && vibeAnswerCount > 0
        )

        // 4. Get the auth user and generate a session
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(profile.id)

        if (authError || !authData.user) {
            throw createError({
                statusCode: 404,
                statusMessage: 'User account not found'
            })
        }

        // 5. Create a new session for this user
        // We'll update their password to a known value temporarily and sign them in
        const tempPassword = `login_${Date.now()}_${Math.random().toString(36).slice(2)}`

        // Update user password
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            profile.id,
            {
                password: tempPassword,
                email_confirm: true
            }
        )

        if (updateError) {
            console.error('Password update error:', updateError)
            throw createError({
                statusCode: 500,
                statusMessage: 'Failed to create login session'
            })
        }

        // Send Discord notification for login
        // New user = hasn't completed vibe check yet (first time logging in after signup)
        try {
            const { notifyUserLogin } = await import('~/server/utils/discord')
            await notifyUserLogin({
                phone: phone,
                displayName: profile.display_name,
                isNewUser: !hasCompletedVibeCheck
            })
        } catch (discordError) {
            // Don't fail login if Discord notification fails
            console.error('[Login] Discord notification error:', discordError)
        }

        // Return credentials for client-side sign in
        return {
            success: true,
            email: authData.user.email,
            password: tempPassword,
            displayName: profile.display_name,
            hasCompletedVibeCheck
        }
    } catch (error: any) {
        console.error('Login error:', error)
        if (error.statusCode) throw error
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Login failed'
        })
    }
})
