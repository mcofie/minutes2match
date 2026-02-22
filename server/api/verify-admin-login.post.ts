import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const config = useRuntimeConfig()
    const { phone, code } = body
    console.log('🔍 Admin Login Request:', { phone, code })

    // Get keys from runtime config
    const supabaseUrl = config.supabaseUrl || process.env.SUPABASE_URL
    const supabaseKey = config.supabaseServiceKey || process.env.SUPABASE_SERVICE_KEY

    if (!supabaseUrl || !supabaseKey) {
        console.error('SERVER ERROR: Missing Supabase Service Keys')
        throw createError({ statusCode: 500, message: 'Server configuration error' })
    }

    // Initialize with m2m schema AND persistSession: false for server-side
    const supabase = createClient(supabaseUrl, supabaseKey, {
        db: { schema: 'm2m' },
        auth: { persistSession: false }
    })

    // 1. Verify OTP or Developer Bypass
    let isValid = false
    if (code === '111111') {
        isValid = true
        console.log('✅ [Admin Login] Using bypass code')
    } else {
        // Check DB for valid OTP
        const { data: otp, error } = await supabase
            .from('otp_codes')
            .select('*')
            .eq('phone', phone)
            .eq('code', code)
            .eq('used', false)
            .gt('expires_at', new Date().toISOString())
            .maybeSingle()

        if (otp) {
            isValid = true
            // Mark as used
            await supabase.from('otp_codes').update({ used: true }).eq('id', otp.id)
        }
    }

    if (!isValid) {
        throw createError({ statusCode: 400, message: 'Invalid verification code' })
    }

    // 2. Validate User Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone', phone)
        .single()

    if (!profile) {
        throw createError({ statusCode: 404, message: 'User profile not found. Please sign up via Vibe Check first.' })
    }

    // 3. Verify Admin Status
    const { data: admin } = await supabase
        .from('admins')
        .select('role')
        .eq('id', profile.id)
        .single()

    if (!admin) {
        throw createError({ statusCode: 403, message: 'Access Denied: You are not authorized.' })
    }

    // 4. Get auth user email and reset password for seamless login
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(profile.id)

    if (authError || !authUser.user) {
        throw createError({ statusCode: 404, message: 'Auth user not found' })
    }

    const tempPassword = `AdminSeq-${Math.random().toString(36).slice(-8)}-${Date.now()}`

    const { error: updateError } = await supabase.auth.admin.updateUserById(
        profile.id,
        { password: tempPassword, email_confirm: true }
    )

    if (updateError) {
        console.error('Password Update Failed:', updateError)
        throw createError({ statusCode: 500, message: 'Failed to initiate secure session' })
    }

    // Return the credentials for client-side login
    return {
        success: true,
        email: authUser.user.email,
        tempPassword
    }
})
