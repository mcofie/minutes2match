<template>
  <div class="compatibility-breakdown">
    <div v-if="breakdown" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="item in chartItems" :key="item.label" class="breakdown-item">
        <div class="flex justify-between items-center mb-1">
          <span class="text-[10px] font-bold uppercase tracking-wider text-gray-500">{{ item.label }}</span>
          <span class="text-xs font-bold" :class="getScoreColorClass(item.value)">{{ item.value }}%</span>
        </div>
        <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div 
            class="h-full transition-all duration-500" 
            :class="getBarColorClass(item.value)"
            :style="{ width: `${item.value}%` }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  breakdown: {
    vibeMatch: number
    goalsMatch: number
    lifestyleMatch: number
    maturityMatch: number
    interestMatch: number
  }
}>()

const chartItems = computed(() => {
  if (!props.breakdown) return []
  return [
    { label: 'Vibe Match', value: normalize(props.breakdown.vibeMatch, 40) },
    { label: 'Goal Alignment', value: normalize(props.breakdown.goalsMatch, 20) },
    { label: 'Lifestyle Sync', value: normalize(props.breakdown.lifestyleMatch, 20) },
    { label: 'Maturity & Dynamic', value: normalize(props.breakdown.maturityMatch, 10) },
    { label: 'Interest Synergy', value: normalize(props.breakdown.interestMatch, 10) }
  ]
})

function normalize(value: number, max: number) {
  return Math.round((value / max) * 100)
}

function getScoreColorClass(v: number) {
  if (v >= 80) return 'text-green-600'
  if (v >= 50) return 'text-orange-500'
  return 'text-red-500'
}

function getBarColorClass(v: number) {
  if (v >= 80) return 'bg-green-500'
  if (v >= 50) return 'bg-orange-500'
  return 'bg-red-500'
}
</script>

<style scoped>
.compatibility-breakdown {
  width: 100%;
}
</style>
