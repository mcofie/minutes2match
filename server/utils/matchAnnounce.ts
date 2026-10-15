import { generateMatchExplanation } from './ai'
import { notifyUser } from './notify'

/**
 * After a match is created: write the "why you two" note (if there isn't one) and tell both people.
 * Used by the weekly run, on-the-spot matching and admin introductions so everyone gets the same treatment.
 * Never throws; failures are logged so one bad notification doesn't stop the rest.
 */
export const announceMatch = async (
  db: any,
  match: { id: string; user_1_id: string; user_2_id: string; match_score?: number | null; match_reasons?: string[] | null; ai_analysis?: string | null },
  people?: { user1?: any; user2?: any }
) => {
  let user1 = people?.user1
  let user2 = people?.user2
  if (!user1 || !user2) {
    const { data } = await db.from('profiles').select('*').in('id', [match.user_1_id, match.user_2_id])
    user1 = user1 || data?.find((p: any) => p.id === match.user_1_id)
    user2 = user2 || data?.find((p: any) => p.id === match.user_2_id)
  }
  if (!user1 || !user2) {
    console.error('[Announce] Missing profiles for match', match.id)
    return { notified: 0 }
  }

  if (!match.ai_analysis) {
    try {
      const note = await generateMatchExplanation(user1, user2, match.match_score || 0, match.match_reasons || [])
      if (note) await db.from('matches').update({ ai_analysis: note }).eq('id', match.id)
    } catch (e) {
      console.error('[Announce] Explanation failed for match', match.id, e)
    }
  }

  const firstName = (u: any) => (u.display_name || '').split(' ')[0] || 'there'
  const messageFor = (me: any, them: any) =>
    `Hi ${firstName(me)}! Your Minutes 2 Match introduction this week is ${firstName(them)}. Open the app to see why we think you two fit.`

  let notified = 0
  for (const [me, them, priority] of [[user1, user2, 'high'], [user2, user1, 'normal']] as const) {
    try {
      await notifyUser(me.id, messageFor(me, them), { type: 'match', matchId: match.id, smsPriority: priority })
      notified++
    } catch (e) {
      console.error('[Announce] Notify failed for', me.id, e)
    }
  }
  return { notified }
}
