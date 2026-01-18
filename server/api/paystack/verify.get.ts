/**
 * Paystack Payment Verification
 * GET /api/paystack/verify?reference=xxx
 * 
 * Verifies a payment status
 */

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const reference = query.reference as string

    if (!reference) {
        throw createError({
            statusCode: 400,
            message: 'Missing reference parameter'
        })
    }

    const config = useRuntimeConfig()

    try {
        const response = await $fetch<{
            status: boolean
            message: string
            data: {
                status: string
                reference: string
                amount: number
                currency: string
                metadata: any
            }
        }>(`https://api.paystack.co/transaction/verify/${reference}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${config.paystackSecretKey}`
            }
        })

        return {
            status: response.data.status,
            reference: response.data.reference,
            amount: response.data.amount / 100, // Convert back to GHS
            currency: response.data.currency,
            metadata: response.data.metadata
        }
    } catch (error: any) {
        console.error('Paystack Verify Error:', error)
        throw createError({
            statusCode: 500,
            message: 'Failed to verify payment'
        })
    }
})
