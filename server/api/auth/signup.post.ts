import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { enforceRateLimit } from '~/server/utils/rateLimiter'
import { consumeOtp } from '~/server/utils/otpCheck'

/**
 * POST /api/auth/signup
 *
 * Verifies the SMS code, creates (or re-links) the member's account and saves their Vibe Check.
 * It returns as soon as the account is saved; matching and the welcome messages run afterwards
 * in /api/auth/welcome, so a slow match run can never time this request out.
 */

const INTENTS = ['marriage', 'serious', 'casual', 'friendship']
const GENOTYPES = ['AA', 'AS', 'AC', 'SS']
const PHONE_OK = /^\+(233[25]\d{8}|254[17]\d{8})$/

const bad = (message: string) => createError({ statusCode: 400, message })
const text = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

const ageOn = (iso: string) => {
    const b = new Date(iso)
    if (Number.isNaN(b.getTime())) return -1
    const now = new Date()
    let age = now.getFullYear() - b.getFullYear()
    if (now.getMonth() < b.getMonth() || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())) age--
    return age
}

// The auth user for this phone's login email, wherever it is in the user list
async function findAuthUserByEmail(admin: SupabaseClient, email: string) {
    for (let page = 1; page <= 50; page++) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 })
        if (error) throw error
        const found = data.users.find(u => u.email === email)
        if (found) return found
        if (data.users.length < 1000) return null
    }
    return null
}

export default defineEventHandler(async (event) => {
    // Per-IP cap (best effort; the real guard is the per-code attempt limit in consumeOtp)
    enforceRateLimit(event, { maxRequests: 10, windowSeconds: 300, prefix: 'signup' })

    const body = await readBody(event) || {}
    const config = useRuntimeConfig()

    // ---------- validate everything before touching the database ----------
    const phone = normalizeGhanaPhone(String(body.phone || ''))
    if (!PHONE_OK.test(phone)) throw bad('Please enter a valid Ghana or Kenya mobile number.')
    if (!body.code) throw bad('Enter the 6-digit code we sent you.')

    const displayName = text(body.displayName, 40)
    if (displayName.length < 2) throw bad('Please tell us your first name.')
    if (!['male', 'female'].includes(body.gender)) throw bad('Please choose whether you are a man or a woman.')
    if (!['male', 'female', 'everyone'].includes(body.interestedIn)) throw bad('Please choose who you would like to meet.')
    if (!INTENTS.includes(body.intent)) throw bad('Please choose what you are looking for.')
    const age = ageOn(String(body.birthDate || ''))
    if (age < 18) throw bad('You need to be 18 or older to join.')
    if (age > 100) throw bad('Please check your birthday.')
    const location = text(body.location, 80)
    if (!location) throw bad('Please tell us where you are based.')

    const genotype = GENOTYPES.includes(body.genotype) ? body.genotype : null
    const religion = text(body.religion, 40) || null
    const occupation = text(body.occupation, 60) || null
    const heightCm = Number.isInteger(body.heightCm) && body.heightCm >= 120 && body.heightCm <= 230 ? body.heightCm : null
    const telegramId = body.telegramId ? String(body.telegramId).slice(0, 32) : null
    const photoUrl = typeof body.photoUrl === 'string' && /^https:\/\//.test(body.photoUrl) ? body.photoUrl.slice(0, 500) : null

    const vibeEntries: { question_key: string; answer_value: string; dimension: string | null }[] = []
    if (body.vibeAnswers && typeof body.vibeAnswers === 'object') {
        for (const [key, value] of Object.entries(body.vibeAnswers).slice(0, 60)) {
            if (!/^[a-z0-9_]{1,64}$/.test(key) || typeof value !== 'string' || value.length > 500) continue
            const dim = body.vibeDimensions?.[key]
            vibeEntries.push({ question_key: key, answer_value: value, dimension: typeof dim === 'string' ? dim.slice(0, 40) : null })
        }
    }

    const admin = createClient(config.supabaseUrl || process.env.SUPABASE_URL || '', config.supabaseServiceKey || '', { auth: { persistSession: false } })
    const db = admin.schema('m2m') as any

    // ---------- 1. the code (attempt-limited, single use) ----------
    await consumeOtp(admin, phone, String(body.code))

    try {
        // ---------- 2. the account: new, or re-linked if this phone has signed up before ----------
        const email = `${phone.replace(/\D/g, '')}@m2m.app`
        const password = `m2m_${crypto.randomUUID()}`
        let userId: string

        const { data: created, error: createErr } = await admin.auth.admin.createUser({
            email, password, email_confirm: true, user_metadata: { phone },
        })
        if (created?.user) {
            userId = created.user.id
        } else {
            const { data: byPhone } = await db.from('profiles').select('id').eq('phone', phone).maybeSingle()
            const existingId = byPhone?.id || (await findAuthUserByEmail(admin, email))?.id
            if (!existingId) {
                console.error('[Signup] createUser failed and no existing account found:', createErr?.message)
                throw createError({ statusCode: 500, message: "We couldn't create your account. Please try again." })
            }
            userId = existingId
            const { error: updErr } = await admin.auth.admin.updateUserById(userId, { password, email_confirm: true, user_metadata: { phone } })
            if (updErr) throw updErr
        }

        // ---------- 3. the profile: create, or fill in without wiping anything already there ----------
        const { data: existing } = await db.from('profiles').select('id').eq('id', userId).maybeSingle()
        const details: Record<string, any> = {
            phone, display_name: displayName, gender: body.gender, birth_date: body.birthDate, location,
            interested_in: body.interestedIn, intent: body.intent, is_verified: true,
        }
        // Optional details only overwrite when given: a returning member never loses their photo, faith, etc.
        for (const [k, v] of Object.entries({ genotype, religion, occupation, height_cm: heightCm, telegram_id: telegramId, photo_url: photoUrl })) {
            if (v !== null) details[k] = v
        }
        const { error: profileErr } = existing
            ? await db.from('profiles').update(details).eq('id', userId)
            : await db.from('profiles').insert({ id: userId, ...details })
        if (profileErr) throw profileErr

        // ---------- 4. the Vibe Check ----------
        if (vibeEntries.length) {
            const { error: vibeErr } = await db.from('vibe_answers')
                .upsert(vibeEntries.map(v => ({ user_id: userId, ...v })), { onConflict: 'user_id,question_key' })
            if (vibeErr) throw vibeErr
        }

        // ---------- 5. referral (never blocks sign-up) ----------
        const referralCode = text(body.referralCode, 32).toUpperCase()
        if (referralCode && !existing) {
            try {
                const { data: referrer } = await db.from('profiles').select('id').eq('referral_code', referralCode).maybeSingle()
                if (referrer && referrer.id !== userId) {
                    await db.from('profiles').update({ referred_by: referrer.id }).eq('id', userId)
                    await db.from('referrals').insert({ referrer_id: referrer.id, referred_id: userId, referral_code: referralCode, status: 'signed_up' })
                }
            } catch (refError) {
                console.error('[Signup] Referral tracking failed:', refError)
            }
        }

        // Credentials for the browser to sign in with; the follow-up work is /api/auth/welcome
        return { success: true, email, password, isNew: !existing }
    } catch (error: any) {
        console.error('[Signup] Failed:', error?.message || error)
        if (error?.statusCode) throw error
        throw createError({ statusCode: 500, message: "We couldn't finish setting up your account. Please try again." })
    }
})
