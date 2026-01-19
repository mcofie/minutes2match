/**
 * Paystack Webhook Test Endpoint
 * GET /api/paystack/webhook-test
 * 
 * Simple endpoint to verify the webhook URL is reachable
 */

export default defineEventHandler(async (event) => {
    return {
        status: 'ok',
        message: 'Paystack webhook endpoint is reachable',
        timestamp: new Date().toISOString(),
        method: event.method,
        path: '/api/paystack/webhook'
    }
})
