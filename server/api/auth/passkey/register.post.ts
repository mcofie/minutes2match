/**
 * Passkey Registration Verification API
 * POST /api/auth/passkey/register
 * 
 * Verifies the registration response from the browser and stores the public key.
 */
import { serverSupabaseUser } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    // 1. Verify user is authenticated
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    // 2. Parse request body
    const body = await readBody(event)
    const { registration, challenge: clientChallenge, name } = body

    if (!registration) {
        throw createError({ statusCode: 400, message: 'Registration response is required' })
    }

    const {
        verifyRegistrationResponse,
        popChallenge,
        origin,
        rpID
    } = usePasskeyUtils()

    // 3. Fetch and delete the stored challenge for this user
    const challenge = await popChallenge(clientChallenge, user.id)
    if (!challenge) {
        throw createError({ statusCode: 400, message: 'Invalid or expired registration challenge. Please try again.' })
    }

    // 4. Verify the registration response
    const verification = await verifyRegistrationResponse({
        response: registration,
        expectedChallenge: challenge.challenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        requireUserVerification: true
    })

    if (!verification.verified || !verification.registrationInfo) {
        throw createError({ statusCode: 400, message: 'Passkey verification failed' })
    }

    // 5. Extract credential from the v13 response shape
    const { credential } = verification.registrationInfo

    console.log('[Passkey] Registration verified. Credential ID:', credential.id, 'User ID:', user.id)

    // 6. Use an untyped admin client to ensure all columns are written
    //    (The M2MDatabase type doesn't include user_passkeys, causing typed clients to strip fields)
    const config = useRuntimeConfig()
    const supabaseAdmin = createClient(
        config.supabaseUrl || process.env.SUPABASE_URL || '',
        config.supabaseServiceKey || process.env.SUPABASE_SECRET_KEY || '',
        { auth: { persistSession: false } }
    )

    // 7. Convert publicKey (Uint8Array) to a hex string for BYTEA storage
    const publicKeyHex = '\\x' + Buffer.from(credential.publicKey).toString('hex')

    // 8. Store the new passkey
    const insertData = {
        user_id: user.id,
        credential_id: credential.id,
        public_key: publicKeyHex,
        counter: credential.counter ?? 0,
        transports: credential.transports || [],
        name: name || 'Passkey'
    }
    console.log('[Passkey] Inserting passkey with user_id:', insertData.user_id)

    const { data: inserted, error } = await supabaseAdmin
        .schema('m2m')
        .from('user_passkeys')
        .insert(insertData)
        .select('id, user_id, credential_id')
        .single()

    if (error) {
        console.error('[Passkey] Error storing passkey:', error)
        throw createError({
            statusCode: 500,
            message: error.message || 'Failed to save passkey to database'
        })
    }

    console.log('[Passkey] Passkey saved successfully:', inserted)

    return { success: true }
})
