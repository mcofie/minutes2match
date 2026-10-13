import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Check a one-time code and use it up. Shared by sign-up, login and the other OTP checks.
 *
 * Wrong tries are counted per code in the database (not in server memory), so the limit holds
 * across every serverless instance: after MAX_OTP_ATTEMPTS wrong tries all of the phone's codes
 * are burned and a new one has to be requested. Any live code for the phone is accepted, so a
 * backup SMS doesn't invalidate the first one.
 *
 * Throws an H3 error with a message that's safe to show the member.
 */
export const MAX_OTP_ATTEMPTS = 5

export async function consumeOtp(admin: SupabaseClient, phone: string, code: string): Promise<void> {
    const db = admin.schema('m2m') as any
    const cleanCode = String(code || '').replace(/\D/g, '')
    if (cleanCode.length !== 6) {
        throw createError({ statusCode: 400, message: 'Enter the 6-digit code we sent you.' })
    }

    const { data: active, error } = await db
        .from('otp_codes')
        .select('id, code, attempts')
        .eq('phone', phone)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
    if (error) throw createError({ statusCode: 500, message: "We couldn't check your code. Please try again." })

    const codes: { id: string; code: string; attempts: number }[] = active || []
    if (!codes.length) {
        throw createError({ statusCode: 410, message: 'That code can no longer be used. Tap “Resend code” to get a new one.' })
    }

    const tries = Math.max(...codes.map(c => c.attempts || 0))
    if (tries >= MAX_OTP_ATTEMPTS) {
        await db.from('otp_codes').update({ used: true }).eq('phone', phone)
        throw createError({ statusCode: 429, message: 'Too many wrong tries. Tap “Resend code” to get a new one.' })
    }

    const match = codes.find(c => c.code === cleanCode)
    if (!match) {
        const next = tries + 1
        // Count the miss against every live code for this phone; burn them on the last try
        await Promise.all(codes.map(c => db.from('otp_codes')
            .update({ attempts: next, ...(next >= MAX_OTP_ATTEMPTS ? { used: true } : {}) })
            .eq('id', c.id)))
        const left = MAX_OTP_ATTEMPTS - next
        throw createError({
            statusCode: left > 0 ? 401 : 429,
            message: left > 0
                ? `That code isn't right. ${left} ${left === 1 ? 'try' : 'tries'} left.`
                : 'Too many wrong tries. Tap “Resend code” to get a new one.',
        })
    }

    // Right code: use up every code for this phone so none can be replayed
    const { error: useError } = await db.from('otp_codes').update({ used: true }).eq('phone', phone)
    if (useError) throw createError({ statusCode: 500, message: "We couldn't finish verifying. Please try again." })
}
