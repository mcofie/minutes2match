import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse
} from '@simplewebauthn/server'
import type {
    RegistrationResponseJSON,
    AuthenticationResponseJSON,
} from '@simplewebauthn/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Passkey Configuration
 */
const getRPID = () => {
    const config = useRuntimeConfig()
    const baseUrl = config.public?.baseUrl || 'http://localhost:3000'
    try {
        const url = new URL(baseUrl)
        return url.hostname
    } catch (e) {
        return 'localhost'
    }
}

const RP_NAME = 'Minutes 2 Match'

/**
 * Passkey Utilities
 */
export const usePasskeyUtils = () => {
    const config = useRuntimeConfig()
    const rpID = getRPID()
    const origin = config.public?.baseUrl || 'http://localhost:3000'

    // Initialize Supabase Admin for sensitive operations
    const supabaseAdmin = createClient(
        config.supabaseUrl || process.env.SUPABASE_URL || '',
        config.supabaseServiceKey || process.env.SUPABASE_SECRET_KEY || '',
        { auth: { persistSession: false } }
    )

    /**
     * Store a challenge for later verification
     */
    const storeChallenge = async (challenge: string, userId?: string) => {
        const { error } = await supabaseAdmin
            .schema('m2m')
            .from('auth_challenges')
            .insert({
                user_id: userId,
                challenge,
                origin,
                expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 mins
            })

        if (error) throw new Error(`Failed to store challenge: ${error.message}`)
    }

    /**
     * Retrieve and delete a challenge
     */
    const popChallenge = async (challenge: string, userId?: string) => {
        const query = supabaseAdmin
            .schema('m2m')
            .from('auth_challenges')
            .delete()
            .eq('challenge', challenge)
            .gt('expires_at', new Date().toISOString())

        if (userId) query.eq('user_id', userId)

        const { data, error } = await query.select().maybeSingle()

        if (error || !data) return null
        return data
    }

    /**
     * Get user's registered passkeys
     */
    const getUserPasskeys = async (userId: string): Promise<any[]> => {
        const { data, error } = await supabaseAdmin
            .schema('m2m')
            .from('user_passkeys')
            .select('*')
            .eq('user_id', userId)

        if (error || !data) return []

        // Return in v13 WebAuthnCredential shape: { id, publicKey, counter, transports }
        return data.map(dbKey => {
            let publicKeyBytes: Uint8Array
            const pkData = dbKey.public_key
            if (typeof pkData === 'string') {
                const hexStr = pkData.replace(/^\\\\x|^\\x/, '')
                publicKeyBytes = new Uint8Array(Buffer.from(hexStr, 'hex'))
            } else {
                publicKeyBytes = new Uint8Array(pkData)
            }

            return {
                id: dbKey.credential_id,       // Base64URL string
                publicKey: publicKeyBytes,      // Uint8Array
                counter: Number(dbKey.counter),
                transports: dbKey.transports as any
            }
        })
    }

    return {
        rpID,
        RP_NAME,
        origin,
        storeChallenge,
        popChallenge,
        getUserPasskeys,

        // Expose SimpleWebAuthn methods with pre-filled config
        generateRegistrationOptions: (options: any) => generateRegistrationOptions({
            rpName: RP_NAME,
            rpID,
            ...options
        }),

        verifyRegistrationResponse: (options: any) => verifyRegistrationResponse({
            expectedRPID: rpID,
            expectedOrigin: origin,
            ...options
        }),

        generateAuthenticationOptions: (options: any) => generateAuthenticationOptions({
            rpID,
            ...options
        }),

        verifyAuthenticationResponse: (options: any) => verifyAuthenticationResponse({
            expectedRPID: rpID,
            expectedOrigin: origin,
            ...options
        })
    }
}
