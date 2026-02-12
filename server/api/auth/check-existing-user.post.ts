// API endpoint to auto-authenticate seeded/existing verified users
// Allows them to complete vibe check without OTP friction

import { createClient } from '@supabase/supabase-js'
import type { M2MDatabase } from '~/types/database.types'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const config = useRuntimeConfig()

    const { phone } = body

    if (!phone) {
        throw createError({ statusCode: 400, message: 'Phone is required' })
    }

    const supabaseAdmin = createClient<M2MDatabase>(
        process.env.SUPABASE_URL || '',
        config.supabaseServiceKey || '',
        { auth: { persistSession: false } }
    )

    try {
        // Check if profile exists with this phone and is verified (seeded users are pre-verified)
        const { data: profile, error: profileError } = await supabaseAdmin
            .schema('m2m')
            .from('profiles')
            .select('id, display_name, is_verified, phone')
            .eq('phone', phone)
            .single()

        if (profileError || !profile) {
            // No existing profile - this is a new user, normal OTP flow
            return {
                exists: false,
                requiresOtp: true
            }
        }

        // Profile exists - check if it's a verified seeded user
        if (!profile.is_verified) {
            // Unverified profile, still need OTP
            return {
                exists: true,
                requiresOtp: true,
                message: 'Account exists but needs verification'
            }
        }

        // Verified user exists! Get their actual auth email and generate a temp password
        // First, get the user from auth to find their actual email
        const { data: authUser, error: authGetError } = await supabaseAdmin.auth.admin.getUserById(profile.id)

        if (authGetError || !authUser?.user?.email) {
            console.error('Failed to get auth user:', authGetError)
            // Fall back to OTP if we can't find the auth user
            return {
                exists: true,
                requiresOtp: true,
                message: 'Could not find auth user, please use OTP'
            }
        }

        const actualEmail = authUser.user.email
        const tempPassword = `m2m_${Date.now()}_${Math.random().toString(36).slice(2)}`

        // Update user's password for this session
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(profile.id, {
            password: tempPassword,
            email_confirm: true
        })

        if (updateError) {
            console.error('Failed to update user password:', updateError)
            // Fall back to OTP if we can't auto-auth
            return {
                exists: true,
                requiresOtp: true,
                message: 'Could not auto-authenticate, please use OTP'
            }
        }

        console.log(`[Auto-Auth] Seeded user ${profile.display_name} (${phone}) auto-authenticated for vibe check with email ${actualEmail}`)

        return {
            exists: true,
            requiresOtp: false,
            email: actualEmail,
            password: tempPassword,
            displayName: profile.display_name,
            message: 'Welcome back! Continue with your vibe check.'
        }

    } catch (error: any) {
        console.error('Check existing user error:', error)
        // On any error, fall back to OTP
        return {
            exists: false,
            requiresOtp: true
        }
    }
})
