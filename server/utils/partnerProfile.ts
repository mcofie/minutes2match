/**
 * A match's profile as the other person may receive it. Removes fields that are for our team
 * or for matching only: admin notes, trust score, genotype (used only to rule out risky pairs,
 * never shown), referral details and internal flags. The birth date is replaced by one that
 * only gives away their age (the Privacy Policy promises matches see your age, not your birthday).
 */
const PRIVATE_FIELDS = [
    'admin_notes', 'trust_score', 'genotype', 'telegram_id', 'weekly_opt_in_until',
    'referral_code', 'referred_by', 'has_used_free_unlock', 'welcomed_at', 'vibe_check_required',
] as const

/** Age in whole years today */
const ageOn = (birth: Date, today: Date) => {
    let age = today.getUTCFullYear() - birth.getUTCFullYear()
    const m = today.getUTCMonth() - birth.getUTCMonth()
    if (m < 0 || (m === 0 && today.getUTCDate() < birth.getUTCDate())) age--
    return age
}

/**
 * A stand-in birth date that gives the same age today, so the page can show "29" and score the
 * age gap without the real birthday ever leaving the server: today's date, `age` years ago, minus a day.
 */
export const ageOnlyBirthDate = (birthDate?: string | null, today = new Date()): string | null => {
    if (!birthDate) return null
    const birth = new Date(birthDate)
    if (Number.isNaN(birth.getTime())) return null
    const age = ageOn(birth, today)
    const stand = new Date(Date.UTC(today.getUTCFullYear() - age, today.getUTCMonth(), today.getUTCDate() - 1))
    return stand.toISOString().slice(0, 10)
}

export const toPartnerProfile = <T extends Record<string, any>>(p: T): Omit<T, typeof PRIVATE_FIELDS[number]> => {
    const out: Record<string, any> = { ...p }
    for (const key of PRIVATE_FIELDS) delete out[key]
    if ('birth_date' in out) out.birth_date = ageOnlyBirthDate(out.birth_date)
    return out as any
}
