/**
 * Contact Picker API Composable
 * Allows selecting a contact from the device address book
 */
export const useContactPicker = () => {
    const isSupported = ref(false)

    onMounted(() => {
        const hasAPI = typeof window !== 'undefined' && navigator && 'contacts' in navigator
        const isSecure = typeof window !== 'undefined' && window.isSecureContext

        console.log('[ContactPicker] Debug:', {
            hasAPI,
            isSecure,
            userAgent: navigator.userAgent
        })

        isSupported.value = !!(hasAPI && isSecure && (navigator as any).contacts.select)

        if (!isSecure && hasAPI) {
            console.warn('[ContactPicker] API is available but requires a Secure Context (HTTPS) to work.')
        }
    })

    const pickContact = async () => {
        if (!isSupported.value) return null

        try {
            const props = ['name', 'tel']
            const opts = { multiple: false }
            const contacts = await (navigator as any).contacts.select(props, opts)

            if (contacts && contacts.length > 0) {
                const contact = contacts[0]
                const name = contact.name && contact.name[0] ? contact.name[0] : ''
                const tel = contact.tel && contact.tel[0] ? contact.tel[0] : ''

                // Clean phone number: remove spaces, dashes, parentheses, dots
                // But keep + if it's there (normalizeGhanaPhone handles it later)
                const cleanTel = tel.replace(/[\s\-\(\)\.]/g, '')

                return {
                    name,
                    phone: cleanTel,
                    original: contact
                }
            }
        } catch (err) {
            console.warn('Contact picker was cancelled or failed:', err)
        }
        return null
    }

    return {
        isSupported,
        pickContact
    }
}
