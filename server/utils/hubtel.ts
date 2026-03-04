/**
 * Hubtel SMS API Utility
 * Helper for sending SMS via Hubtel (https://developers.hubtel.com/docs/personal/api_documentation/messaging/sms)
 */

const HUBTEL_BASE_URL = 'https://smsc.hubtel.com/v1/messages/send'
const SENDER_ID = 'Mins2Match'

export interface HubtelSMSResponse {
    MessageId: string
    Rate: number
    NetworkId: string
    Status: string | number
}

/**
 * Send a single SMS via Hubtel
 */
export async function sendHubtelSMS(
    clientId: string,
    clientSecret: string,
    to: string,
    body: string
): Promise<HubtelSMSResponse> {
    // Basic Auth
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

    // Attempt sending message
    const cleanBody = stripEmojis(body)
    const response = await $fetch<any>(HUBTEL_BASE_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
        },
        body: {
            From: SENDER_ID,
            To: to,
            Content: cleanBody
        }
    })

    // Check Status. 0 means Success for Hubtel V1 payload.
    // The actual json response keys are camelCase!
    if (response.status !== 0 && response.status !== 100 && response.status !== '0' && response.status !== '100') {
        throw new Error(`Hubtel API returned error status: ${response.status} - ${response.statusDescription}`)
    }

    return {
        MessageId: response.messageId,
        Rate: response.rate,
        NetworkId: response.networkId,
        Status: response.status
    }
}
