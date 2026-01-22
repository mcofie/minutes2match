/**
 * Sitemap XML Generator
 * GET /api/sitemap.xml
 * 
 * Generates a dynamic sitemap for SEO
 */

import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const baseUrl = config.public.baseUrl || 'https://minutes2match.com'

    // Static pages (with optional lastmod for type consistency)
    const staticPages: Array<{ url: string; priority: string; changefreq: string; lastmod?: string }> = [
        { url: '/', priority: '1.0', changefreq: 'weekly' },
        { url: '/vibe-check', priority: '0.9', changefreq: 'monthly' },
        { url: '/events', priority: '0.8', changefreq: 'daily' },
    ]

    // Fetch dynamic pages (events)
    let eventUrls: Array<{ url: string; priority: string; changefreq: string; lastmod?: string }> = []

    try {
        const supabaseUrl = config.supabaseUrl
        const supabaseServiceKey = config.supabaseServiceKey

        if (supabaseUrl && supabaseServiceKey) {
            const supabase = createClient(supabaseUrl, supabaseServiceKey, {
                db: { schema: 'm2m' }
            })

            const { data: events } = await supabase
                .from('events')
                .select('id, created_at')
                .gte('date', new Date().toISOString())
                .order('date', { ascending: true })
                .limit(50)

            if (events) {
                eventUrls = events.map(event => ({
                    url: `/events/${event.id}`,
                    priority: '0.7',
                    changefreq: 'weekly',
                    lastmod: event.created_at?.split('T')[0]
                }))
            }
        }
    } catch (error) {
        console.error('[Sitemap] Error fetching events:', error)
    }

    const allPages = [...staticPages, ...eventUrls]

    // Generate XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`

    // Set content type
    setHeader(event, 'Content-Type', 'application/xml')

    return xml
})
