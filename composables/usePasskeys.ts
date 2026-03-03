import {
    startRegistration,
    startAuthentication,
} from '@simplewebauthn/browser'

/**
 * Passkey Authentication Composable
 * Handles the browser-side FaceID/TouchID/Passkey flow
 */
export const usePasskeys = () => {
    const isSupported = ref(false)
    const isConditionalSupported = ref(false)

    onMounted(async () => {
        // Check if browser supports passkeys
        const hasWebAuthn = !!(typeof window !== 'undefined' && window.PublicKeyCredential)
        if (!hasWebAuthn) return

        isSupported.value = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()

        // Check for Conditional UI (autofill) support
        if (PublicKeyCredential.isConditionalMediationAvailable) {
            isConditionalSupported.value = await PublicKeyCredential.isConditionalMediationAvailable()
        }
    })

    /**
     * Register a new Passkey for a logged-in user
     */
    const register = async (deviceName?: string) => {
        if (!isSupported.value) {
            throw new Error('Your browser or device does not support Passkeys.')
        }

        try {
            // 1. Get registration options from our API
            const options = await $fetch('/api/auth/passkey/register-options') as any

            // 2. Trigger the native browser biometric prompt
            const registration = await startRegistration(options)

            // 3. Send the response back to our API for verification
            const result = await $fetch('/api/auth/passkey/register', {
                method: 'POST',
                body: {
                    registration,
                    challenge: options.challenge, // Pass original challenge back
                    name: deviceName || (navigator.userAgent.includes('iPhone') ? 'iPhone' :
                        navigator.userAgent.includes('Android') ? 'Android' :
                            'Computer')
                }
            })

            return result
        } catch (err: any) {
            console.error('[Passkey] Registration error:', err)
            // Handle specific WebAuthn errors
            if (err.name === 'NotAllowedError') {
                throw new Error('Passkey registration was cancelled.')
            } else if (err.name === 'InvalidStateError') {
                throw new Error('This device is already registered for this account.')
            }
            throw err
        }
    }

    /**
     * Login with a Passkey
     */
    const login = async (useBrowserAutofill = false) => {
        try {
            // 1. Get authentication options (discoverable)
            const options = await $fetch('/api/auth/passkey/login-options') as any

            // 2. Trigger the login (with optional conditional mediation for autofill)
            const authentication = await startAuthentication({
                ...options,
                mediation: useBrowserAutofill ? 'conditional' : 'optional'
            })

            // 3. Send the response back to our API for verification
            const credentials = await $fetch('/api/auth/passkey/login', {
                method: 'POST',
                body: {
                    authentication,
                    challenge: options.challenge // Pass original challenge back
                }
            }) as any

            // 4. Return the Supabase-bridge credentials for final sign-in
            return credentials
        } catch (err: any) {
            // Silence errors for quiet background autofill
            if (useBrowserAutofill) return null

            console.error('[Passkey] Login error:', err)
            if (err.name === 'NotAllowedError') {
                throw new Error('Passkey login was cancelled.')
            }
            throw err
        }
    }

    return {
        isSupported,
        isConditionalSupported,
        register,
        login
    }
}
