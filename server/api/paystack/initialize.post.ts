/**
 * Paystack Payment Initialization
 * POST /api/paystack/initialize
 * 
 * Initializes a Paystack transaction and returns authorization URL
 */

interface InitializePaymentBody {
    email: string
    amount: number // Amount in GHS (cedis)
    callback_url?: string
    metadata?: {
        purpose: 'event_ticket' | 'match_unlock'
        userId?: string
        eventId?: string
        matchId?: string
    }
}

export default defineEventHandler(async (event) => {
    console.log('[Paystack] Initialize payment request received')
    const body = await readBody<InitializePaymentBody>(event)
    console.log('[Paystack] Request body:', { email: body.email, amount: body.amount, metadata: body.metadata })

    if (!body.email || !body.amount) {
        throw createError({
            statusCode: 400,
            message: 'Missing required fields: email, amount'
        })
    }

    const config = useRuntimeConfig()

    if (!config.paystackSecretKey) {
        throw createError({
            statusCode: 500,
            message: 'Paystack credentials not configured'
        })
    }

    // Debug: Log key info (only prefix for security)
    console.log('[Paystack] Key prefix:', config.paystackSecretKey.substring(0, 10) + '...')
    console.log('[Paystack] Key length:', config.paystackSecretKey.length)

    try {
        const response = await $fetch<{
            status: boolean
            message: string
            data: {
                authorization_url: string
                access_code: string
                reference: string
            }
        }>('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.paystackSecretKey}`,
                'Content-Type': 'application/json'
            },
            body: {
                email: body.email,
                amount: Math.round(body.amount * 100), // Convert to pesewas
                currency: 'GHS',
                callback_url: body.callback_url || `${config.public.baseUrl}/payment/callback`,
                metadata: body.metadata
            }
        })

        if (!response.status) {
            throw new Error(response.message)
        }

        return {
            authorization_url: response.data.authorization_url,
            reference: response.data.reference,
            access_code: response.data.access_code
        }
    } catch (error: any) {
        console.error('Paystack Initialize Error:', {
            message: error.message,
            data: error.data,
            statusCode: error.statusCode,
            body: {
                email: body.email,
                amount: body.amount,
                metadata: body.metadata
            }
        })
        throw createError({
            statusCode: 500,
            message: `Failed to initialize payment: ${error.data?.message || error.message || 'Unknown error'}`
        })
    }
})
