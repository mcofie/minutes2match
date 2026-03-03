/**
 * Passkey Registration Options API
 * GET /api/auth/passkey/register-options
 * 
 * Generates WebAuthn options for a logged-in user to register a new passkey.
 * Returns challenge that MUST be stored and compared later.
 */
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    // 1. Verify user is authenticated
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const {
        rpID,
        RP_NAME,
        generateRegistrationOptions,
        storeChallenge,
        getUserPasskeys
    } = usePasskeyUtils()

    // 2. Fetch user's current passkeys to avoid duplicates
    const existingPasskeys = await getUserPasskeys(user.id)

    // 3. Generate registration options
    const options = await generateRegistrationOptions({
        userName: user.email || user.id,
        userDisplayName: user.user_metadata?.display_name || user.email || user.user_metadata?.phone || 'User',
        userID: user.id,
        // Exclude credentials they already have to prevent duplicate registration on same device
        excludeCredentials: existingPasskeys.map(pk => ({
            id: pk.credentialID,
            type: 'public-key'
        }))
    })

    // 4. Store the challenge securely in DB linked to the user
    // We'll need to retrieve this in the POST /register call
    await storeChallenge(options.challenge, user.id)

    // 5. Return options to the client
    return options
})
