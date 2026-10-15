/**
 * Instagram and Snapchat handles as members typed them: "@ama.k", a pasted profile link,
 * or sometimes their name ("Nhaa Amanua"), which isn't a username at all.
 */
export type SocialApp = 'instagram' | 'snapchat'

// Instagram: letters, numbers, full stops and underscores, up to 30.
// Snapchat: 3–15, starts with a letter; letters, numbers, - _ and full stops.
const VALID: Record<SocialApp, RegExp> = {
  instagram: /^[A-Za-z0-9._]{1,30}$/,
  snapchat: /^[A-Za-z][A-Za-z0-9._-]{2,14}$/,
}

/** Strip the @, spaces at the ends and any pasted link: "https://instagram.com/ama.k/?hl=en" -> "ama.k" */
export const cleanHandle = (raw?: string | null): string => {
  let h = String(raw || '').trim()
  const link = h.match(/(?:instagram\.com|snapchat\.com\/add)\/([^/?#\s]+)/i)
  if (link) h = link[1]
  return h.replace(/^@+/, '').trim()
}

export const isValidHandle = (app: SocialApp, raw?: string | null) => VALID[app].test(cleanHandle(raw))

/**
 * Where "Say hello" should go. A real username opens the profile; anything else (like a name)
 * opens a search for it on Instagram, or for Snapchat (which has no search link) nothing.
 */
export const socialLink = (app: SocialApp, raw?: string | null): { url: string; handle: string; exact: boolean } | null => {
  const handle = cleanHandle(raw)
  if (!handle) return null
  if (VALID[app].test(handle)) {
    return {
      url: app === 'instagram' ? `https://www.instagram.com/${handle}` : `https://www.snapchat.com/add/${handle}`,
      handle,
      exact: true,
    }
  }
  if (app === 'instagram') return { url: `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(handle)}`, handle, exact: false }
  return { url: 'https://www.snapchat.com/', handle, exact: false }
}
