<template>
  <div class="space-y-1">
    <!-- Label -->
    <label 
      v-if="label" 
      :for="id"
      class="block text-[10px] font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400"
    >
      {{ label }}
      <span v-if="required" class="text-rose-500">*</span>
    </label>
    
    <!-- Input wrapper -->
    <div class="relative">
      <!-- Icon prefix -->
      <div 
        v-if="$slots.prefix || icon" 
        class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
      >
        <slot name="prefix">
          <span v-if="icon" class="text-lg">{{ icon }}</span>
        </slot>
      </div>
      
      <!-- Input element -->
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        class="w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 outline-none font-medium
               bg-white dark:bg-stone-900 
               text-stone-900 dark:text-stone-100
               placeholder:text-stone-300 dark:placeholder:text-stone-600
               disabled:opacity-50 disabled:cursor-not-allowed"
        :class="[
          hasError 
            ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-100' 
            : 'border-stone-200 dark:border-stone-700 focus:border-black dark:focus:border-stone-500 focus:ring-2 focus:ring-stone-100 dark:focus:ring-stone-800',
          icon || $slots.prefix ? 'pl-10' : '',
          $slots.suffix ? 'pr-10' : ''
        ]"
      />
      
      <!-- Icon suffix / Status indicator -->
      <div 
        v-if="$slots.suffix || hasError || (touched && !hasError)" 
        class="absolute right-3 top-1/2 -translate-y-1/2"
      >
        <slot name="suffix">
          <!-- Error icon -->
          <svg v-if="hasError" class="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <!-- Success icon -->
          <svg v-else-if="touched && showSuccess" class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </slot>
      </div>
    </div>
    
    <!-- Error message -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <p v-if="hasError && errorMessage" class="text-xs text-rose-500 font-medium flex items-center gap-1">
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
        {{ errorMessage }}
      </p>
    </Transition>
    
    <!-- Hint text -->
    <p v-if="hint && !hasError" class="text-xs text-stone-400 dark:text-stone-500">
      {{ hint }}
    </p>
    
    <!-- Character count -->
    <p v-if="showCount && maxLength" class="text-xs text-stone-400 text-right">
      {{ String(modelValue || '').length }} / {{ maxLength }}
    </p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string | number
  id?: string
  label?: string
  type?: string
  placeholder?: string
  icon?: string
  hint?: string
  errorMessage?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  maxLength?: number
  showCount?: boolean
  showSuccess?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  showSuccess: true
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'blur': [event: FocusEvent]
  'focus': [event: FocusEvent]
}>()

const touched = ref(false)

const hasError = computed(() => {
  return touched.value && !!props.errorMessage
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleBlur = (event: FocusEvent) => {
  touched.value = true
  emit('blur', event)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}
</script>
