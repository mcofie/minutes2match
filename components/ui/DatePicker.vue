<template>
  <div class="relative" ref="container">
    <!-- Trigger Input -->
    <div 
      @click="togglePopover"
      class="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 hover:bg-white dark:hover:bg-stone-800 focus-within:bg-white dark:focus-within:bg-stone-800 focus-within:ring-2 focus-within:ring-black dark:focus-within:ring-stone-500 focus-within:border-transparent transition-all cursor-pointer flex items-center justify-between group"
      :class="{ 'ring-2 ring-black dark:ring-stone-500 bg-white dark:bg-stone-800 border-transparent': isOpen }"
    >
      <span v-if="modelValue" class="font-medium text-stone-900 dark:text-stone-100">{{ formattedValue }}</span>
      <span v-else class="text-stone-400 dark:text-stone-500">{{ placeholder }}</span>
      
      <span class="text-stone-400 dark:text-stone-500 group-hover:text-black dark:group-hover:text-white transition-colors">
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
      class="absolute top-full left-0 mt-2 bg-white dark:bg-stone-900 rounded-xl shadow-xl border border-stone-100 dark:border-stone-700 p-4 z-50 w-[320px] animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <!-- Birthday Mode: Simple Dropdowns -->
      <div v-if="forBirthday" class="space-y-4">
        <p class="text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 text-center">Select your birthday</p>
        
        <div class="grid grid-cols-3 gap-2">
          <!-- Month -->
          <div>
            <label class="block text-[10px] font-bold uppercase text-stone-400 dark:text-stone-500 mb-1">Month</label>
            <select 
              v-model="selectedMonth" 
              @change="updateBirthday"
              class="w-full px-2 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-stone-500"
            >
              <option v-for="(month, idx) in months" :key="idx" :value="idx">{{ month }}</option>
            </select>
          </div>
          
          <!-- Day -->
          <div>
            <label class="block text-[10px] font-bold uppercase text-stone-400 dark:text-stone-500 mb-1">Day</label>
            <select 
              v-model="selectedDay" 
              @change="updateBirthday"
              class="w-full px-2 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-stone-500"
            >
              <option v-for="day in daysInSelectedMonth" :key="day" :value="day">{{ day }}</option>
            </select>
          </div>
          
          <!-- Year -->
          <div>
            <label class="block text-[10px] font-bold uppercase text-stone-400 dark:text-stone-500 mb-1">Year</label>
            <select 
              v-model="selectedYear" 
              @change="updateBirthday"
              class="w-full px-2 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-stone-500"
            >
              <option v-for="year in yearOptions" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>
        </div>
        
        <!-- Age Preview -->
        <div v-if="calculatedAge" class="text-center py-2 bg-stone-50 dark:bg-stone-800 rounded-lg">
          <span class="text-sm text-stone-600 dark:text-stone-400">You'll be </span>
          <span class="font-bold text-stone-900 dark:text-stone-100">{{ calculatedAge }} years old</span>
        </div>
        
        <!-- Done Button -->
        <button 
          @click="confirmBirthday"
          :disabled="!isValidBirthday"
          class="w-full py-3 bg-black dark:bg-stone-100 text-white dark:text-black rounded-lg font-bold text-sm hover:bg-stone-800 dark:hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirm
        </button>
      </div>

      <!-- Standard Date Picker Mode -->
      <div v-else-if="mode !== 'time'">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <button @click.stop="changeMonth(-1)" class="p-1 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors">
            <svg class="w-5 h-5 text-stone-600 dark:text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div class="flex items-center gap-1">
            <span class="font-bold text-stone-900 dark:text-stone-100">{{ currentMonthName }}</span>
            <input 
              type="number" 
              v-model="currentYear" 
              class="w-16 p-1 text-center font-bold text-stone-900 dark:text-stone-100 bg-transparent hover:bg-stone-50 dark:hover:bg-stone-800 rounded focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-stone-500"
              @click.stop
            />
          </div>

          <button @click.stop="changeMonth(1)" class="p-1 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors">
            <svg class="w-5 h-5 text-stone-600 dark:text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <!-- Week days -->
        <div class="grid grid-cols-7 mb-2">
          <span v-for="day in weekDays" :key="day" class="text-center text-xs font-bold text-stone-400 dark:text-stone-500 uppercase">
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
                ? 'bg-black dark:bg-stone-100 text-white dark:text-black shadow-md' 
                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
            ]"
          >
            {{ day }}
          </button>
        </div>
      </div>

      <!-- Time Picker Section (Optional or Standalone) -->
      <div v-if="enableTime && !forBirthday" class="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800">
        <div class="flex items-center justify-center gap-2">
          <div class="flex flex-col items-center">
            <label class="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 mb-1">Hour</label>
            <input 
              type="number" 
              v-model="selectedHour" 
              min="0" 
              max="23"
              class="w-12 p-2 text-center bg-stone-50 dark:bg-stone-800 dark:text-white rounded-lg border border-stone-200 dark:border-stone-700 focus:ring-1 focus:ring-black dark:focus:ring-stone-500 outline-none font-bold"
              @change="updateTime"
            />
          </div>
          <span class="text-xl font-bold text-stone-300 dark:text-stone-600 mt-4">:</span>
          <div class="flex flex-col items-center">
            <label class="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 mb-1">Min</label>
            <input 
              type="number" 
              v-model="selectedMinute" 
              min="0" 
              max="59"
              class="w-12 p-2 text-center bg-stone-50 dark:bg-stone-800 dark:text-white rounded-lg border border-stone-200 dark:border-stone-700 focus:ring-1 focus:ring-black dark:focus:ring-stone-500 outline-none font-bold"
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
 * Custom DatePicker with special Birthday mode
 * Birthday mode shows simple month/day/year dropdowns
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
  },
  forBirthday: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const container = ref(null)

// Calendar State
const now = new Date()
const viewDate = ref(new Date())
const currentYear = computed({
  get: () => viewDate.value.getFullYear(),
  set: (val) => viewDate.value.setFullYear(val)
})

// Birthday dropdowns state
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const selectedMonth = ref(0)
const selectedDay = ref(1)
const selectedYear = ref(now.getFullYear() - 25) // Default to ~25 years ago

// Generate year options (18-80 years ago)
const yearOptions = computed(() => {
  const currentYear = now.getFullYear()
  const years: number[] = []
  for (let y = currentYear - 18; y >= currentYear - 80; y--) {
    years.push(y)
  }
  return years
})

// Days in selected month for birthday picker
const daysInSelectedMonth = computed(() => {
  const days = new Date(selectedYear.value, selectedMonth.value + 1, 0).getDate()
  return Array.from({ length: days }, (_, i) => i + 1)
})

// Calculated age for preview
const calculatedAge = computed(() => {
  const today = new Date()
  const birthDate = new Date(selectedYear.value, selectedMonth.value, selectedDay.value)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age >= 0 && age < 120 ? age : null
})

const isValidBirthday = computed(() => {
  return calculatedAge.value !== null && calculatedAge.value >= 18 && calculatedAge.value < 120
})

// Time State
const selectedHour = ref(12)
const selectedMinute = ref(0)

// Initialization
watch(() => props.modelValue, (val) => {
  if (val) {
    const d = new Date(val)
    if (!isNaN(d.getTime())) {
      viewDate.value = new Date(d)
      if (props.forBirthday) {
        selectedMonth.value = d.getMonth()
        selectedDay.value = d.getDate()
        selectedYear.value = d.getFullYear()
      }
      if (props.enableTime || props.mode === 'time') {
        selectedHour.value = d.getHours()
        selectedMinute.value = d.getMinutes()
      }
    }
  }
}, { immediate: true })

onClickOutside(container, () => {
  isOpen.value = false
})

const togglePopover = () => {
  isOpen.value = !isOpen.value
}

// Birthday functions
const updateBirthday = () => {
  // Keep day in valid range if month changes
  const maxDays = daysInSelectedMonth.value.length
  if (selectedDay.value > maxDays) {
    selectedDay.value = maxDays
  }
}

const confirmBirthday = () => {
  if (!isValidBirthday.value) return
  
  const year = selectedYear.value
  const month = String(selectedMonth.value + 1).padStart(2, '0')
  const day = String(selectedDay.value).padStart(2, '0')
  emit('update:modelValue', `${year}-${month}-${day}`)
  isOpen.value = false
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
    emit('update:modelValue', d.toISOString())
  } else {
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
  
  if (isNaN(d.getTime())) return ''
  
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
