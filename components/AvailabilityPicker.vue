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

    <div v-for="day in days" :key="day.id" 
         class="group bg-white dark:bg-stone-900 p-5 rounded-2xl border-2 border-black dark:border-stone-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)] hover:-translate-y-1 transition-all duration-300">
      
      <div class="flex items-center justify-between mb-5">
        <div class="flex items-center gap-3">
          <div 
            class="w-10 h-10 rounded-xl bg-stone-50 dark:bg-stone-800 border-2 border-black dark:border-stone-700 flex items-center justify-center text-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:bg-rose-500 group-hover:text-white transition-all duration-500"
            :class="{ 'bg-rose-500 text-white': modelValue[day.id]?.length > 0 }"
          >
            {{ day.icon }}
          </div>
          <div>
            <h4 class="text-xs font-black uppercase tracking-widest text-stone-900 dark:text-white leading-none">{{ day.label }}</h4>
            <p class="text-[8px] font-bold text-stone-400 uppercase tracking-tighter mt-1">{{ day.desc }}</p>
          </div>
        </div>
        <div v-if="modelValue[day.id]?.length" class="px-2 py-0.5 bg-rose-500 text-white text-[8px] font-black rounded-lg border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-in zoom-in-50">
          {{ modelValue[day.id]?.length }} SLOTS
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <button 
          v-for="slot in slots" 
          :key="slot.id"
          type="button"
          @click="toggle(day.id, slot.id)"
          class="group/btn relative py-4 px-2 rounded-xl border-2 text-[10px] font-black uppercase tracking-tight transition-all active:scale-90 flex flex-col items-center justify-center gap-1.5 overflow-hidden"
          :class="isSlotSelected(day.id, slot.id) 
            ? 'bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' 
            : 'bg-stone-50 dark:bg-stone-800 text-stone-400 border-stone-200 dark:border-stone-700 hover:border-black hover:text-stone-900'"
        >
          <div v-if="isSlotSelected(day.id, slot.id)" class="absolute inset-0 bg-gradient-to-tr from-rose-500/20 to-transparent opacity-50"></div>
          
          <span class="text-lg group-hover/btn:scale-125 transition-transform duration-300 relative z-10">{{ slot.icon }}</span>
          <span class="relative z-10">{{ slot.label }}</span>
          <span class="text-[7px] opacity-60 font-bold relative z-10">{{ slot.time }}</span>
          
          <!-- Selection indicator -->
          <div v-if="isSlotSelected(day.id, slot.id)" class="absolute top-1.5 right-1.5 w-3 h-3 bg-rose-500 text-white rounded-sm flex items-center justify-center text-[7px] border border-black animate-in zoom-in-75">
            ✓
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
