import { requireAdminAccess } from '~/server/utils/admin'
import { calculateCompatibility } from '~/utils/compatibility'

type ScoreBucket = {
  label: string
  min: number
  max: number
  total: number
  unlocked: number
  positive: number
}

type Recommendation = {
  title: string
  detail: string
  priority: 'high' | 'medium' | 'low'
}

const BUCKETS: ScoreBucket[] = [
  { label: '90+', min: 90, max: 100, total: 0, unlocked: 0, positive: 0 },
  { label: '80-89', min: 80, max: 89, total: 0, unlocked: 0, positive: 0 },
  { label: '70-79', min: 70, max: 79, total: 0, unlocked: 0, positive: 0 },
  { label: '60-69', min: 60, max: 69, total: 0, unlocked: 0, positive: 0 },
  { label: '<60', min: 0, max: 59, total: 0, unlocked: 0, positive: 0 }
]

export default defineEventHandler(async (event) => {
  const { client } = await requireAdminAccess(event)

  const { data: matches, error } = await client
    .schema('m2m')
    .from('matches')
    .select('id, user_1_id, user_2_id, status, feedback_status, match_score, match_warnings, created_at')
    .not('match_score', 'is', null)
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  const buckets = BUCKETS.map(bucket => ({ ...bucket }))
  const warningCounts = new Map<string, number>()
  let totalScore = 0
  let unlockedCount = 0
  let positiveCount = 0

  for (const match of matches || []) {
    const score = Number(match.match_score || 0)
    totalScore += score
    const bucket = buckets.find(item => score >= item.min && score <= item.max)
    if (bucket) {
      bucket.total += 1
      if (match.status === 'unlocked') bucket.unlocked += 1
      if (['connected', 'dating'].includes(match.feedback_status || '')) bucket.positive += 1
    }

    if (match.status === 'unlocked') unlockedCount += 1
    if (['connected', 'dating'].includes(match.feedback_status || '')) positiveCount += 1

    const warnings = Array.isArray(match.match_warnings) ? match.match_warnings : []
    for (const warning of warnings) {
      warningCounts.set(warning, (warningCounts.get(warning) || 0) + 1)
    }
  }

  const sampleMatches = (matches || []).slice(0, 40)
  const matchUserIds = Array.from(new Set(sampleMatches.flatMap((match: any) => [match.user_1_id, match.user_2_id]).filter(Boolean)))

  let avgConfidence = 0
  let missingDataCounts: Record<string, number> = {}

  if (matchUserIds.length) {
    const [{ data: profiles }, { data: answers }] = await Promise.all([
      client
        .schema('m2m')
        .from('profiles')
        .select('id, gender, interested_in, intent, location, religion, genotype, birth_date, dating_persona, occupation, badges, dealbreakers, min_age, max_age, preferences_extracted')
        .in('id', matchUserIds),
      client
        .schema('m2m')
        .from('vibe_answers')
        .select('user_id, question_key, answer_value')
        .in('user_id', matchUserIds)
    ])

    const profileMap = new Map((profiles || []).map((profile: any) => [profile.id, profile]))
    const answerMap = new Map<string, Array<{ question_key: string, answer: string }>>()
    for (const row of answers || []) {
      const existing = answerMap.get((row as any).user_id) || []
      existing.push({ question_key: (row as any).question_key, answer: (row as any).answer_value })
      answerMap.set((row as any).user_id, existing)
    }

    let confidenceTotal = 0
    let confidenceCount = 0
    const missingCounter = new Map<string, number>()

    for (const match of sampleMatches) {
      const user1 = profileMap.get((match as any).user_1_id)
      const user2 = profileMap.get((match as any).user_2_id)
      if (!user1 || !user2) continue

      const result = calculateCompatibility(
        user1 as any,
        answerMap.get((match as any).user_1_id) || [],
        user2 as any,
        answerMap.get((match as any).user_2_id) || []
      )

      confidenceTotal += result.confidence
      confidenceCount += 1
      for (const field of result.missingData) {
        missingCounter.set(field, (missingCounter.get(field) || 0) + 1)
      }
    }

    avgConfidence = confidenceCount ? Math.round(confidenceTotal / confidenceCount) : 0
    missingDataCounts = Object.fromEntries(
      Array.from(missingCounter.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
    )
  }

  const normalizedBuckets = buckets.map(bucket => ({
    ...bucket,
    unlockRate: bucket.total ? Math.round((bucket.unlocked / bucket.total) * 100) : 0,
    positiveRate: bucket.unlocked ? Math.round((bucket.positive / bucket.unlocked) * 100) : 0
  }))

  const recommendations: Recommendation[] = []
  const bestBucket = [...normalizedBuckets]
    .filter(bucket => bucket.total >= 5)
    .sort((a, b) => {
      if (b.positiveRate !== a.positiveRate) return b.positiveRate - a.positiveRate
      return b.unlockRate - a.unlockRate
    })[0]
  const lowPerformingHighBucket = normalizedBuckets.find(bucket => bucket.min >= 80 && bucket.total >= 5 && bucket.positiveRate < 20)
  const lowPerformingMidBucket = normalizedBuckets.find(bucket => bucket.min >= 60 && bucket.min < 80 && bucket.total >= 5 && bucket.unlockRate < 25)
  const topMissingField = Object.entries(missingDataCounts).sort((a, b) => b[1] - a[1])[0]
  const topWarning = Array.from(warningCounts.entries()).sort((a, b) => b[1] - a[1])[0]

  if (bestBucket) {
    recommendations.push({
      title: `Use ${bestBucket.label}% as the core operating band`,
      detail: `${bestBucket.label}% is currently the strongest live bucket with ${bestBucket.unlockRate}% unlock rate and ${bestBucket.positiveRate}% positive outcomes.`,
      priority: 'high'
    })
  }

  if (lowPerformingHighBucket) {
    recommendations.push({
      title: 'Audit high-scoring false positives',
      detail: `${lowPerformingHighBucket.label}% scores are unlocking, but only ${lowPerformingHighBucket.positiveRate}% convert positively. Recheck soft-risk penalties and over-rewarded strengths in that band.`,
      priority: 'high'
    })
  }

  if (lowPerformingMidBucket) {
    recommendations.push({
      title: 'Mid-band threshold may be too loose',
      detail: `${lowPerformingMidBucket.label}% matches are underperforming on unlocks. Consider raising auto-match thresholds or down-ranking sparse-profile pairs.`,
      priority: 'medium'
    })
  }

  if (avgConfidence < 70) {
    recommendations.push({
      title: 'Confidence is low enough to distort scoring',
      detail: `Average confidence is ${avgConfidence}%. Focus on profile completeness and Vibe Check coverage before changing weights aggressively.`,
      priority: 'high'
    })
  }

  if (topMissingField) {
    recommendations.push({
      title: `Fix the biggest data gap: ${topMissingField[0]}`,
      detail: `${topMissingField[1]} recent matches were scored without this signal. Improving it should raise confidence faster than retuning the algorithm.`,
      priority: 'medium'
    })
  }

  if (topWarning) {
    recommendations.push({
      title: `Watch the warning "${topWarning[0]}"`,
      detail: `It appeared ${topWarning[1]} times in recent matches. If it keeps showing up in weak outcomes, increase its penalty or convert it into a stricter gate.`,
      priority: 'medium'
    })
  }

  return {
    success: true,
    overview: {
      matchesAnalyzed: (matches || []).length,
      averageScore: (matches || []).length ? Math.round(totalScore / (matches || []).length) : 0,
      unlockRate: (matches || []).length ? Math.round((unlockedCount / (matches || []).length) * 100) : 0,
      positiveOutcomeRate: unlockedCount ? Math.round((positiveCount / unlockedCount) * 100) : 0,
      averageConfidence: avgConfidence
    },
    buckets: normalizedBuckets,
    topWarnings: Array.from(warningCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([warning, count]) => ({ warning, count })),
    missingDataCounts,
    recommendations
  }
})
