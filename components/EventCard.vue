<template>
  <article 
    class="group relative bg-white dark:bg-stone-900 rounded-xl border-2 border-black dark:border-stone-800 overflow-hidden transition-all duration-300 hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:scale-[0.98] h-full flex flex-col"
    style="box-shadow: 6px 6px 0px 0px rgba(0,0,0,1);"
  >
    <!-- Image Section -->
    <div class="relative h-56 bg-stone-100 dark:bg-stone-800 overflow-hidden border-b-2 border-black dark:border-stone-800">
      <NuxtImg 
        v-if="coverImage" 
        :src="coverImage" 
        :alt="title" 
        class="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" 
        loading="lazy" 
      />
      <div v-else class="w-full h-full flex items-center justify-center text-stone-300">
        <span class="text-5xl opacity-20">📅</span>
      </div>

      <!-- Date Badge Overlay -->
      <div class="absolute top-4 right-4 bg-black text-white px-3 py-2 rounded-lg text-center shadow-lg border border-white/10 ring-1 ring-white/20 z-10">
        <span class="block text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-0.5">{{ formattedMonth }}</span>
        <span class="block text-2xl font-black leading-none">{{ formattedDay }}</span>
      </div>

      <!-- Price Overlay (Premium placement) -->
      <div class="absolute bottom-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-black/5 dark:border-white/10 shadow-sm z-10">
        <span class="text-sm font-black text-stone-900 dark:text-white">{{ formattedPrice }}</span>
      </div>
    </div>

    <!-- Content Section -->
    <div class="p-5 flex-1 flex flex-col">
      <NuxtLink v-if="eventId" :to="`/events/${eventId}`" class="block mb-4 group/title">
        <h3 class="text-xl font-black text-stone-900 dark:text-stone-100 leading-tight group-hover/title:underline decoration-black/20 underline-offset-4 decoration-2">
          {{ title }}
        </h3>
      </NuxtLink>
      <h3 v-else class="text-xl font-black text-stone-900 dark:text-stone-100 mb-4 leading-tight">
        {{ title }}
      </h3>

      <!-- Event Details Stack -->
      <div class="space-y-3 mb-4">
        <div class="flex items-center gap-3 text-stone-500 dark:text-stone-400">
          <div class="w-8 h-8 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          </div>
          <span class="text-[11px] font-bold uppercase tracking-wider">{{ venue }}</span>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3 text-stone-500 dark:text-stone-400">
            <div class="w-8 h-8 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <span class="text-[11px] font-bold uppercase tracking-wider">{{ formattedTime }}</span>
          </div>

          <button 
            @click="showMore = !showMore" 
            class="text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors"
          >
            {{ showMore ? 'Less' : 'More' }}
            <svg class="w-3 h-3 transition-transform duration-300" :class="{ 'rotate-180': showMore }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
        </div>

        <!-- Collapsible Section -->
        <div v-show="showMore" class="pt-2 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div v-if="minAge || maxAge" class="flex items-center gap-3 text-stone-500 dark:text-stone-400">
            <div class="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <span class="text-[10px] font-black uppercase tracking-[0.1em]">
              {{ minAge && maxAge ? `${minAge}-${maxAge}` : minAge ? `${minAge}+` : `Up to ${maxAge}` }}
              <span class="opacity-60 font-medium ml-1">({{ userGender === 'female' ? 'Ladies' : 'Gents' }})</span>
            </span>
          </div>

          <!-- Capacity & Attendance (Inside Collapsible) -->
          <div class="space-y-4 pt-2 border-t border-stone-100 dark:border-stone-800">
            <!-- Attendance Avatars / Empty State -->
            <div class="flex items-center justify-between">
              <div v-if="totalTicketsSold > 0" class="flex items-center gap-2">
                <div class="flex -space-x-1.5 overflow-hidden">
                  <div v-for="i in Math.min(3, totalTicketsSold)" :key="i" class="w-6 h-6 rounded-full bg-stone-100 dark:bg-stone-800 border-2 border-white dark:border-stone-900 flex items-center justify-center text-[8px] z-[10]">
                    {{ ['🎭', '🔥', '✨'][i-1] }}
                  </div>
                </div>
                <span class="text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-widest">
                  {{ totalTicketsSold }} Attending
                </span>
              </div>
              <div v-else class="flex items-center gap-2">
                <span class="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-800/30">Be the first to join</span>
              </div>
              
              <div v-if="buttonState === 'almost_full'" class="flex items-center gap-1 animate-pulse">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span class="text-[9px] font-black text-amber-600 uppercase tracking-tighter">Fast Filling</span>
              </div>
            </div>

            <!-- Custom Capacity Bar -->
            <div class="space-y-1.5">
              <div class="h-1.5 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-1000 ease-out"
                  :class="[
                    buttonState === 'waitlist' ? 'bg-stone-400' : 
                    buttonState === 'almost_full' ? 'bg-amber-500' : 'bg-black dark:bg-stone-100'
                  ]"
                  :style="{ width: capacityPercentage + '%' }"
                ></div>
              </div>
              <div class="flex justify-between items-center px-0.5">
                <span class="text-[9px] font-black text-stone-300 dark:text-stone-600 uppercase tracking-[0.2em]">{{ capacityText }}</span>
                <span class="text-[9px] font-bold text-stone-400 tabular-nums">{{ Math.round(capacityPercentage) }}% Full</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Bar -->
    <div class="px-5 py-4 bg-stone-50 dark:bg-stone-800/50 border-t-2 border-black dark:border-stone-800 flex items-center justify-between">
      <div v-if="loading" class="flex items-center gap-2 text-stone-400">
        <div class="w-4 h-4 border-2 border-stone-200 border-t-black dark:border-t-white rounded-full animate-spin"></div>
        <span class="text-[10px] font-black uppercase tracking-widest">Syncing</span>
      </div>

      <div v-else-if="booked" class="w-full flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full" :class="[
            bookingStatus === 'waitlisted' ? 'bg-stone-400' : 
            bookingStatus === 'pending' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
          ]"></span>
          <span class="text-[11px] font-black uppercase tracking-widest text-stone-900 dark:text-white">
            {{ bookingBadgeLabel }}
          </span>
        </div>
        
        <NuxtLink 
          :to="bookingStatus === 'confirmed' || bookingStatus === 'checked_in' ? `/me/tickets/${eventId}` : `/events/${eventId}`"
          class="text-[10px] font-black text-stone-400 hover:text-black dark:hover:text-white uppercase tracking-widest border-b border-transparent hover:border-black transition-all"
        >
          {{ bookingStatus === 'pending' ? 'Complete Payment' : 'View Ticket' }}
        </NuxtLink>
      </div>

      <div v-else class="w-full flex items-center justify-between gap-4">
        <NuxtLink v-if="eventId" :to="`/events/${eventId}`" class="text-[11px] font-black text-stone-400 hover:text-black dark:hover:text-white uppercase tracking-widest transition-colors">
          Explore
        </NuxtLink>
        <button
          @click="$emit('book')"
          class="flex-1 py-2 rounded-lg text-[11px] font-black uppercase tracking-[0.15em] transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 active:scale-95 border-2 border-black"
          :class="[
            buttonState === 'waitlist' ? 'bg-white text-black' : 'bg-black text-white hover:bg-stone-900'
          ]"
        >
          {{ buttonText }}
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import UiButton from '~/components/ui/Button.vue'

interface Props {
  eventId?: string
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
  bookingStatus?: 'pending' | 'confirmed' | 'checked_in' | 'waitlisted' | 'cancelled' | null
  loading?: boolean
  minAge?: number | null
  maxAge?: number | null
}

const props = defineProps<Props>()

defineEmits<{
  book: []
}>()

const showMore = ref(false)

const eventDateObj = computed(() => new Date(props.eventDate))
const formattedMonth = computed(() => eventDateObj.value.toLocaleDateString('en-US', { month: 'short' }).toUpperCase())
const formattedDay = computed(() => eventDateObj.value.getDate())
const formattedTime = computed(() => eventDateObj.value.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }))

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
  if (buttonState.value === 'waitlist') return 'Waitlist Only'
  if (buttonState.value === 'almost_full') return `Last ${remaining} Spots`
  return `${remaining} Spots Left`
})

const buttonText = computed(() => {
  if (buttonState.value === 'waitlist') return 'Join Waitlist'
  if (buttonState.value === 'almost_full') return 'Secure Spot'
  return 'Book Spot'
})

const price = computed(() => props.userGender === 'female' ? props.ticketPriceFemale : props.ticketPriceMale)
const formattedPrice = computed(() =>
  new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 0 }).format(price.value)
)

const totalTicketsSold = computed(() => props.maleTicketsSold + props.femaleTicketsSold)

const bookingBadgeLabel = computed(() => {
  if (props.bookingStatus === 'pending') return 'Awaiting Payment'
  if (props.bookingStatus === 'waitlisted') return 'Waitlisted'
  if (props.bookingStatus === 'confirmed') return 'Confirmed'
  if (props.bookingStatus === 'checked_in') return 'Checked In'
  return 'Booked'
})

const downloadICS = () => {
  const eventStart = new Date(props.eventDate)
  const eventEnd = new Date(eventStart.getTime() + (3 * 60 * 60 * 1000))

  const formatDateForICS = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

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

<style scoped>
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
