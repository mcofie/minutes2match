<template>
  <div v-if="modelValue" class="space-y-6">
    <!-- Quick Help -->
    <div class="p-3 bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-100 dark:border-indigo-900/30 rounded-xl flex items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-700">
       <span class="text-xl">📅</span>
       <div class="flex-1">
          <p class="text-[10px] font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-400 mb-1">Dating Pulse</p>
          <p class="text-[10px] text-stone-600 dark:text-stone-300 leading-relaxed italic">Select your "Ideal Date" windows. When you match, we'll suggest spots where you both have free time.</p>
       </div>
    </div>

    <div v-for="day in days" :key="day.id" class="mb-10 last:mb-0">
      
      <!-- Day Header -->
      <div class="flex items-center gap-4 mb-5 border-b border-stone-200 dark:border-stone-800 pb-4">
        <div 
          class="w-12 h-12 rounded-full border border-stone-200 dark:border-stone-800 flex items-center justify-center text-2xl transition-all duration-500"
          :class="{ 'bg-rose-50 border-rose-200 text-rose-500 dark:bg-rose-500/10 dark:border-rose-500/30': modelValue[day.id]?.length > 0, 'bg-[#FFFCF8] text-stone-500 dark:bg-stone-900': !modelValue[day.id]?.length }"
        >
          <span class="relative z-10 transform group-hover:scale-110 transition-transform">{{ day.icon }}</span>
        </div>
        <div class="flex-1">
          <h4 class="text-2xl font-serif font-medium text-stone-900 dark:text-stone-100 tracking-tight leading-none">{{ day.label }}</h4>
          <p class="text-[10px] text-stone-400 uppercase tracking-[0.2em] mt-1.5">{{ day.desc }}</p>
        </div>
        <div v-if="modelValue[day.id]?.length" class="text-[10px] font-bold text-rose-500 uppercase tracking-widest flex items-center gap-1.5 animate-in fade-in">
          <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          {{ modelValue[day.id]?.length }} Selected
        </div>
      </div>

      <!-- Slots Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button 
          v-for="slot in slots" 
          :key="slot.id"
          type="button"
          @click="toggle(day.id, slot.id)"
          class="relative p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between group/btn overflow-hidden"
          :class="isSlotSelected(day.id, slot.id) 
            ? 'border-black dark:border-white bg-black text-white dark:bg-white dark:text-black shadow-md scale-[1.02]' 
            : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-500 hover:border-stone-400 dark:hover:border-stone-600'"
        >
          <!-- Content -->
          <div class="flex items-center gap-4 relative z-10">
            <span class="text-2xl" :class="isSlotSelected(day.id, slot.id) ? 'opacity-100' : 'opacity-60 grayscale group-hover/btn:grayscale-0'">{{ slot.icon }}</span>
            <div class="text-left">
              <span class="block text-xs font-bold uppercase tracking-widest" :class="isSlotSelected(day.id, slot.id) ? 'text-white dark:text-black' : 'text-stone-900 dark:text-stone-100'">{{ slot.label }}</span>
              <span class="block text-[9px] font-medium opacity-60 uppercase tracking-[0.15em] mt-0.5" :class="isSlotSelected(day.id, slot.id) ? 'text-stone-300 dark:text-stone-600' : 'text-stone-400'">{{ slot.time }}</span>
            </div>
          </div>
          
          <!-- Circle Checkmark -->
          <div 
            class="w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-300 relative z-10"
            :class="isSlotSelected(day.id, slot.id) ? 'border-transparent bg-white text-black dark:bg-black dark:text-white' : 'border-stone-300 dark:border-stone-700 text-transparent'"
          >
            <svg v-if="isSlotSelected(day.id, slot.id)" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          </div>
        </button>
      </div>
    </div>

    <!-- Schedule Strength Meter -->
    <div v-if="totalSlotsCount > 0" class="p-5 bg-emerald-50 dark:bg-emerald-900/10 border-2 border-emerald-100 dark:border-emerald-900/20 rounded-2xl animate-in slide-in-from-bottom-2 duration-500">
       <div class="flex items-center justify-between mb-3">
          <span class="text-[10px] font-black uppercase tracking-widest text-emerald-700">Schedule Matchability</span>
          <span class="text-[10px] font-black text-emerald-900">{{ matchabilityPercentage }}%</span>
       </div>
       <div class="h-2 bg-emerald-100 dark:bg-stone-800 rounded-full overflow-hidden p-0.5 border border-emerald-200">
          <div 
             class="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.3)]"
             :style="{ width: matchabilityPercentage + '%' }"
          ></div>
       </div>
       <p class="text-[9px] text-emerald-700/60 font-medium mt-3 text-center uppercase tracking-widest">
          {{ totalSlotsCount }} dating windows selected. You are ready to match.
       </p>
    </div>

    <!-- Smart Suggestion Bonus -->
    <div class="p-6 bg-stone-900 text-white rounded-2xl border-2 border-stone-800 overflow-hidden relative shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
       <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 15px 15px;"></div>
       <div class="relative z-10">
          <h5 class="text-[9px] font-black uppercase tracking-[0.3em] text-rose-400 mb-2 italic">Pro Tip:</h5>
          <p class="text-[10px] font-medium leading-relaxed opacity-80">Users who specify <span class="text-white font-bold">"Friday Nights"</span> at <span class="text-rose-400 font-bold">Partner Venues</span> match 4x faster.</p>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface Availability {
  weekdays: string[]
  friday: string[]
  saturday: string[]
  sunday: string[]
}

const props = defineProps<{
  modelValue: Availability
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Availability]
}>()

const days = [
  { id: 'weekdays', label: 'Weekdays', desc: 'Mon - Thu', icon: '👔' },
  { id: 'friday', label: 'Friday Night', desc: 'The Social Peak', icon: '🥂' },
  { id: 'saturday', label: 'Saturday', desc: 'Weekend Flow', icon: '🎪' },
  { id: 'sunday', label: 'Sunday', desc: 'The Soft Landing', icon: '🌊' }
] as const

const slots = [
  { id: 'afternoon', label: 'Afternoon', icon: '☀️', time: '12-5pm' },
  { id: 'evening', label: 'Evening', icon: '🌅', time: '5-9pm' },
  { id: 'night', label: 'Late Night', icon: '🌙', time: '9pm+' }
] as const

const isSlotSelected = (dayId: string, slotId: string) => {
  return props.modelValue[dayId as keyof Availability]?.includes(slotId)
}

const toggle = (dayId: string, slotId: string) => {
  // Ensure we have a valid object to work with
  const current = JSON.parse(JSON.stringify(props.modelValue || {
    weekdays: [], friday: [], saturday: [], sunday: []
  })) as Availability
  
  const dayKey = dayId as keyof Availability
  const daySlots = current[dayKey] || []
  
  const index = daySlots.indexOf(slotId)
  if (index === -1) {
    daySlots.push(slotId)
  } else {
    daySlots.splice(index, 1)
  }
  
  current[dayKey] = daySlots
  emit('update:modelValue', current)
}

const totalSlotsCount = computed(() => {
  return Object.values(props.modelValue || {}).reduce((acc: number, curr: any) => acc + (curr?.length || 0), 0)
})

const matchabilityPercentage = computed(() => {
  // 12 slots max (4 days * 3 slots)
  const count = totalSlotsCount.value
  if (count === 0) return 0
  const base = Math.min(count * 15, 85) // 15% per slot up to 85%
  if (count > 4) return Math.min(base + 10, 99)
  return base
})
</script>
