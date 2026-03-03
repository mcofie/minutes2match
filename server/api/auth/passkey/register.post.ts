/**
 * Passkey Registration Verification API
 * POST /api/auth/passkey/register
 * 
 * Verifies the registration response from the browser and stores the public key.
 */
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    // 1. Verify user is authenticated
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    console.log('[Passkey] Registration request from user:', user.id)

    // 2. Parse request body
    const body = await readBody(event)
    const { registration, challenge: clientChallenge, name } = body

    if (!registration) {
        throw createError({ statusCode: 400, message: 'Registration response is required' })
    }

    const utils = usePasskeyUtils()

    // 3. Fetch and delete the stored challenge for this user
    const challenge = await utils.popChallenge(clientChallenge, user.id)
    if (!challenge) {
        throw createError({ statusCode: 400, message: 'Invalid or expired registration challenge. Please try again.' })
    }

    // 4. Verify the registration response
    const verification = await utils.verifyRegistrationResponse({
        response: registration,
        expectedChallenge: challenge.challenge,
        expectedOrigin: utils.origin,
        expectedRPID: utils.rpID,
        requireUserVerification: true
    })

    if (!verification.verified || !verification.registrationInfo) {
        throw createError({ statusCode: 400, message: 'Passkey verification failed' })
    }

    // 5. Extract credential from the v13 response shape
    const { credential } = verification.registrationInfo

    console.log('[Passkey] Verification OK. credential.id:', credential.id, 'user.id:', user.id)

    // 6. Convert publicKey to base64 string (production schema has TEXT column, not BYTEA)
    const publicKeyBase64 = Buffer.from(credential.publicKey).toString('base64')

    // 7. Store the passkey using the SAME admin client from passkeys utils
    //    (This client is proven to work for auth_challenges inserts with user_id)
    const { data: inserted, error } = await utils.adminInsertPasskey({
        user_id: user.id,
        credential_id: credential.id,
        public_key: publicKeyBase64,
        counter: credential.counter ?? 0,
        transports: credential.transports || [],
        name: name || 'Passkey'
    })

    if (error) {
        console.error('[Passkey] Insert error:', error)
        throw createError({ statusCode: 500, message: error.message || 'Failed to save passkey' })
    }

    console.log('[Passkey] Saved! Verifying user_id:', inserted?.user_id)

    // Double-check user_id was stored
    if (!inserted?.user_id) {
        console.error('[Passkey] CRITICAL: user_id is null after insert! Fixing with update...')
        await utils.adminFixPasskeyUserId(inserted?.id, user.id)
    }

    return { success: true }
})
