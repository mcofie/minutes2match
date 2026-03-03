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
    const { registration, challenge: clientChallenge, name } = body // registration is RegistrationResponseJSON

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
        requireUserVerification: true // Require biometrics
    })

    if (verification.verified && verification.registrationInfo) {
        // SimpleWebAuthn v13 nests credential info under a 'credential' object
        const info = verification.registrationInfo as any
        const credential = info.credential || info

        const credentialID = credential.id || credential.credentialID
        const credentialPublicKey = credential.publicKey || credential.credentialPublicKey
        const counter = credential.counter
        const transports = credential.transports

        const supabase = serverSupabaseServiceRole<M2MDatabase>(event)

        // 5. Store the new passkey
        const { error } = await supabase
            .schema('m2m')
            .from('user_passkeys')
            .insert({
                user_id: user.id,
                credential_id: registration.id, // Store encoded ID for login search
                public_key: Buffer.from(credentialPublicKey), // Store COSE public key bytes
                counter: Number(counter !== undefined ? counter : 0),
                transports: transports || [],
                name: name || 'Passkey'
            })

        if (error) {
            console.error('Error storing passkey:', error)
            throw createError({
                statusCode: 500,
                message: error.message || 'Failed to save passkey to database'
            })
        }

        return { success: true }
    }

    throw createError({ statusCode: 400, message: 'Passkey verification failed' })
})
