/**
 * Passkey Login Verification API
 * POST /api/auth/passkey/login
 * 
 * Verifies the authentication signature from the browser and logs the user in.
 */
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    // Parse request body
    const body = await readBody(event)
    const { authentication, challenge: clientChallenge } = body

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

    // 2. Find the user's passkey in DB by the credential ID
    //    authentication.id is a Base64URL string — must match what we stored during registration
    console.log('[Passkey] Looking up credential_id:', authentication.id)

    // First, let's see ALL stored passkeys for debugging
    const { data: allPasskeys } = await supabaseAdmin
        .schema('m2m')
        .from('user_passkeys')
        .select('id, credential_id, user_id, name')
    console.log('[Passkey] All stored passkeys:', JSON.stringify(allPasskeys?.map(p => ({
        id: p.id,
        credential_id: p.credential_id,
        credential_id_length: p.credential_id?.length,
        user_id: p.user_id,
        name: p.name
    }))))

    const { data: dbPasskey, error: dbError } = await supabaseAdmin
        .schema('m2m')
        .from('user_passkeys')
        .select('*')
        .eq('credential_id', authentication.id)
        .single()

    if (dbError || !dbPasskey) {
        console.error('[Passkey] Credential lookup failed:', {
            searchId: authentication.id,
            searchIdLength: authentication.id?.length,
            error: dbError?.message,
            storedIds: allPasskeys?.map(p => p.credential_id)
        })
        throw createError({ statusCode: 401, message: 'This passkey is not recognized. Please sign in with OTP first.' })
    }

    // 3. Reconstruct the public key from BYTEA hex string
    //    PostgREST returns BYTEA as a hex string like "\\x0405abc..."
    let publicKeyBytes: Uint8Array
    const pkData = dbPasskey.public_key
    if (typeof pkData === 'string') {
        // Remove the \\x prefix and decode hex
        const hexStr = pkData.replace(/^\\\\x|^\\x/, '')
        publicKeyBytes = new Uint8Array(Buffer.from(hexStr, 'hex'))
    } else if (pkData instanceof Buffer || pkData instanceof Uint8Array) {
        publicKeyBytes = new Uint8Array(pkData)
    } else {
        console.error('[Passkey] Unknown public_key format:', typeof pkData)
        throw createError({ statusCode: 500, message: 'Stored credential is corrupted' })
    }

    // 4. Verify the authentication response using v13 API shape
    //    v13 uses `credential` (WebAuthnCredential) instead of `authenticator`
    const verification = await verifyAuthenticationResponse({
        response: authentication,
        expectedChallenge: challenge.challenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        credential: {
            id: dbPasskey.credential_id,    // Base64URL string
            publicKey: publicKeyBytes,       // Uint8Array
            counter: Number(dbPasskey.counter),
            transports: dbPasskey.transports
        },
        requireUserVerification: true
    })

    if (!verification.verified) {
        throw createError({ statusCode: 401, message: 'Passkey verification failed' })
    }

    // 5. Update safety counter in DB to prevent replay attacks
    const { newCounter } = verification.authenticationInfo
    await supabaseAdmin
        .schema('m2m')
        .from('user_passkeys')
        .update({
            counter: Number(newCounter),
            last_used_at: new Date().toISOString()
        })
        .eq('id', dbPasskey.id)

    // 6. SUCCESS — Build session via "Session Bridge" pattern (mirrors login.post.ts)
    const userId = dbPasskey.user_id
    console.log('[Passkey] Verified! Building session for user:', userId)

    try {
        // Step A: Fetch user profile
        const { data: profile, error: profileError } = await supabaseAdmin
            .schema('m2m')
            .from('profiles')
            .select('id, phone, display_name, gender, intent, interested_in')
            .eq('id', userId)
            .single()

        if (profileError) {
            console.error('[Passkey] Profile fetch error:', profileError.message)
        }

        // Step B: Get the auth user email
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId)
        if (authError || !authData.user) {
            console.error('[Passkey] Auth user lookup failed:', authError?.message)
            throw createError({ statusCode: 404, message: 'Linked account not found' })
        }

        // Step C: Check vibe check status
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

        // Step D: Create a temporary password for Supabase sign-in
        const tempPassword = `passkey_${Date.now()}_${Math.random().toString(36).slice(2)}`
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            password: tempPassword,
            email_confirm: true
        })

        if (updateError) {
            console.error('[Passkey] Password update error:', updateError.message)
            throw createError({ statusCode: 500, message: 'Failed to create login session' })
        }

        // Step E: Send Discord notification (non-blocking)
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

        console.log('[Passkey] Session bridge complete for:', authData.user.email)

        // Return credentials for client-side sign in
        return {
            success: true,
            email: authData.user.email,
            password: tempPassword,
            displayName: profile?.display_name,
            hasCompletedVibeCheck
        }
    } catch (err: any) {
        // Re-throw createError exceptions (they have statusCode)
        if (err.statusCode) throw err
        const realMessage = err.message || String(err)
        console.error('[Passkey] Session bridge error:', realMessage, err.stack || '')
        throw createError({ statusCode: 500, message: `Passkey session error: ${realMessage}` })
    }
})
