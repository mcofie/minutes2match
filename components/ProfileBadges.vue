<template>
  <div v-if="displayBadges.length > 0" class="profile-badges" :class="sizeClass">
    <div 
      v-for="badge in displayBadges" 
      :key="badge.id"
      class="badge-item"
      :style="{ 
        backgroundColor: badge.color,
        color: badge.textColor
      }"
      :title="badge.description"
    >
      <span class="badge-icon" v-html="badge.icon"></span>
      <span v-if="showLabels" class="badge-label">{{ badge.name }}</span>
    </div>
    
    <!-- Overflow indicator -->
    <div 
      v-if="overflowCount > 0" 
      class="badge-overflow"
      :title="`+${overflowCount} more badges`"
    >
      +{{ overflowCount }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBadges } from '~/composables/useBadges'

interface Props {
  badgeIds?: string[] | null
  profile?: any
  maxDisplay?: number
  showLabels?: boolean
  size?: 'xs' | 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  badgeIds: null,
  profile: null,
  maxDisplay: 5,
  showLabels: false,
  size: 'sm'
})

const { getUserBadges, calculateBadges } = useBadges()

const displayBadges = computed(() => {
  let ids: string[] = []
  
  // Use provided badgeIds or calculate from profile
  if (props.badgeIds && props.badgeIds.length > 0) {
    ids = props.badgeIds
  } else if (props.profile) {
    // Use stored badges or calculate
    ids = props.profile.badges || calculateBadges(props.profile)
  }
  
  const allBadges = getUserBadges(ids)
  return allBadges.slice(0, props.maxDisplay)
})

const overflowCount = computed(() => {
  let ids: string[] = []
  
  if (props.badgeIds && props.badgeIds.length > 0) {
    ids = props.badgeIds
  } else if (props.profile?.badges) {
    ids = props.profile.badges
  } else if (props.profile) {
    ids = calculateBadges(props.profile)
  }
  
  const total = getUserBadges(ids).length
  return Math.max(0, total - props.maxDisplay)
})

const sizeClass = computed(() => `badges-${props.size}`)
</script>

<style scoped>
.profile-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  align-items: center;
}

.badge-item {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  border-radius: 99px;
  font-weight: 600;
  white-space: nowrap;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.badge-item:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.badge-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.badge-label {
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.badge-overflow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #E5E7EB;
  color: #374151;
  border-radius: 99px;
  font-weight: 700;
}

/* Size: xs */
.badges-xs .badge-item {
  padding: 0.125rem 0.375rem;
  font-size: 0.5rem;
}

.badges-xs .badge-icon {
  width: 0.625rem;
  height: 0.625rem;
}

.badges-xs .badge-overflow {
  padding: 0.125rem 0.25rem;
  font-size: 0.5rem;
}

/* Size: sm (default) */
.badges-sm .badge-item {
  padding: 0.1875rem 0.5rem;
  font-size: 0.625rem;
}

.badges-sm .badge-icon {
  width: 0.75rem;
  height: 0.75rem;
}

.badges-sm .badge-overflow {
  padding: 0.1875rem 0.375rem;
  font-size: 0.625rem;
}

/* Size: md */
.badges-md .badge-item {
  padding: 0.25rem 0.625rem;
  font-size: 0.6875rem;
}

.badges-md .badge-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.badges-md .badge-overflow {
  padding: 0.25rem 0.5rem;
  font-size: 0.6875rem;
}
</style>
