<template>
  <div class="group relative w-full sm:w-72 bg-white dark:bg-stone-900 border border-[#ece8e3] dark:border-stone-800 rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(52,38,25,0.07)] hover:shadow-none transition-all duration-300">
    <!-- Venue Image -->
    <div class="h-32 sm:h-40 overflow-hidden relative">
      <NuxtImg :src="venue.image_url" :alt="venue.name" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      
      <!-- Discount Badge -->
      <div v-if="!redemptionData" class="absolute top-3 left-3 bg-rose-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg animate-pulse">
        {{ venue.discount_label }}
      </div>
      
      <!-- Venue Type -->
      <div v-if="!redemptionData" class="absolute bottom-3 left-3 flex items-center gap-1.5">
        <span class="text-xs">{{ venueIcon }}</span>
        <span class="text-[10px] text-white/90 font-bold uppercase tracking-tight">{{ venue.type }}</span>
      </div>
    </div>

    <!-- Venue Info / Redemption Ticket -->
    <div class="p-4 sm:p-5 relative min-h-[160px]">
      <div v-if="!redemptionData" class="animate-in fade-in duration-500">
        <h4 class="text-base sm:text-lg font-serif font-bold text-stone-900 dark:text-stone-100 mb-1 leading-tight">{{ venue.name }}</h4>
        <p class="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 font-medium mb-3 flex items-center gap-1">
          <span class="text-rose-500">📍</span> {{ venue.location }}
        </p>
        
        <p class="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed mb-4">
          {{ venue.description }}
        </p>

        <button 
          @click="$emit('claim')" 
          :disabled="loading"
          class="w-full py-2.5 bg-[#393737] dark:bg-stone-100 text-white dark:text-[#393737] rounded-2xl text-[10px] font-bold uppercase tracking-wider hover:bg-rose-500 dark:hover:bg-rose-500 dark:hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading" class="flex items-center justify-center gap-2">
            <span class="w-2 h-2 rounded-full bg-current animate-pulse"></span>
            Claiming...
          </span>
          <span v-else>Claim M2M Rate</span>
        </button>

      </div>

      <!-- Redemption Ticket View -->
      <div v-else class="animate-in zoom-in-95 duration-500 flex flex-col items-center justify-center text-center py-2">
        <div class="w-full bg-rose-50 dark:bg-rose-900/10 border border-dashed border-rose-200 dark:border-rose-900/30 rounded-2xl p-3 mb-4">
           <div class="text-[8px] font-semibold uppercase tracking-wider text-rose-500 mb-1">M2M REDEMPTION TICKET</div>
           <div class="text-sm font-bold text-stone-900 dark:text-white mb-2">{{ venue.discount_label }}</div>
           <div class="flex flex-col gap-1">
              <div class="text-[7px] font-mono text-stone-400 uppercase">Redemption ID: {{ redemptionData.redemptionId.slice(0, 8).toUpperCase() }}</div>
              <div class="text-[7px] font-mono text-stone-400 uppercase">Issued: {{ new Date(redemptionData.redeemedAt).toLocaleTimeString() }}</div>
           </div>
        </div>
        <p class="text-[9px] text-stone-500 dark:text-stone-400 font-medium px-2 leading-tight">
          Show this ticket to the server to verify your discounted rate.
        </p>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  venue: {
    id: string
    name: string
    type: string
    location: string
    description: string
    discount_label: string
    image_url: string
  }
  redemptionData?: {
    redemptionId: string
    redeemedAt: string
  } | null
  loading?: boolean
}>(), {
  redemptionData: null,
  loading: false
})


const venueIcon = computed(() => {
  switch (props.venue.type.toLowerCase()) {
    case 'restaurant': return '🍽️'
    case 'bar': return '🍸'
    case 'activity': return '🎳'
    default: return '📍'
  }
})
</script>
