/**
 * Matching is free and needs no acceptance: every new match is unlocked the
 * moment it's created, and both people are notified (contact details visible).
 * Spread into any m2m.matches insert.
 */
export const unlockedMatchFields = (now: string = new Date().toISOString()) => ({
  status: 'unlocked' as const,
  unlock_price: 0,
  unlocked_at: now,
  user_1_paid: true,
  user_2_paid: true,
  user_1_paid_at: now,
  user_2_paid_at: now,
  user_1_amount_paid: 0,
  user_2_amount_paid: 0,
  expires_at: null,
})
