/**
 * Admin API: Platform Quality Audit
 * POST /api/admin/quality-audit
 * 
 * Analyzes users for activity, effort, and responsiveness.
 * Returns a list of users recommended for the "Purge List".
 */

import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { M2MDatabase } from '~/types/database.types'
import { auditProfileWithAI } from '~/server/utils/ai'

export default defineEventHandler(async (event) => {
    // 1. Security Check
    const user = await serverSupabaseUser(event)
    const userId = (user as any)?.sub
    if (!user || !userId) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const config = useRuntimeConfig()
    const supabase = serverSupabaseServiceRole<M2MDatabase>(event)

    // Check admin role
    const { data: admin } = await supabase
        .schema('m2m')
        .from('admins')
        .select('role')
        .eq('id', userId)
        .maybeSingle()

    if (!admin) {
        throw createError({ statusCode: 403, message: 'Admin access required' })
    }

    try {
        // 2. Fetch Data Aggregates
        const [
            { data: profiles },
            { data: matches },
            { data: vibeAnswers }
        ] = await Promise.all([
            supabase.schema('m2m').from('profiles').select('*').eq('is_verified', true),
            supabase.schema('m2m').from('matches').select('user_1_id, user_2_id, status, feedback_status, created_at'),
            supabase.schema('m2m').from('vibe_answers').select('user_id, question_key, answer_value')
        ])

        const body = await readBody(event).catch(() => ({}))
        if (!profiles) return { success: true, count: 0, results: [] }

        // 3. Process Logic
        const now = new Date()
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
        const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000)

        const vibeCounts = new Map<string, number>()
        vibeAnswers?.forEach(v => {
            const current = vibeCounts.get(v.user_id) || 0
            vibeCounts.set(v.user_id, current + 1)
        })

        const auditResults = profiles.map((p) => {
            const reasons: string[] = []
            let qualityScore = 100

            const userMatches = matches?.filter(m => m.user_1_id === p.id || m.user_2_id === p.id) || []
            const pendingMatches = userMatches.filter(m =>
                m.status === 'pending_payment' &&
                new Date(m.created_at) < fortyEightHoursAgo
            )
            if (pendingMatches.length >= 3) {
                reasons.push('Payment Bouncer (3+ pending matches > 48h)')
                qualityScore -= 40
            }

            const ghosterMatches = userMatches.filter(m => m.feedback_status === 'no_response')
            if (ghosterMatches.length >= 2) {
                reasons.push('High Ghosting Rate (Partner reported)')
                qualityScore -= 50
            }

            const lastUpdated = new Date(p.updated_at)
            if (lastUpdated < sixtyDaysAgo && p.events_attended === 0) {
                reasons.push('Inactive/Stale (No updates > 60 days)')
                qualityScore -= 30
            }

            const missingFields = []
            if (!p.occupation) missingFields.push('occupation')
            if (!p.genotype) missingFields.push('genotype')
            if (!p.dating_persona) missingFields.push('persona')

            const badgeCount = p.badges?.length || 0
            const answersCount = vibeCounts.get(p.id) || 0

            if (missingFields.length >= 2 || badgeCount < 3 || answersCount < 5) {
                reasons.push('Low-Effort Profile (Incomplete details)')
                qualityScore -= 20
            }

            return {
                id: p.id,
                display_name: p.display_name,
                phone: p.phone,
                quality_score: Math.max(0, qualityScore),
                reasons,
                last_active: lastUpdated,
                stats: {
                    matches: userMatches.length,
                    unlocked: userMatches.filter(m => m.status === 'unlocked').length,
                    vibe_questions: answersCount,
                    badges: badgeCount
                }
            }
        })

        const runAIDeepDive = body.runAIDeepDive === true
        let purgeList = auditResults
            .filter(r => r.quality_score < 70 || r.reasons.length > 0)
            .sort((a, b) => a.quality_score - b.quality_score)

        const candidatesForAI = purgeList.slice(0, 10)

        if (runAIDeepDive && candidatesForAI.length > 0) {
            await Promise.all(candidatesForAI.map(async (candidate: any) => {
                try {
                    const p = profiles.find(pr => pr.id === candidate.id)
                    if (!p) return
                    const answers = vibeAnswers?.filter(v => v.user_id === candidate.id).map(v => ({
                        question: v.question_key,
                        answer: v.answer_value
                    })) || []

                    const aiResult = await auditProfileWithAI({
                        display_name: p.display_name,
                        occupation: p.occupation,
                        dating_persona: p.dating_persona,
                        badges: p.badges,
                        vibe_answers: answers
                    })

                    if (aiResult) {
                        candidate.ai_analysis = aiResult
                        if (aiResult.coherence_score < 40) candidate.reasons.push(`AI: Low Coherence (${aiResult.coherence_score}%)`)
                        if (aiResult.effort_score < 30) candidate.reasons.push(`AI: Low Effort detected`)
                    }
                } catch (err: any) {
                    console.error('[AI Audit Error]', err)
                }
            }))

            purgeList = auditResults
                .filter(r => r.quality_score < 70 || r.reasons.length > 0)
                .sort((a, b) => a.quality_score - b.quality_score)
        }

        return {
            success: true,
            timestamp: now.toISOString(),
            auditCount: profiles.length,
            purgeCount: purgeList.length,
            diagnostics: {
                hasGeminiKey: !!config.geminiApiKey,
                aiDeepDiveRequested: runAIDeepDive
            },
            results: purgeList
        }

    } catch (err: any) {
        throw createError({ statusCode: 500, message: err.message || 'Audit failed' })
    }
})
