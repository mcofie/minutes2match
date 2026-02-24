/**
 * Paystack Payment Integration Composable
 * Handles payment initialization and verification
 */

export interface PaymentMetadata {
    purpose: 'event_ticket' | 'match_unlock' | 'subscription'
    eventId?: string
    matchId?: string
    userId: string
}

export const usePaystack = () => {
    const config = useRuntimeConfig()
    const supabase = useSupabaseClient()

    /**
     * Initialize a Paystack payment
     */
    const initializePayment = async (
        email: string,
        amount: number, // Amount in GHS
        purpose: 'event_ticket' | 'match_unlock' | 'subscription',
        metadata: Partial<PaymentMetadata>
    ) => {
        const callbackUrl = `${config.public.baseUrl}/payment/callback`

        const response = await $fetch<{ authorization_url: string; reference: string }>('/api/paystack/initialize', {
            method: 'POST',
            body: {
                email,
                amount,
                callback_url: callbackUrl,
                metadata: {
                    purpose,
                    ...metadata
                }
            }
        })

        return response as any
    }

    /**
     * Verify payment status
     */
    const verifyPayment = async (reference: string) => {
        const response = await $fetch<{ status: string; reference: string; amount: number; currency: string; metadata: any }>('/api/paystack/verify', {
            method: 'GET',
            query: { reference }
        })

        return response
    }

    /**
     * Create payment record in database
     */
    const createPaymentRecord = async (
        userId: string,
        amount: number,
        purpose: 'event_ticket' | 'match_unlock' | 'subscription',
        providerRef: string,
        metadata?: Record<string, any>
    ) => {
        const { data, error } = await supabase
            .from('payments')
            .insert({
                user_id: userId,
                amount,
                currency: 'GHS',
                provider: 'paystack',
                provider_ref: providerRef,
                purpose,
                status: 'pending',
                metadata
            } as any)
            .select()
            .single()

        if (error) {
            throw new Error('Failed to create payment record')
        }

        return data
    }

    /**
     * Get event ticket price based on gender
     */
    const getEventPrice = (event: { ticket_price_male: number; ticket_price_female: number }, gender: 'male' | 'female') => {
        return gender === 'female' ? event.ticket_price_female : event.ticket_price_male
    }

    /**
     * Format amount as Ghana Cedis
     */
    const formatGHS = (amount: number) => {
        return new Intl.NumberFormat('en-GH', {
            style: 'currency',
            currency: 'GHS',
            minimumFractionDigits: 2
        }).format(amount)
    }

    return {
        initializePayment,
        verifyPayment,
        createPaymentRecord,
        getEventPrice,
        formatGHS
    }
}
