import { useToast } from '~/composables/useToast'

export type HelloApp = 'whatsapp' | 'instagram' | 'snapchat'
export const HELLO_APP_NAME: Record<HelloApp, string> = { whatsapp: 'WhatsApp', instagram: 'Instagram', snapchat: 'Snapchat' }

/** How to reach a match: their preferred app if they've filled it in, else WhatsApp on their phone */
export const contactFor = (p: any): { app: HelloApp; url: string } | null => {
  if (!p) return null
  const method = p.preferred_contact_method || 'phone'
  const handle = (h?: string | null) => String(h || '').trim().replace(/^@/, '')
  if (method === 'instagram' && handle(p.instagram_handle)) return { app: 'instagram', url: `https://instagram.com/${handle(p.instagram_handle)}` }
  if (method === 'snapchat' && handle(p.snapchat_handle)) return { app: 'snapchat', url: `https://snapchat.com/add/${handle(p.snapchat_handle)}` }
  if (p.phone) return { app: 'whatsapp', url: `https://wa.me/${String(p.phone).replace(/\D/g, '')}` }
  return null
}

/** What tapping "Say hello" will do, in a line */
export const helloHintFor = (p: any, firstName: string) => {
  const c = contactFor(p)
  if (!c) return `${firstName} hasn't added a way to reach them yet.`
  return c.app === 'whatsapp' ? 'Opens WhatsApp with a message ready to send.' : `Copies a first message and opens ${HELLO_APP_NAME[c.app]}.`
}

const helloKey = (matchId: string) => `m2m_said_hello_${matchId}`
export const hasSaidHello = (matchId: string) => {
  try { return localStorage.getItem(helloKey(matchId)) === '1' } catch { return false }
}

/**
 * Open the match's app with a first message: WhatsApp takes it pre-filled; Instagram and Snapchat
 * can't, so it's copied for pasting. Returns false when there's no way to reach them yet.
 */
export const useSayHello = () => {
  const toast = useToast()
  return async (p: any, firstName: string, message: string, matchId?: string) => {
    const c = contactFor(p)
    if (!c) {
      toast.info(`No way to reach ${firstName} yet`, "They haven't added a phone number or handle yet. Check back soon.")
      return false
    }
    let url = c.url
    if (c.app === 'whatsapp') {
      url += `?text=${encodeURIComponent(message)}`
    } else {
      try {
        await navigator.clipboard.writeText(message)
        toast.success('Message copied', `Paste it into ${HELLO_APP_NAME[c.app]} to say hello.`)
      } catch { /* clipboard blocked: still open the app */ }
    }
    window.open(url, '_blank', 'noopener')
    if (matchId) try { localStorage.setItem(helloKey(matchId), '1') } catch { /* private mode */ }
    return true
  }
}
