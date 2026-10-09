import WebSocket from 'ws'

/**
 * @supabase/supabase-js 2.1xx needs the WebSocket that's built into Node 22+.
 * On an older runtime (Netlify functions can still run Node 20) every Supabase client
 * throws "native WebSocket not found" and every page returns a 500.
 * Provide one at server start so it works on any Node version.
 */
export default defineNitroPlugin(() => {
  if (typeof (globalThis as any).WebSocket === 'undefined') {
    ;(globalThis as any).WebSocket = WebSocket
  }
})
