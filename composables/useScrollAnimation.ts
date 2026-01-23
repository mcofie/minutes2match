// Scroll-triggered animation composable using Intersection Observer
import { ref, onMounted, onUnmounted } from 'vue'

export interface ScrollAnimationOptions {
    threshold?: number
    rootMargin?: string
    once?: boolean
}

export function useScrollAnimation(options: ScrollAnimationOptions = {}) {
    const { threshold = 0.1, rootMargin = '0px 0px -50px 0px', once = true } = options

    const isVisible = ref(false)
    const elementRef = ref<HTMLElement | null>(null)
    let observer: IntersectionObserver | null = null

    const setupObserver = () => {
        if (!elementRef.value) return

        observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        isVisible.value = true
                        if (once && observer) {
                            observer.unobserve(entry.target)
                        }
                    } else if (!once) {
                        isVisible.value = false
                    }
                })
            },
            { threshold, rootMargin }
        )

        observer.observe(elementRef.value)
    }

    onMounted(() => {
        setupObserver()
    })

    onUnmounted(() => {
        if (observer && elementRef.value) {
            observer.unobserve(elementRef.value)
            observer.disconnect()
        }
    })

    return {
        elementRef,
        isVisible
    }
}

// Directive version for simpler usage
export const vScrollAnimate = {
    mounted(el: HTMLElement, binding: any) {
        const options = binding.value || {}
        const { threshold = 0.1, delay = 0, animation = 'fade-up' } = options

        // Add initial hidden state
        el.style.opacity = '0'
        el.style.transform = getInitialTransform(animation)
        el.style.transition = `opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        el.style.opacity = '1'
                        el.style.transform = 'translateY(0) translateX(0) scale(1)'
                        observer.unobserve(el)
                    }
                })
            },
            { threshold, rootMargin: '0px 0px -50px 0px' }
        )

        observer.observe(el)

            // Store observer for cleanup
            ; (el as any)._scrollObserver = observer
    },

    unmounted(el: HTMLElement) {
        const observer = (el as any)._scrollObserver
        if (observer) {
            observer.disconnect()
        }
    }
}

function getInitialTransform(animation: string): string {
    switch (animation) {
        case 'fade-up':
            return 'translateY(30px)'
        case 'fade-down':
            return 'translateY(-30px)'
        case 'fade-left':
            return 'translateX(30px)'
        case 'fade-right':
            return 'translateX(-30px)'
        case 'scale':
            return 'scale(0.9)'
        case 'fade':
            return 'translateY(0)'
        default:
            return 'translateY(30px)'
    }
}
