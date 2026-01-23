// Scroll animation directive plugin
export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.directive('scroll-animate', {
        mounted(el: HTMLElement, binding: any) {
            const options = binding.value || {}
            const { threshold = 0.15, delay = 0, animation = 'fade-up' } = options

            // Add initial hidden state
            el.style.opacity = '0'
            el.style.transform = getInitialTransform(animation)
            el.style.transition = `opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`

            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            // Small delay to ensure smooth animation
                            requestAnimationFrame(() => {
                                el.style.opacity = '1'
                                el.style.transform = 'translateY(0) translateX(0) scale(1)'
                            })
                            observer.unobserve(el)
                        }
                    })
                },
                { threshold, rootMargin: '0px 0px -80px 0px' }
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
    })
})

function getInitialTransform(animation: string): string {
    switch (animation) {
        case 'fade-up':
            return 'translateY(40px)'
        case 'fade-down':
            return 'translateY(-40px)'
        case 'fade-left':
            return 'translateX(40px)'
        case 'fade-right':
            return 'translateX(-40px)'
        case 'scale':
            return 'scale(0.92)'
        case 'fade':
            return 'translateY(0)'
        default:
            return 'translateY(40px)'
    }
}
