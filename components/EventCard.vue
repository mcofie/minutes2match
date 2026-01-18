<template>
  <article class="group relative bg-white rounded-2xl border border-stone-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-stone-300">
    <!-- Image Header -->
    <div class="relative h-48 bg-stone-100">
      <img v-if="coverImage" :src="coverImage" :alt="title" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div v-else class="w-full h-full flex items-center justify-center bg-stone-100 text-stone-300">
        <span class="text-4xl">📅</span>
      </div>
      
      <!-- Date Badge -->
      <div class="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl text-center shadow-sm border border-stone-100">
        <span class="block text-xs font-bold uppercase text-orange-600 tracking-wider">{{ formattedMonth }}</span>
        <span class="block text-2xl font-bold text-stone-900 leading-none">{{ formattedDay }}</span>
      </div>
    </div>
    
    <div class="p-6">
      <h3 class="text-xl font-bold text-stone-900 mb-4 leading-tight group-hover:text-black">{{ title }}</h3>
      
      <div class="space-y-3 mb-6">
        <div class="flex items-center gap-3 text-stone-500 text-sm font-medium">
          <svg class="w-4 h-4 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span class="line-clamp-1">{{ venue }}</span>
        </div>
        
        <div class="flex items-center gap-3 text-stone-500 text-sm font-medium">
          <svg class="w-4 h-4 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>{{ formattedTime }}</span>
        </div>
      </div>
      
      <!-- Capacity -->
      <div class="mb-2">
        <div class="h-2 w-full bg-stone-100 rounded-full overflow-hidden mb-2">
          <div 
            class="h-full rounded-full transition-all duration-500 ease-out"
            :class="{
              'bg-emerald-500': buttonState === 'available',
              'bg-amber-500': buttonState === 'almost_full',
              'bg-red-500': buttonState === 'waitlist'
            }"
            :style="{ width: capacityPercentage + '%' }"
          ></div>
        </div>
        <p class="text-xs font-bold text-stone-400 text-right">{{ capacityText }}</p>
      </div>
    </div>
    
    <div class="px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
      <span class="text-lg font-bold text-stone-900">{{ formattedPrice }}</span>
      <UiButton
        :variant="buttonState === 'available' ? 'primary' : 'outline'"
        size="sm"
        @click="$emit('book')"
      >
        {{ buttonText }}
      </UiButton>
    </div>
  </article>
</template>

<script setup lang="ts">
import UiButton from '~/components/ui/Button.vue'

interface Props {
  title: string
  eventDate: string
  venue: string
  coverImage?: string
  maleCapacity: number
  femaleCapacity: number
  maleTicketsSold: number
  femaleTicketsSold: number
  ticketPriceMale: number
  ticketPriceFemale: number
  userGender: 'male' | 'female'
}

const props = defineProps<Props>()

defineEmits<{
  book: []
}>()

// Date formatting
const eventDateObj = computed(() => new Date(props.eventDate))
const formattedMonth = computed(() => eventDateObj.value.toLocaleDateString('en-US', { month: 'short' }).toUpperCase())
const formattedDay = computed(() => eventDateObj.value.getDate())
const formattedTime = computed(() => eventDateObj.value.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }))

// Capacity logic
const capacity = computed(() => props.userGender === 'female' ? props.femaleCapacity : props.maleCapacity)
const sold = computed(() => props.userGender === 'female' ? props.femaleTicketsSold : props.maleTicketsSold)
const capacityPercentage = computed(() => Math.min((sold.value / capacity.value) * 100, 100))

const buttonState = computed(() => {
  if (sold.value >= capacity.value) return 'waitlist'
  if (sold.value >= capacity.value * 0.9) return 'almost_full'
  return 'available'
})

const capacityText = computed(() => {
  const remaining = capacity.value - sold.value
  if (buttonState.value === 'waitlist') return 'Sold Out'
  if (buttonState.value === 'almost_full') return `Only ${remaining} spots left!`
  return `${remaining} spots available`
})

const buttonText = computed(() => {
  if (buttonState.value === 'waitlist') return 'Join Waitlist'
  if (buttonState.value === 'almost_full') return 'Book Now'
  return 'Book Spot'
})

// Price formatting
const price = computed(() => props.userGender === 'female' ? props.ticketPriceFemale : props.ticketPriceMale)
const formattedPrice = computed(() =>
  new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 0 }).format(price.value)
)
</script>
