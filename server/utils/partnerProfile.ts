/**
 * A match's profile as the other person may receive it. Removes fields that are for our team
 * or for matching only: admin notes, trust score, genotype (used only to rule out risky pairs,
 * never shown), referral details and internal flags.
 */
const PRIVATE_FIELDS = [
    'admin_notes', 'trust_score', 'genotype', 'telegram_id', 'weekly_opt_in_until',
    'referral_code', 'referred_by', 'has_used_free_unlock', 'welcomed_at', 'vibe_check_required',
] as const

export const toPartnerProfile = <T extends Record<string, any>>(p: T): Omit<T, typeof PRIVATE_FIELDS[number]> => {
    const out: Record<string, any> = { ...p }
    for (const key of PRIVATE_FIELDS) delete out[key]
    return out as any
}
