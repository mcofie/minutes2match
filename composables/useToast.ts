// Toast notification composable
import { ref, readonly } from 'vue'

export interface Toast {
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message?: string
    duration?: number
}

const toasts = ref<Toast[]>([])

export function useToast() {
    const show = (options: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).slice(2)
        const toast: Toast = {
            id,
            ...options,
            duration: options.duration ?? 4000
        }

        toasts.value.push(toast)

        // Auto remove after duration
        if (toast.duration && toast.duration > 0) {
            setTimeout(() => {
                remove(id)
            }, toast.duration)
        }

        return id
    }

    const remove = (id: string) => {
        const index = toasts.value.findIndex(t => t.id === id)
        if (index > -1) {
            toasts.value.splice(index, 1)
        }
    }

    const success = (title: string, message?: string) => {
        return show({ type: 'success', title, message })
    }

    const error = (title: string, message?: string) => {
        return show({ type: 'error', title, message, duration: 6000 })
    }

    const warning = (title: string, message?: string) => {
        return show({ type: 'warning', title, message })
    }

    const info = (title: string, message?: string) => {
        return show({ type: 'info', title, message })
    }

    const clear = () => {
        toasts.value = []
    }

    return {
        toasts: readonly(toasts),
        show,
        remove,
        success,
        error,
        warning,
        info,
        clear
    }
}
