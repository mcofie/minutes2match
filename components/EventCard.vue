<template>
  <article class="group relative bg-white rounded-2xl border border-stone-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-stone-300">
    <!-- Image Header -->
    <div class="relative h-48 bg-stone-100">
      <NuxtImg v-if="coverImage" :src="coverImage" :alt="title" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
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
      
      <div class="space-y-3 mb-4">
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
      
      <!-- Going Indicator -->
      <div v-if="totalTicketsSold > 0" class="flex items-center gap-2 mb-4">
        <div class="flex -space-x-2">
           <div class="w-6 h-6 rounded-full bg-orange-50 border-2 border-white flex items-center justify-center text-[10px] shadow-sm z-30">🔥</div>
           <div class="w-6 h-6 rounded-full bg-emerald-50 border-2 border-white flex items-center justify-center text-[10px] shadow-sm z-20" v-if="totalTicketsSold > 1">🎭</div>
           <div class="w-6 h-6 rounded-full bg-blue-50 border-2 border-white flex items-center justify-center text-[10px] shadow-sm z-10" v-if="totalTicketsSold > 2">🎨</div>
        </div>
        <span class="text-xs font-bold text-stone-500 tracking-tight">{{ totalTicketsSold > 3 ? `${totalTicketsSold} people attending` : `${totalTicketsSold} attending` }}</span>
      </div>
      <div v-else class="flex items-center gap-2 mb-4">
         <span class="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Be the first to join</span>
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
      
      <!-- Loading state -->
      <div v-if="loading" class="flex items-center gap-2 text-stone-400">
        <div class="w-4 h-4 border-2 border-stone-200 border-t-stone-500 rounded-full animate-spin"></div>
        <span class="text-sm">Checking...</span>
      </div>
      
      <!-- Booked state -->
      <div v-else-if="booked" class="flex flex-col items-end gap-1.5">
        <div class="flex items-center gap-1.5 text-emerald-600 font-black uppercase tracking-widest text-xs">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          Booked
        </div>
        <button @click="downloadICS" class="text-[10px] font-bold text-stone-400 hover:text-stone-800 flex items-center gap-1 bg-stone-100 hover:bg-stone-200 px-2 py-1 rounded transition-colors">
           <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
           Add to Calendar
        </button>
      </div>
      
      <!-- Book button -->
      <UiButton
        v-else
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
  booked?: boolean
  loading?: boolean // When true, disables book button (while checking booking status)
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

const totalTicketsSold = computed(() => props.maleTicketsSold + props.femaleTicketsSold)

// ICS Generation
const downloadICS = () => {
   const eventStart = new Date(props.eventDate)
   const eventEnd = new Date(eventStart.getTime() + (3 * 60 * 60 * 1000)) // Assuming 3 hours
   
   const formatDateForICS = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
   }

   const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Minutes 2 Match//EN',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@minutes2match.com`,
      `DTSTAMP:${formatDateForICS(new Date())}`,
      `DTSTART:${formatDateForICS(eventStart)}`,
      `DTEND:${formatDateForICS(eventEnd)}`,
      `SUMMARY:${props.title} (Minutes 2 Match)`,
      `LOCATION:${props.venue}`,
      'END:VEVENT',
      'END:VCALENDAR'
   ].join('\r\n')

   const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' })
   const link = document.createElement('a')
   link.href = URL.createObjectURL(blob)
   link.download = `${props.title.replace(/ /g, '_')}_M2M_Event.ics`
   document.body.appendChild(link)
   link.click()
   document.body.removeChild(link)
}
</script>
