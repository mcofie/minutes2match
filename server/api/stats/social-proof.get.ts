/**
 * Public Stats API
 * GET /api/stats/social-proof
 * 
 * Returns anonymized counts for social proof on public pages.
 * Cached for 5 minutes to avoid hammering the DB.
 */

import { createClient } from '@supabase/supabase-js'

let cache: { data: any; timestamp: number } | null = null
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export default defineEventHandler(async () => {
    // Return cached data if fresh
    if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
        return cache.data
    }

    const config = useRuntimeConfig()
    const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey, {
        db: { schema: 'm2m' }
    })

    try {
        // Parallel queries
        const [shotsResult, vouchesResult] = await Promise.all([
            supabase.from('shots').select('id', { count: 'exact', head: true }),
            supabase.from('vouches').select('id', { count: 'exact', head: true })
        ])

        const data = {
            shotsCount: shotsResult.count || 0,
            vouchesCount: vouchesResult.count || 0,
            totalActions: (shotsResult.count || 0) + (vouchesResult.count || 0)
        }

        cache = { data, timestamp: Date.now() }
        return data
    } catch (error) {
        console.error('[Stats] Failed to fetch social proof:', error)
        return { shotsCount: 0, vouchesCount: 0, totalActions: 0 }
    }
})
