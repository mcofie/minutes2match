/**
 * Passkey Login Options API
 * GET /api/auth/passkey/login-options
 * 
 * Generates WebAuthn options for a user to log in with a passkey.
 * Uses 'discoverable' credentials (empty allowCredentials) so the browser
 * shows all passkeys for this domain.
 */
export default defineEventHandler(async (event) => {
    const {
        generateAuthenticationOptions,
        storeChallenge
    } = usePasskeyUtils()

    // 1. Generate authentication options
    const options = await generateAuthenticationOptions({
        userVerification: 'required', // Require biometrics
        // Empty allowCredentials means the browser will show all available passkeys
        // this is what makes it 'One-Tap Login'
    })

    // 2. Store the challenge securely in DB (not linked to a user yet)
    await storeChallenge(options.challenge)

    // 3. Return options to the client
    return options
})
