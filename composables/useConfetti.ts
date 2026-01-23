// Confetti animation composable
import { ref } from 'vue'

interface ConfettiParticle {
    id: number
    x: number
    y: number
    color: string
    size: number
    rotation: number
    velocity: { x: number; y: number }
    rotationSpeed: number
    opacity: number
}

const particles = ref<ConfettiParticle[]>([])
const isActive = ref(false)
let animationFrame: number | null = null
let particleId = 0

const colors = [
    '#F43F5E', // rose-500
    '#000000', // black
    '#FBBF24', // amber-400
    '#34D399', // emerald-400
    '#60A5FA', // blue-400
    '#A78BFA', // violet-400
    '#FB7185', // rose-400
]

export function useConfetti() {
    const createParticle = (x: number, y: number): ConfettiParticle => {
        const angle = Math.random() * Math.PI * 2
        const velocity = 8 + Math.random() * 8

        return {
            id: particleId++,
            x,
            y,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: 6 + Math.random() * 8,
            rotation: Math.random() * 360,
            velocity: {
                x: Math.cos(angle) * velocity,
                y: Math.sin(angle) * velocity - 10 // Initial upward boost
            },
            rotationSpeed: (Math.random() - 0.5) * 20,
            opacity: 1
        }
    }

    const burst = (x?: number, y?: number, count = 50) => {
        // Default to center of screen
        const centerX = x ?? window.innerWidth / 2
        const centerY = y ?? window.innerHeight / 3

        // Create particles
        for (let i = 0; i < count; i++) {
            particles.value.push(createParticle(centerX, centerY))
        }

        if (!isActive.value) {
            isActive.value = true
            animate()
        }
    }

    const animate = () => {
        particles.value = particles.value
            .map(p => ({
                ...p,
                x: p.x + p.velocity.x,
                y: p.y + p.velocity.y,
                rotation: p.rotation + p.rotationSpeed,
                velocity: {
                    x: p.velocity.x * 0.98, // Air resistance
                    y: p.velocity.y + 0.4 // Gravity
                },
                opacity: p.opacity - 0.008
            }))
            .filter(p => p.opacity > 0 && p.y < window.innerHeight + 100)

        if (particles.value.length > 0) {
            animationFrame = requestAnimationFrame(animate)
        } else {
            isActive.value = false
            if (animationFrame) {
                cancelAnimationFrame(animationFrame)
                animationFrame = null
            }
        }
    }

    const clear = () => {
        particles.value = []
        isActive.value = false
        if (animationFrame) {
            cancelAnimationFrame(animationFrame)
            animationFrame = null
        }
    }

    return {
        particles,
        isActive,
        burst,
        clear
    }
}
