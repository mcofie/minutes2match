import { createClient } from '@supabase/supabase-js'
import { aiQuotaHitSince } from '~/server/utils/ai'

/**
 * Read bios with AI in batches.
 * POST /api/admin/ai/bulk-extract-preferences
 * Body: { limit?: number (default 15, max 40), refresh?: boolean }
 *
 * Without refresh, only members whose bio hasn't been read yet (no traits or no meaning vectors).
 * Runs a batch per call so it fits inside a serverless time limit; call again until `remaining` is 0.
 * Admins, or the cron secret (for scripted backfills).
 */
export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const authHeader = getHeader(event, 'authorization')
    if (!(config.cronSecret && authHeader === `Bearer ${config.cronSecret}`)) {
        await requireAdminAccess(event)
    }

    const body = (await readBody<{ limit?: number; refresh?: boolean }>(event).catch(() => null)) || {}
    const limit = Math.min(40, Math.max(1, Number(body.limit) || 15))

    const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey, {
        db: { schema: 'm2m' }
    })

    const profiles = await fetchAllRows<any>(() => supabase
        .from('profiles')
        .select('id, about_me, preferences_extracted, bio_embeddings')
        .not('about_me', 'is', null)
        .order('id'))

    const hasTraits = (p: any) => p.preferences_extracted && Object.keys(p.preferences_extracted).length > 0
    const todo = profiles.filter(p =>
        (p.about_me || '').trim().length >= 10 && (body.refresh || !hasTraits(p) || !p.bio_embeddings)
    )

    const startedAt = Date.now()
    const results = { processed: 0, failed: 0, remaining: todo.length, total: todo.length, quotaReached: false }
    for (const profile of todo.slice(0, limit)) {
        const outcome = await analyseMemberBio(supabase, profile)
        if (outcome === 'analysed') results.processed++
        else if (outcome === 'failed') results.failed++
        // Out of AI quota: stop now rather than fail every remaining bio
        if (aiQuotaHitSince(startedAt)) {
            results.quotaReached = true
            break
        }
    }
    results.remaining = Math.max(0, todo.length - results.processed)

    return { success: true, results }
})
