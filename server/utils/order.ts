import { notifyDiscord, DiscordColors } from '~/server/utils/discord'
import { notifyUser } from '~/server/utils/notify'

/**
 * Handle a successful Spark Deck purchase
 * Includes Discord notification for fulfillment and SMS receipt to buyer
 */
export async function handleSparkDeckOrder(supabase: any, metadata: any, config: any) {
    console.log('[Order] Handling Spark Deck for user:', metadata.userId || 'Guest')
    
    try {
        const shipping = metadata.shippingDetails || {}
        
        // Calculate 3 working days delivery date
        const purchaseDate = new Date()
        const deliveryDate = calculateDeliveryDate(purchaseDate, 3)
        const dateString = deliveryDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
        
        // 1. Send Discord notification for the team to process
        await notifyDiscord({
            title: '🎁 New Spark Deck Order!',
            description: `A new purchase has been completed at ${config.public.baseUrl}/spark-deck`,
            color: DiscordColors.payment,
            fields: [
                { name: 'Recipient', value: shipping.name || 'Unknown', inline: true },
                { name: 'Phone', value: shipping.phone || 'N/A', inline: true },
                { name: 'Delivery Address', value: shipping.address || 'N/A', inline: false },
                { name: 'User ID', value: metadata.userId || 'Guest', inline: false },
                { name: 'Est. Delivery', value: dateString, inline: true }
            ]
        })

        // 2. SMS confirmation to the buyer (receipt and delivery date)
        const message = `🛍️ Receipt: Your M2M Spark Deck (GHS 250) order is confirmed! \n\n📍 Delivery: ${shipping.address?.substring(0, 30)}...\n🚚 Est. Arrival: ${dateString}\n\nThank you for choosing Minutes 2 Match! ✨`
        
        // Attempt to send to the phone number entered in the form first, then fallback to userId's profile
        const targetPhone = shipping.phone
        
        try {
            if (targetPhone && config.zendApiKey) {
                // If we have a direct phone from shipping details, use it (handles guests)
                const { sendZendSMS } = await import('~/server/utils/zend')
                await sendZendSMS(config.zendApiKey, targetPhone, message, { priority: 'high' })
                console.log(`[Order] SMS sent directly via Zend to shipping phone: ${targetPhone}`)
            } else if (metadata.userId) {
                // Fallback to notifyUser if no specific phone but we have a userId
                await notifyUser(metadata.userId, message, { type: 'generic', smsPriority: 'high' })
                console.log(`[Order] SMS sent via notifyUser for userId: ${metadata.userId}`)
            }
        } catch (smsError) {
            console.error('[Order] Failed to send SMS confirmation:', smsError)
        }
        
    } catch (error) {
        console.error('[Order] Error in handleSparkDeckOrder:', error)
    }
}

/**
 * Calculate working days (skips Sat/Sun)
 */
export function calculateDeliveryDate(startDate: Date, workingDays: number): Date {
    const result = new Date(startDate)
    let addedDays = 0
    while (addedDays < workingDays) {
        result.setDate(result.getDate() + 1)
        if (result.getDay() !== 0 && result.getDay() !== 6) {
            addedDays++
        }
    }
    return result
}
