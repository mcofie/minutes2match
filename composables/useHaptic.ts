export const useHaptic = () => {
    const vibrate = (pattern: number | number[] = 50) => {
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
            try {
                window.navigator.vibrate(pattern)
            } catch (e) {
                console.warn('Haptics not supported or blocked')
            }
        }
    }

    const hapticSuccess = () => vibrate([50, 50, 50])
    const hapticError = () => vibrate([100, 50, 100, 50, 100])
    const hapticTap = () => vibrate(30)
    const hapticHeavy = () => vibrate(100)

    return {
        vibrate,
        hapticSuccess,
        hapticError,
        hapticTap,
        hapticHeavy
    }
}
