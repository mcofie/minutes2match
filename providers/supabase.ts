import { joinURL, withQuery } from 'ufo'
import type { ProviderGetImage } from '@nuxt/image'

// Inline defineProvider from @nuxt/image (needed for custom providers)
function defineProvider(setup: any) {
    let result: any
    return () => {
        if (result) {
            return result
        }
        result = typeof setup === 'function' ? setup() : setup
        return result
    }
}

const getImage: ProviderGetImage = (src, { modifiers = {}, baseURL = '' } = {} as any) => {
    // Guard against undefined/null src
    if (!src) {
        return { url: '' }
    }

    const { width, height, fit, quality, format } = modifiers as any

    // Handle local URLs or blobs (like logo-full.png or blobs)
    if (!src.includes('ziglffbvcexvwguqopqm.supabase.co')) {
        return { url: src }
    }

    // Use the render/image endpoint for transformations (fixes orientation)
    let path = src
    if (src.includes('/public/')) {
        path = src.split('/public/')[1]
    }

    return {
        url: withQuery(joinURL(baseURL as string, path), {
            width,
            height,
            resize: fit || 'cover',
            quality: quality || 80,
            format: format || 'webp'
        })
    }
}

export default defineProvider({
    getImage
})
