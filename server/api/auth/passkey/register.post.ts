/**
 * Passkey Registration Verification API
 * POST /api/auth/passkey/register
 * 
 * Verifies the registration response from the browser and stores the public key.
 */
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { M2MDatabase } from '~/types/database.types'

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

    // 5. Extract credential from the v13 response shape:
    //    registrationInfo.credential = { id, publicKey, counter, transports }
    const { credential } = verification.registrationInfo

    console.log('[Passkey] Registration verified. Credential ID:', credential.id)

    const supabase = serverSupabaseServiceRole<M2MDatabase>(event)

    // 6. Convert publicKey (Uint8Array) to a hex string for BYTEA storage
    const publicKeyHex = '\\x' + Buffer.from(credential.publicKey).toString('hex')

    // 7. Store the new passkey
    const { error } = await supabase
        .schema('m2m')
        .from('user_passkeys')
        .insert({
            user_id: user.id,
            credential_id: credential.id,  // Base64URL string — same as what browser sends during login
            public_key: publicKeyHex,       // Hex-encoded for BYTEA column
            counter: credential.counter ?? 0,
            transports: credential.transports || [],
            name: name || 'Passkey'
        })

    if (error) {
        console.error('[Passkey] Error storing passkey:', error)
        throw createError({
            statusCode: 500,
            message: error.message || 'Failed to save passkey to database'
        })
    }

    return { success: true }
})
