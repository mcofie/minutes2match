/**
 * Admin API: Platform Quality Audit
 * POST /api/admin/quality-audit
 * 
 * Analyzes users for activity, effort, and responsiveness.
 * Returns a list of users recommended for the "Purge List".
 */

import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'
import { auditProfileWithAI } from '~/server/utils/ai'

export default defineEventHandler(async (event) => {
    // 1. Security Check
    const user = await serverSupabaseUser(event)
    const userId = (user as any)?.sub
    if (!user || !userId) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const config = useRuntimeConfig()
    const supabase = createClient(config.supabaseUrl!, config.supabaseServiceKey!, {
        db: { schema: 'm2m' }
    })

    // Check admin role
    const { data: admin } = await supabase
        .from('admins')
        .select('role')
        .eq('id', userId)
        .single()

    if (!admin) {
        throw createError({ statusCode: 403, message: 'Admin access required' })
    }

    try {
        // 2. Fetch Data Aggregates
        // Fetch all verified users + their match counts + their feedback stats
        const [
            { data: profiles },
            { data: matches },
            { data: vibeAnswers }
        ] = await Promise.all([
            supabase.from('profiles').select('*').eq('is_verified', true),
            supabase.from('matches').select('user_1_id, user_2_id, status, feedback_status, created_at'),
            supabase.from('vibe_answers').select('user_id, question_key, answer_value')
        ])

        const body = await readBody(event).catch(() => ({}))

        if (!profiles) return { success: true, count: 0, results: [] }

        // 3. Process Logic
        const now = new Date()
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
        const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000)

        // Map vibe answers counts
        const vibeCounts = new Map<string, number>()
        vibeAnswers?.forEach(v => {
            const current = vibeCounts.get(v.user_id) || 0
            vibeCounts.set(v.user_id, current + 1)
        })

        const auditResults = profiles.map((p: any) => {
            const reasons: string[] = []
            let qualityScore = 100 // Out of 100

            // A. Payment Bouncers: 3+ pending matches > 48h
            const userMatches = matches?.filter(m => m.user_1_id === p.id || m.user_2_id === p.id) || []
            const pendingMatches = userMatches.filter(m =>
                m.status === 'pending_payment' &&
                new Date(m.created_at) < fortyEightHoursAgo
            )
            if (pendingMatches.length >= 3) {
                reasons.push('Payment Bouncer (3+ pending matches > 48h)')
                qualityScore -= 40
            }

            // B. Ghosters: Unlocked matches but partners reported no response
            const ghosterMatches = userMatches.filter(m => {
                const isUser1 = m.user_1_id === p.id
                // Partner feedback about THIS user
                if (isUser1) return m.feedback_status === 'no_response' // simplified: usually feedback table would be separate
                return m.feedback_status === 'no_response'
            })
            if (ghosterMatches.length >= 2) {
                reasons.push('High Ghosting Rate (Partner reported)')
                qualityScore -= 50
            }

            // C. Stale Activity: No update > 60 days AND 0 events attended
            const lastUpdated = new Date(p.updated_at)
            if (lastUpdated < sixtyDaysAgo && p.events_attended === 0) {
                reasons.push('Inactive/Stale (No updates > 60 days)')
                qualityScore -= 30
            }

            // D. Low-Effort Profile: Missing key fields or low badge count
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

        // 4. AI Deep Dive (Optional)
        const runAIDeepDive = body.runAIDeepDive === true

        // Final Purge List (Score < 70 OR has specific reasons)
        let purgeList = auditResults
            .filter(r => r.quality_score < 70 || r.reasons.length > 0)
            .sort((a, b) => a.quality_score - b.quality_score)

        const candidatesForAI = purgeList.slice(0, 10) // Audit up to 10 candidates

        if (runAIDeepDive && candidatesForAI.length > 0) {
            console.log(`[QualityAudit] Running AI Deep Dive for ${candidatesForAI.length} candidates...`)
            await Promise.all(candidatesForAI.map(async (candidate: any) => {
                try {
                    const p = profiles.find(pr => pr.id === candidate.id)
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
                    } else {
                        candidate.reasons.push('AI Audit: No response from model')
                    }
                } catch (err: any) {
                    console.error('[AI Audit Error]', err)
                    candidate.reasons.push(`AI Audit Error: ${err.message || 'Unknown'}`)
                }
            }))

            // Re-sync purgeList to ensure reasons are updated
            purgeList = auditResults
                .filter(r => r.quality_score < 70 || r.reasons.length > 0)
                .sort((a, b) => a.quality_score - b.quality_score)
        } else if (runAIDeepDive) {
            console.log('[QualityAudit] RunAIDeepDive requested but no candidates < 70 score found.')
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
