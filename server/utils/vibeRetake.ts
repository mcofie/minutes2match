/**
 * Vibe Check v2 retake: members flagged with profiles.vibe_check_required are sent back
 * through the Vibe Check when they log in. The flag clears itself once they save a v2
 * answer (see migration 075).
 *
 * Reads the flag on its own so a database without migration 075 still logs people in.
 */
export const isVibeRetakeRequired = async (supabaseAdmin: any, userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabaseAdmin
      .schema('m2m')
      .from('profiles')
      .select('vibe_check_required')
      .eq('id', userId)
      .maybeSingle()
    if (error) return false
    return !!data?.vibe_check_required
  } catch {
    return false
  }
}
