/**
 * Passkey Login Verification API
 * POST /api/auth/passkey/login
 * 
 * Verifies the authentication signature from the browser and logs the user in.
 */
import { serverSupabaseServiceRole } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'
import type { M2MDatabase } from '~/types/database.types'

export default defineEventHandler(async (event) => {
    // Parse request body
    const body = await readBody(event)
    const { authentication, challenge: clientChallenge } = body // authentication is AuthenticationResponseJSON

    if (!authentication) {
        throw createError({ statusCode: 400, message: 'Authentication response is required' })
    }

    const {
        verifyAuthenticationResponse,
        popChallenge,
        origin,
        rpID
    } = usePasskeyUtils()
    const config = useRuntimeConfig()

    // Create admin client
    const supabaseAdmin = createClient(
        config.supabaseUrl || process.env.SUPABASE_URL || '',
        config.supabaseServiceKey || '',
        { auth: { persistSession: false } }
    )

    // 1. Fetch and delete the stored challenge
    const challenge = await popChallenge(clientChallenge)
    if (!challenge) {
        throw createError({ statusCode: 400, message: 'Invalid or expired login challenge. Please try again.' })
    }

    // 2. Find the user's public key in DB by the credential ID
    const { data: dbPasskey, error: dbError } = await supabaseAdmin
        .schema('m2m')
        .from('user_passkeys')
        .select('*')
        .eq('credential_id', authentication.id)
        .single()

    if (dbError || !dbPasskey) {
        console.error('[Passkey] Credential lookup failed:', {
            id: authentication.id,
            error: dbError
        })
        throw createError({ statusCode: 401, message: 'This passkey is not recognized. Please sign in with OTP first.' })
    }

    // 3. Verify the authentication response
    const verification = await verifyAuthenticationResponse({
        response: authentication,
        expectedChallenge: challenge.challenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        authenticator: {
            credentialID: Buffer.from(dbPasskey.credential_id, 'base64url'),
            credentialPublicKey: dbPasskey.public_key, // ByteA comes back as Buffer in Node
            counter: Number(dbPasskey.counter),
            transports: dbPasskey.transports
        },
        requireUserVerification: true // Require biometrics
    })

    if (!verification.verified) {
        throw createError({ statusCode: 401, message: 'Passkey verification failed' })
    }

    // 4. Update safety counter in DB to prevent replay
    const { newCounter } = verification.authenticationInfo
    await supabaseAdmin
        .schema('m2m')
        .from('user_passkeys')
        .update({
            counter: Number(newCounter),
            last_used_at: new Date().toISOString()
        })
        .eq('id', dbPasskey.id)

    // 5. SUCCESS! 
    // Now perform the identical "Session Bridge" logic from the OTP login
    const userId = dbPasskey.user_id

    try {
        // Fetch user metadata for response
        const { data: profile } = await supabaseAdmin
            .schema('m2m')
            .from('profiles')
            .select('id, phone, display_name, gender, intent, interested_in')
            .eq('id', userId)
            .single()

        // Get the auth user email
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId)
        if (authError || !authData.user) {
            throw createError({ statusCode: 404, message: 'Linked account not found' })
        }

        // Check vibe check status (same logic as login.post.ts)
        const { count: vibeAnswerCount } = await supabaseAdmin
            .schema('m2m')
            .from('vibe_answers')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)

        const hasCompletedVibeCheck = !!(
            profile?.gender &&
            profile?.intent &&
            profile?.interested_in &&
            vibeAnswerCount && vibeAnswerCount > 0
        )

        // Create a new session for this user
        const tempPassword = `passkey_${Date.now()}_${Math.random().toString(36).slice(2)}`
        await supabaseAdmin.auth.admin.updateUserById(userId, {
            password: tempPassword,
            email_confirm: true
        })

        // Send Discord notification for passkey login
        try {
            const { notifyUserLogin } = await import('~/server/utils/discord')
            await notifyUserLogin({
                phone: profile?.phone || 'Unknown',
                displayName: profile?.display_name || 'Passkey User',
                isNewUser: false,
                method: 'passkey'
            })
        } catch (discordError) {
            console.error('[Passkey] Discord notification error:', discordError)
        }

        // Return credentials for client-side sign in
        return {
            success: true,
            email: authData.user.email,
            password: tempPassword,
            displayName: profile?.display_name,
            hasCompletedVibeCheck
        }
    } catch (err: any) {
        console.error('Passkey session error:', err)
        throw createError({ statusCode: 500, message: 'Failed to build secure session after passkey check' })
    }
})
