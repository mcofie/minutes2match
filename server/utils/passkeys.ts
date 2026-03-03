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

        return data.map(dbKey => ({
            id: dbKey.credential_id,
            publicKey: decodePublicKey(dbKey.public_key),
            counter: Number(dbKey.counter),
            transports: dbKey.transports as any
        }))
    }

    /**
     * Decode public key from DB storage format (base64 TEXT or hex BYTEA)
     */
    const decodePublicKey = (pkData: any): Uint8Array => {
        if (!pkData) return new Uint8Array()
        if (pkData instanceof Uint8Array || pkData instanceof Buffer) {
            return new Uint8Array(pkData)
        }
        if (typeof pkData === 'string') {
            // Check if it's hex-encoded BYTEA (\\x prefix)
            if (pkData.startsWith('\\x') || pkData.startsWith('\\\\x')) {
                const hexStr = pkData.replace(/^\\\\x|^\\x/, '')
                return new Uint8Array(Buffer.from(hexStr, 'hex'))
            }
            // Otherwise treat as base64
            return new Uint8Array(Buffer.from(pkData, 'base64'))
        }
        return new Uint8Array()
    }

    /**
     * Insert a passkey by completely bypassing PostgREST for user_id.
     * PostgREST strips user_id from ALL ops (insert, update, rpc) when FK to auth.users.
     * Solution: Insert without user_id, then use a SECURITY DEFINER function
     * that runs raw SQL inside Postgres to set it.
     */
    const adminInsertPasskey = async (data: {
        user_id: string
        credential_id: string
        public_key: string
        counter: number
        transports: string[]
        name: string
    }) => {
        // Step 1: Insert without user_id
        const { data: inserted, error: insertError } = await supabaseAdmin
            .schema('m2m')
            .from('user_passkeys')
            .insert({
                credential_id: data.credential_id,
                public_key: data.public_key,
                counter: data.counter,
                transports: data.transports,
                name: data.name
            })
            .select()
            .single()

        if (insertError || !inserted) {
            console.error('[Passkey] Insert failed:', insertError?.message)
            return { data: null, error: insertError }
        }

        console.log('[Passkey] Row inserted, id:', inserted.id, '— setting owner via RPC...')

        // Step 2: Use RPC to set user_id via raw SQL (bypasses PostgREST filtering)
        // p_passkey_id is FK to user_passkeys (not auth.users) so PostgREST won't strip it
        // p_owner is TEXT so PostgREST won't detect it as a UUID FK
        const { error: rpcError } = await supabaseAdmin
            .schema('m2m')
            .rpc('set_passkey_owner', {
                p_passkey_id: inserted.id,
                p_owner: data.user_id
            })

        if (rpcError) {
            console.error('[Passkey] set_passkey_owner RPC failed:', rpcError.message)
            // Clean up orphan
            await supabaseAdmin.schema('m2m').from('user_passkeys').delete().eq('id', inserted.id)
            return { data: null, error: rpcError }
        }

        console.log('[Passkey] Owner set successfully!')
        return { data: { ...inserted, user_id: data.user_id }, error: null }
    }

    /**
     * Fallback: force-set user_id via direct update
     */
    const adminFixPasskeyUserId = async (passkeyId: string, userId: string) => {
        const { error } = await supabaseAdmin
            .schema('m2m')
            .from('user_passkeys')
            .update({ user_id: userId })
            .eq('id', passkeyId)

        if (error) {
            console.error('[Passkey] Failed to fix user_id:', error.message)
        } else {
            console.log('[Passkey] user_id fixed successfully')
        }
    }

    return {
        rpID,
        RP_NAME,
        origin,
        supabaseAdmin,
        storeChallenge,
        popChallenge,
        getUserPasskeys,
        adminInsertPasskey,
        adminFixPasskeyUserId,
        decodePublicKey,

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
