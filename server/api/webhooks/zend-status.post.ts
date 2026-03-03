/**
 * Zend Webhook - Message Status Updates
 * POST /api/webhooks/zend-status
 */

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    // Zend webhook payload typically contains id, status, to, and potentially error details
    const { id, status, to, error, message, body: messageBody } = body

    console.log(`[Zend Webhook] Received status update for message ${id}: ${status}`)

    // Only notify Discord on failures
    if (status === 'failed') {
        await notifyDiscord({
            title: '❌ SMS Delivery Failed',
            description: `Zend reported a delivery failure for message to ${to}`,
            color: DiscordColors.error,
            fields: [
                { name: 'Message ID', value: id, inline: true },
                { name: 'Recipient', value: to, inline: true },
                { name: 'Error', value: error || message || 'Unknown error', inline: false },
                { name: 'Content Preview', value: messageBody ? (messageBody.substring(0, 100) + '...') : 'N/A', inline: false }
            ],
            footer: 'Zend SMS Monitoring'
        })
    }

    return { success: true }
})
