// Form validation composable with inline error support
import { reactive, computed } from 'vue'

export interface ValidationRule {
    validate: (value: any) => boolean
    message: string
}

export interface FieldConfig {
    rules: ValidationRule[]
    hint?: string
}

export interface FieldState {
    value: any
    error: string | null
    touched: boolean
    hint: string
    isValid: boolean
}

export function useFormValidation<T extends Record<string, any>>(
    initialValues: T,
    fieldConfigs: Partial<Record<keyof T, FieldConfig>>
) {
    const fields = reactive<Record<string, FieldState>>({})

    // Initialize fields
    for (const key in initialValues) {
        const config = fieldConfigs[key as keyof T]
        fields[key] = {
            value: initialValues[key],
            error: null,
            touched: false,
            hint: config?.hint || '',
            isValid: true
        }
    }

    const validateField = (fieldName: string): boolean => {
        const config = fieldConfigs[fieldName as keyof T]
        const field = fields[fieldName]

        if (!config || !field) return true

        field.touched = true

        for (const rule of config.rules) {
            if (!rule.validate(field.value)) {
                field.error = rule.message
                field.isValid = false
                return false
            }
        }

        field.error = null
        field.isValid = true
        return true
    }

    const validateAll = (): boolean => {
        let allValid = true
        for (const key in fields) {
            if (!validateField(key)) {
                allValid = false
            }
        }
        return allValid
    }

    const resetField = (fieldName: string) => {
        const field = fields[fieldName]
        if (field) {
            field.error = null
            field.touched = false
            field.isValid = true
        }
    }

    const resetAll = () => {
        for (const key in fields) {
            resetField(key)
            fields[key].value = initialValues[key as keyof T]
        }
    }

    const isFormValid = computed(() => {
        return Object.values(fields).every(f => f.isValid)
    })

    const hasErrors = computed(() => {
        return Object.values(fields).some(f => f.error !== null)
    })

    // Common validation rules
    const rules = {
        required: (message = 'This field is required'): ValidationRule => ({
            validate: (value) => {
                if (Array.isArray(value)) return value.length > 0
                if (typeof value === 'string') return value.trim().length > 0
                return value !== null && value !== undefined
            },
            message
        }),

        minLength: (min: number, message?: string): ValidationRule => ({
            validate: (value) => String(value).length >= min,
            message: message || `Must be at least ${min} characters`
        }),

        maxLength: (max: number, message?: string): ValidationRule => ({
            validate: (value) => String(value).length <= max,
            message: message || `Must be no more than ${max} characters`
        }),

        email: (message = 'Please enter a valid email'): ValidationRule => ({
            validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            message
        }),

        phone: (message = 'Please enter a valid phone number'): ValidationRule => ({
            validate: (value) => /^[\d\s\-+()]{10,}$/.test(value),
            message
        }),

        min: (minValue: number, message?: string): ValidationRule => ({
            validate: (value) => Number(value) >= minValue,
            message: message || `Must be at least ${minValue}`
        }),

        max: (maxValue: number, message?: string): ValidationRule => ({
            validate: (value) => Number(value) <= maxValue,
            message: message || `Must be no more than ${maxValue}`
        }),

        pattern: (regex: RegExp, message: string): ValidationRule => ({
            validate: (value) => regex.test(value),
            message
        }),

        custom: (fn: (value: any) => boolean, message: string): ValidationRule => ({
            validate: fn,
            message
        })
    }

    return {
        fields,
        validateField,
        validateAll,
        resetField,
        resetAll,
        isFormValid,
        hasErrors,
        rules
    }
}
