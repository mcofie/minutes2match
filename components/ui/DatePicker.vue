<template>
  <div class="relative" ref="container">
    <!-- Trigger Input -->
    <div 
      @click="togglePopover"
      class="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-white focus-within:bg-white focus-within:ring-2 focus-within:ring-black focus-within:border-transparent transition-all cursor-pointer flex items-center justify-between group"
      :class="{ 'ring-2 ring-black bg-white border-transparent': isOpen }"
    >
      <span v-if="modelValue" class="font-medium text-stone-900">{{ formattedValue }}</span>
      <span v-else class="text-stone-400">{{ placeholder }}</span>
      
      <span class="text-stone-400 group-hover:text-black transition-colors">
        <svg v-if="mode === 'time'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </span>
    </div>

    <!-- Popover -->
    <div 
      v-if="isOpen" 
      class="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-stone-100 p-4 z-50 w-[320px] animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <!-- Date Picker Mode -->
      <div v-if="mode !== 'time'">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <button @click.stop="changeMonth(-1)" class="p-1 hover:bg-stone-100 rounded-lg transition-colors">
            <svg class="w-5 h-5 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div class="flex items-center gap-1">
            <span class="font-bold text-stone-900">{{ currentMonthName }}</span>
            <input 
              type="number" 
              v-model="currentYear" 
              class="w-16 p-1 text-center font-bold text-stone-900 bg-transparent hover:bg-stone-50 rounded focus:outline-none focus:ring-1 focus:ring-black"
              @click.stop
            />
          </div>

          <button @click.stop="changeMonth(1)" class="p-1 hover:bg-stone-100 rounded-lg transition-colors">
            <svg class="w-5 h-5 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <!-- Week days -->
        <div class="grid grid-cols-7 mb-2">
          <span v-for="day in weekDays" :key="day" class="text-center text-xs font-bold text-stone-400 uppercase">
            {{ day }}
          </span>
        </div>

        <!-- Days -->
        <div class="grid grid-cols-7 gap-1">
          <!-- Empty start days -->
          <div v-for="i in startDayOffset" :key="`empty-${i}`" class="h-9"></div>
          
          <!-- Actual days -->
          <button
            v-for="day in daysInMonth"
            :key="day"
            @click.stop="selectDate(day)"
            class="h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium transition-all mx-auto"
            :class="[
              isSelected(day) 
                ? 'bg-black text-white shadow-md' 
                : 'text-stone-700 hover:bg-stone-100'
            ]"
          >
            {{ day }}
          </button>
        </div>
      </div>

      <!-- Time Picker Section (Optional or Standalone) -->
      <div v-if="enableTime" class="mt-4 pt-4 border-t border-stone-100">
        <div class="flex items-center justify-center gap-2">
          <div class="flex flex-col items-center">
            <label class="text-[10px] uppercase font-bold text-stone-400 mb-1">Hour</label>
            <input 
              type="number" 
              v-model="selectedHour" 
              min="0" 
              max="23"
              class="w-12 p-2 text-center bg-stone-50 rounded-lg border border-stone-200 focus:ring-1 focus:ring-black outline-none font-bold"
              @change="updateTime"
            />
          </div>
          <span class="text-xl font-bold text-stone-300 mt-4">:</span>
          <div class="flex flex-col items-center">
            <label class="text-[10px] uppercase font-bold text-stone-400 mb-1">Min</label>
            <input 
              type="number" 
              v-model="selectedMinute" 
              min="0" 
              max="59"
              class="w-12 p-2 text-center bg-stone-50 rounded-lg border border-stone-200 focus:ring-1 focus:ring-black outline-none font-bold"
              @change="updateTime"
            />
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'

/**
 * Custom DatePicker adapted for Loops.so design
 * Handles Date only, or Date + Time logic if needed
 */

const props = defineProps({
  modelValue: {
    type: String, // ISO String or YYYY-MM-DD
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Select date'
  },
  mode: {
    type: String as PropType<'date' | 'time' | 'datetime'>,
    default: 'date'
  },
  enableTime: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const container = ref(null)

// Calendar State
const now = new Date()
const viewDate = ref(new Date()) // The month currently being viewed
const currentYear = computed({
  get: () => viewDate.value.getFullYear(),
  set: (val) => viewDate.value.setFullYear(val)
})

// Time State
const selectedHour = ref(12)
const selectedMinute = ref(0)

// Initialization
watch(() => props.modelValue, (val) => {
  if (val) {
    const d = new Date(val)
    viewDate.value = new Date(d) // create copy
    if (props.enableTime || props.mode === 'time') {
      selectedHour.value = d.getHours()
      selectedMinute.value = d.getMinutes()
    }
  }
}, { immediate: true })

onClickOutside(container, () => {
  isOpen.value = false
})

const togglePopover = () => {
  isOpen.value = !isOpen.value
}

// Calendar Logic
const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const currentMonthName = computed(() => {
  return viewDate.value.toLocaleDateString('en-US', { month: 'long' })
})

const daysInMonth = computed(() => {
  const year = viewDate.value.getFullYear()
  const month = viewDate.value.getMonth()
  return new Date(year, month + 1, 0).getDate()
})

const startDayOffset = computed(() => {
  const year = viewDate.value.getFullYear()
  const month = viewDate.value.getMonth()
  return new Date(year, month, 1).getDay()
})

const changeMonth = (delta: number) => {
  const d = new Date(viewDate.value)
  d.setMonth(d.getMonth() + delta)
  viewDate.value = d
}

const isSelected = (day: number) => {
  if (!props.modelValue) return false
  const d = new Date(props.modelValue)
  // Check if year, month, and day match viewDate
  return d.getDate() === day && 
         d.getMonth() === viewDate.value.getMonth() && 
         d.getFullYear() === viewDate.value.getFullYear()
}

const selectDate = (day: number) => {
  const d = new Date(viewDate.value)
  d.setDate(day)
  
  if (props.enableTime) {
    d.setHours(selectedHour.value)
    d.setMinutes(selectedMinute.value)
    emit('update:modelValue', d.toISOString()) // send full ISO for datetime
  } else {
    // Return YYYY-MM-DD for simple date
    // ensure we don't have timezone offset issues by using local YYYY-MM-DD construction
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const dayStr = String(day).padStart(2, '0')
    emit('update:modelValue', `${year}-${month}-${dayStr}`)
    isOpen.value = false
  }
}

const updateTime = () => {
  if (!props.modelValue) return
  const d = new Date(props.modelValue)
  d.setHours(selectedHour.value)
  d.setMinutes(selectedMinute.value)
  emit('update:modelValue', d.toISOString())
}

// Formatting for Display
const formattedValue = computed(() => {
  if (!props.modelValue) return ''
  const d = new Date(props.modelValue)
  
  if (props.mode === 'time') {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }
  
  let options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }
  
  if (props.enableTime) {
    options = { ...options, hour: 'numeric', minute: '2-digit', hour12: true }
  }
  
  return d.toLocaleDateString('en-US', options)
})
</script>
