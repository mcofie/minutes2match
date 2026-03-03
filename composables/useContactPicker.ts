/**
 * Contact Picker API Composable
 * Allows selecting a contact from the device address book
 */
export const useContactPicker = () => {
    const isSupported = ref(false)

    onMounted(() => {
        isSupported.value = !!(
            typeof window !== 'undefined' &&
            navigator &&
            'contacts' in navigator &&
            (navigator as any).contacts.select
        )
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
