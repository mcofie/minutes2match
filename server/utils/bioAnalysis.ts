import { extractPreferencesFromBio, buildBioEmbeddings } from './ai'

/**
 * Reads a member's bio with AI: the traits they describe and look for (preferences_extracted)
 * and the vectors used to compare bios by meaning (bio_embeddings). Saves both.
 * Returns 'skipped' when there's no usable bio, 'failed' when AI couldn't read it.
 */
export const analyseMemberBio = async (db: any, profile: { id: string; about_me?: string | null }) => {
  const bio = (profile.about_me || '').trim()
  if (bio.length < 10) return 'skipped' as const

  const extracted = await extractPreferencesFromBio(bio)
  if (!extracted) return 'failed' as const

  const embeddings = await buildBioEmbeddings(bio, extracted)
  const update: Record<string, any> = { preferences_extracted: extracted }
  if (embeddings) update.bio_embeddings = embeddings

  let { error } = await db.from('profiles').update(update).eq('id', profile.id)
  // 42703: bio_embeddings column missing (migration 076 not run); keep the extracted traits anyway
  if (error?.code === '42703' && update.bio_embeddings) {
    delete update.bio_embeddings
    ;({ error } = await db.from('profiles').update(update).eq('id', profile.id))
  }
  if (error) {
    console.error(`[Bio analysis] Save failed for ${profile.id}:`, error)
    return 'failed' as const
  }
  return 'analysed' as const
}
