<template>
  <div class="compatibility-breakdown">
    <div class="breakdown-header">
      <h3 class="text-lg font-bold text-stone-900 mb-1">Compatibility Breakdown</h3>
      <p class="text-sm text-stone-500">Why these users match</p>
    </div>

    <!-- Overall Score -->
    <div class="overall-score-container">
      <div class="overall-score-ring" :style="{ '--score': score }">
        <div class="overall-score-inner">
          <span class="overall-score-value">{{ score }}</span>
          <span class="overall-score-label">%</span>
        </div>
      </div>
      <div class="overall-score-tier">
        <span 
          class="tier-badge"
          :class="{
            'tier-badge--excellent': score >= 80,
            'tier-badge--good': score >= 60 && score < 80,
            'tier-badge--fair': score >= 40 && score < 60,
            'tier-badge--low': score < 40
          }"
        >
          {{ tierLabel }}
        </span>
      </div>
    </div>

    <!-- Radar Chart -->
    <div class="radar-container">
      <svg viewBox="0 0 200 200" class="radar-chart">
        <!-- Background rings -->
        <circle cx="100" cy="100" r="80" class="radar-ring" />
        <circle cx="100" cy="100" r="60" class="radar-ring" />
        <circle cx="100" cy="100" r="40" class="radar-ring" />
        <circle cx="100" cy="100" r="20" class="radar-ring" />
        
        <!-- Axis lines -->
        <line v-for="(_, i) in categories" :key="`axis-${i}`"
          x1="100" y1="100"
          :x2="getAxisPoint(i, categories.length, 80).x"
          :y2="getAxisPoint(i, categories.length, 80).y"
          class="radar-axis"
        />
        
        <!-- Data polygon -->
        <polygon :points="dataPoints" class="radar-area" />
        
        <!-- Data points -->
        <circle 
          v-for="(cat, i) in categories" 
          :key="`point-${i}`"
          :cx="getDataPoint(i, categories.length, cat.value).x"
          :cy="getDataPoint(i, categories.length, cat.value).y"
          r="4"
          class="radar-point"
        />
      </svg>
      
      <!-- Labels -->
      <div 
        v-for="(cat, i) in categories" 
        :key="`label-${i}`"
        class="radar-label"
        :style="getLabelPosition(i, categories.length)"
      >
        <span class="radar-label-icon">{{ cat.icon }}</span>
        <span class="radar-label-text">{{ cat.name }}</span>
        <span class="radar-label-value">{{ cat.value }}%</span>
      </div>
    </div>

    <!-- Factor List -->
    <div class="factors-list">
      <div 
        v-for="cat in categories" 
        :key="cat.name"
        class="factor-item"
      >
        <div class="factor-header">
          <span class="factor-icon">{{ cat.icon }}</span>
          <span class="factor-name">{{ cat.name }}</span>
          <span class="factor-value" :class="getFactorClass(cat.value)">{{ cat.value }}%</span>
        </div>
        <div class="factor-bar">
          <div 
            class="factor-fill" 
            :class="getFactorClass(cat.value)"
            :style="{ width: cat.value + '%' }"
          ></div>
        </div>
        <p class="factor-desc">{{ cat.description }}</p>
      </div>
    </div>

    <!-- Match Reasons & Warnings -->
    <div v-if="reasons.length || warnings.length" class="match-insights">
      <div v-if="reasons.length" class="insights-section">
        <h4 class="insights-title text-green-700">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          Strengths
        </h4>
        <div class="insights-tags">
          <span v-for="reason in reasons" :key="reason" class="insight-tag insight-tag--positive">
            {{ reason }}
          </span>
        </div>
      </div>
      
      <div v-if="warnings.length" class="insights-section">
        <h4 class="insights-title text-amber-700">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          Considerations
        </h4>
        <div class="insights-tags">
          <span v-for="warning in warnings" :key="warning" class="insight-tag insight-tag--warning">
            {{ warning }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Category {
  name: string
  icon: string
  value: number
  description: string
}

const props = defineProps<{
  user1: any
  user2: any
  score: number
  reasons: string[]
  warnings: string[]
}>()

const tierLabel = computed(() => {
  if (props.score >= 80) return 'Excellent Match'
  if (props.score >= 60) return 'Good Match'
  if (props.score >= 40) return 'Fair Match'
  return 'Low Compatibility'
})

const categories = computed<Category[]>(() => {
  const u1 = props.user1
  const u2 = props.user2
  
  if (!u1 || !u2) return []
  
  const cats: Category[] = []
  
  // Intent Alignment (relationship goals)
  let intentScore = 50
  if (u1.intent && u2.intent) {
    intentScore = u1.intent === u2.intent ? 100 : 30
  }
  cats.push({
    name: 'Intent',
    icon: '🎯',
    value: intentScore,
    description: u1.intent === u2.intent ? 'Same relationship goals' : 'Different intentions'
  })
  
  // Genotype Compatibility
  let genotypeScore = 70
  const dangerousPairs = ['AS-AS', 'AS-SS', 'SS-AS', 'SS-SS', 'AC-SC', 'SC-AC', 'SC-SS', 'SS-SC']
  if (u1.genotype && u2.genotype) {
    const pair = `${u1.genotype}-${u2.genotype}`
    if (dangerousPairs.includes(pair)) {
      genotypeScore = 20
    } else if (u1.genotype === 'AA' || u2.genotype === 'AA') {
      genotypeScore = 100
    }
  }
  cats.push({
    name: 'Genotype',
    icon: '🧬',
    value: genotypeScore,
    description: genotypeScore >= 80 ? 'Safe combination' : genotypeScore >= 50 ? 'Needs consideration' : 'Risk factor'
  })
  
  // Age Compatibility
  const age1 = u1.birth_date ? Math.floor((Date.now() - new Date(u1.birth_date).getTime()) / (1000 * 60 * 60 * 24 * 365)) : null
  const age2 = u2.birth_date ? Math.floor((Date.now() - new Date(u2.birth_date).getTime()) / (1000 * 60 * 60 * 24 * 365)) : null
  let ageScore = 60
  if (age1 && age2) {
    const diff = Math.abs(age1 - age2)
    if (diff <= 3) ageScore = 100
    else if (diff <= 5) ageScore = 85
    else if (diff <= 8) ageScore = 70
    else if (diff <= 12) ageScore = 50
    else ageScore = 30
  }
  cats.push({
    name: 'Age',
    icon: '📅',
    value: ageScore,
    description: `${Math.abs((age1 || 0) - (age2 || 0))} year difference`
  })
  
  // Location Proximity
  let locationScore = 50
  if (u1.location && u2.location) {
    locationScore = u1.location.toLowerCase() === u2.location.toLowerCase() ? 100 : 40
  }
  cats.push({
    name: 'Location',
    icon: '📍',
    value: locationScore,
    description: locationScore >= 80 ? 'Same area' : 'Different locations'
  })
  
  // Persona Compatibility
  let personaScore = 60
  if (u1.dating_persona && u2.dating_persona) {
    // Complementary personas get higher scores
    const complementary: Record<string, string[]> = {
      'the_romantic': ['the_adventurer', 'the_intellectual'],
      'the_adventurer': ['the_romantic', 'the_homebody'],
      'the_intellectual': ['the_romantic', 'the_socialite'],
      'the_homebody': ['the_adventurer', 'the_intellectual'],
      'the_socialite': ['the_intellectual', 'the_homebody']
    }
    if (u1.dating_persona === u2.dating_persona) {
      personaScore = 85
    } else if (complementary[u1.dating_persona]?.includes(u2.dating_persona)) {
      personaScore = 95
    }
  }
  cats.push({
    name: 'Persona',
    icon: '✨',
    value: personaScore,
    description: personaScore >= 80 ? 'Compatible personalities' : 'Different styles'
  })
  
  // Height Preference (if applicable)
  let heightScore = 70
  if (u1.height_cm && u2.height_cm) {
    const heightDiff = Math.abs(u1.height_cm - u2.height_cm)
    if (heightDiff <= 10) heightScore = 90
    else if (heightDiff <= 20) heightScore = 75
    else heightScore = 55
  }
  cats.push({
    name: 'Physical',
    icon: '📏',
    value: heightScore,
    description: heightScore >= 75 ? 'Good match' : 'Notable difference'
  })
  
  return cats
})

// Radar chart helpers
const getAxisPoint = (index: number, total: number, radius: number) => {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2
  return {
    x: 100 + radius * Math.cos(angle),
    y: 100 + radius * Math.sin(angle)
  }
}

const getDataPoint = (index: number, total: number, value: number) => {
  const radius = (value / 100) * 80
  return getAxisPoint(index, total, radius)
}

const dataPoints = computed(() => {
  return categories.value
    .map((cat, i) => {
      const point = getDataPoint(i, categories.value.length, cat.value)
      return `${point.x},${point.y}`
    })
    .join(' ')
})

const getLabelPosition = (index: number, total: number) => {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2
  const radius = 95
  const x = 50 + (radius * Math.cos(angle)) * 0.5
  const y = 50 + (radius * Math.sin(angle)) * 0.5
  
  return {
    left: `${x}%`,
    top: `${y}%`,
    transform: 'translate(-50%, -50%)'
  }
}

const getFactorClass = (value: number) => {
  if (value >= 80) return 'factor--excellent'
  if (value >= 60) return 'factor--good'
  if (value >= 40) return 'factor--fair'
  return 'factor--low'
}
</script>

<style scoped>
.compatibility-breakdown {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
}

.breakdown-header {
  margin-bottom: 1.5rem;
  text-align: center;
}

/* Overall Score */
.overall-score-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
}

.overall-score-ring {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: conic-gradient(
    #10B981 calc(var(--score) * 1%),
    #E5E7EB calc(var(--score) * 1%)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.overall-score-inner {
  width: 90px;
  height: 90px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.overall-score-value {
  font-size: 2rem;
  font-weight: 800;
  color: #111827;
  line-height: 1;
}

.overall-score-label {
  font-size: 0.875rem;
  color: #6B7280;
  font-weight: 600;
}

.tier-badge {
  margin-top: 0.75rem;
  padding: 0.375rem 0.75rem;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tier-badge--excellent { background: #D1FAE5; color: #065F46; }
.tier-badge--good { background: #DBEAFE; color: #1E40AF; }
.tier-badge--fair { background: #FEF3C7; color: #92400E; }
.tier-badge--low { background: #FEE2E2; color: #991B1B; }

/* Radar Chart */
.radar-container {
  position: relative;
  width: 100%;
  max-width: 300px;
  margin: 0 auto 2rem;
  aspect-ratio: 1;
}

.radar-chart {
  width: 100%;
  height: 100%;
}

.radar-ring {
  fill: none;
  stroke: #E5E7EB;
  stroke-width: 1;
}

.radar-axis {
  stroke: #E5E7EB;
  stroke-width: 1;
  stroke-dasharray: 4 4;
}

.radar-area {
  fill: rgba(16, 185, 129, 0.2);
  stroke: #10B981;
  stroke-width: 2;
}

.radar-point {
  fill: #10B981;
  stroke: white;
  stroke-width: 2;
}

.radar-label {
  position: absolute;
  text-align: center;
  white-space: nowrap;
}

.radar-label-icon {
  display: block;
  font-size: 1.25rem;
  margin-bottom: 0.125rem;
}

.radar-label-text {
  display: block;
  font-size: 0.625rem;
  font-weight: 700;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.radar-label-value {
  display: block;
  font-size: 0.75rem;
  font-weight: 800;
  color: #111827;
}

/* Factors List */
.factors-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.factor-item {
  padding: 0.75rem;
  background: #F9FAFB;
  border-radius: 0.75rem;
}

.factor-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.factor-icon {
  font-size: 1rem;
}

.factor-name {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.factor-value {
  font-size: 0.875rem;
  font-weight: 800;
}

.factor--excellent { color: #059669; }
.factor--good { color: #2563EB; }
.factor--fair { color: #D97706; }
.factor--low { color: #DC2626; }

.factor-bar {
  height: 6px;
  background: #E5E7EB;
  border-radius: 99px;
  overflow: hidden;
  margin-bottom: 0.375rem;
}

.factor-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.5s ease;
}

.factor-fill.factor--excellent { background: linear-gradient(90deg, #10B981, #34D399); }
.factor-fill.factor--good { background: linear-gradient(90deg, #3B82F6, #60A5FA); }
.factor-fill.factor--fair { background: linear-gradient(90deg, #F59E0B, #FBBF24); }
.factor-fill.factor--low { background: linear-gradient(90deg, #EF4444, #F87171); }

.factor-desc {
  font-size: 0.75rem;
  color: #6B7280;
  margin: 0;
}

/* Match Insights */
.match-insights {
  border-top: 1px solid #E5E7EB;
  padding-top: 1rem;
}

.insights-section {
  margin-bottom: 1rem;
}

.insights-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.insights-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.insight-tag {
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
}

.insight-tag--positive {
  background: #D1FAE5;
  color: #065F46;
  border: 1px solid #A7F3D0;
}

.insight-tag--warning {
  background: #FEF3C7;
  color: #92400E;
  border: 1px solid #FDE68A;
}
</style>
