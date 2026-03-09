import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import { sendSMS } from '~/server/utils/sms'
import { notifyRedemption } from '~/server/utils/discord'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const body = await readBody(event)
    const { venueId, matchId } = body

    if (!venueId) {
        throw createError({ statusCode: 400, message: 'Venue ID is required' })
    }

    const client = serverSupabaseServiceRole(event) as any

    // --- 3. SANITIZE AND PREPARE ID'S ---
    const targetUserId = user.id
    const targetVenueId = String(body.venueId).trim()
    const rawMatchId = body.matchId && String(body.matchId).trim() !== '' ? String(body.matchId).trim() : null

    // UUID Validation Regex
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

    if (!uuidRegex.test(targetVenueId)) {
        console.error(`[Redemption DEBUG] Invalid venueId: ${targetVenueId}`)
        throw createError({ statusCode: 400, message: 'Invalid venue identifier format' })
    }

    const targetMatchId = rawMatchId && uuidRegex.test(rawMatchId) ? rawMatchId : null

    console.log(`[Redemption DEBUG] Initializing claim process...`, { targetUserId, targetVenueId, targetMatchId })

    // Optional: Verify match ownership/eligibility (Guarded)
    if (targetMatchId) {
        try {
            const { data: match } = await client
                .schema('m2m')
                .from('matches')
                .select('status, user_1_id, user_2_id')
                .eq('id', targetMatchId)
                .single()

            if (match) {
                const isParticipant = String(match.user_1_id) === targetUserId || String(match.user_2_id) === targetUserId
                if (!isParticipant) {
                    console.warn(`[Redemption DEBUG] User ${targetUserId} is claiming for match ${targetMatchId} they are not part of.`)
                }
            }
        } catch (err) {
            console.warn(`[Redemption DEBUG] Match verification lookup failed (non-critical):`, err)
        }
    }


    // --- 4. VERIFY PREVIOUS CLAIM (Absolute Lock) ---
    // We check for any claim by this user for this venue
    const lookup = await client
        .schema('m2m')
        .from('venue_redemptions')
        .select('*')
        .eq('user_id', targetUserId)
        .eq('venue_id', targetVenueId)
        .order('redeemed_at', { ascending: false })
        .limit(1)

    if (lookup.error) {
        console.error('[Redemption DEBUG] Lookup Failure:', lookup.error)
        throw createError({
            statusCode: 500,
            message: `Database connection failed during verification check. [${lookup.error.code}: ${lookup.error.message}]`
        })
    }

    if (lookup.data && lookup.data.length > 0) {
        const existing = lookup.data[0]
        console.log(`[Redemption DEBUG] BLOCKING: Existing claim found (${existing.id})`)
        return {
            success: true,
            redemptionId: existing.id,
            redeemedAt: existing.redeemed_at,
            message: 'You have already claimed this discount'
        }
    }

    // --- 5. EXECUTE REDEMPTION ---
    console.log(`[Redemption DEBUG] No previous claim. Proceeding with insert...`)

    const insertion = await client
        .schema('m2m')
        .from('venue_redemptions')
        .insert({
            user_id: targetUserId,
            venue_id: targetVenueId,
            match_id: targetMatchId,
            status: 'pending'
        })
        .select()
        .single()

    if (insertion.error) {
        console.error('[Redemption DEBUG] Insert Failure:', insertion.error)

        // Handle race condition: check if someone JUST inserted it
        if (insertion.error.code === '23505') {
            const { data: retry } = await client.schema('m2m').from('venue_redemptions').select('*').eq('user_id', targetUserId).eq('venue_id', targetVenueId).single()
            if (retry) return { success: true, redemptionId: retry.id, redeemedAt: retry.redeemed_at, message: 'Existing claim found' }
        }

        throw createError({
            statusCode: 500,
            message: `Failed to record your claim. Please contact support. [${insertion.error.code}]`
        })
    }

    const redemption = insertion.data



    // --- SEND SMS NOTIFICATION ---
    try {
        console.log(`[Redemption SMS] Starting notification process for user:${user.id}, venue:${venueId}`)

        // 1. Fetch venue details
        const { data: venue } = await client
            .schema('m2m')
            .from('partner_venues')
            .select('name, location, discount_label')
            .eq('id', venueId)
            .single()

        // 2. Fetch user profile (Try m2m schema first, then public)
        let profileData: any = null

        // Try m2m
        const { data: m2mProfile } = await client
            .schema('m2m')
            .from('profiles')
            .select('phone, display_name')
            .eq('id', user.id)
            .single()

        if (m2mProfile) {
            profileData = m2mProfile
            console.log(`[Redemption SMS] Found profile in m2m schema`)
        } else {
            // Try public
            const { data: publicProfile } = await client
                .from('profiles')
                .select('phone, display_name')
                .eq('id', user.id)
                .single()

            if (publicProfile) {
                profileData = publicProfile
                console.log(`[Redemption SMS] Found profile in public schema`)
            }
        }

        // 3. Fallback to auth phone if profile is missing or phone is empty
        const targetPhone = profileData?.phone || user.phone || user.user_metadata?.phone || user.user_metadata?.full_number
        const targetName = profileData?.display_name || user.user_metadata?.display_name || 'there'

        if (venue && targetPhone) {
            const venueName = venue.name
            const location = venue.location
            const discount = venue.discount_label
            const redemptionId = (redemption as any).id.slice(0, 8).toUpperCase()

            const smsMessage = `Hi ${targetName}! Your M2Match rate for ${venueName} (${location}) has been claimed. \n\nOffer: ${discount}\nTicket ID: ${redemptionId}\n\nShow your match screen at the venue to redeem. Enjoy your date! 🥂`

            console.log(`[Redemption SMS] Sending to ${targetPhone}...`)
            const smsResult = await sendSMS(targetPhone, smsMessage, { priority: 'high' })
            console.log(`[Redemption SMS] SMS Response:`, JSON.stringify(smsResult))

            // --- SEND DISCORD NOTIFICATION ---
            await notifyRedemption({
                userName: targetName,
                venueName: venueName,
                discount: discount,
                location: location,
                redemptionId: redemptionId
            })
        } else {
            console.warn(`[Redemption Notification] Missing requirement: venue=${!!venue}, phone=${!!targetPhone}`)
        }
    } catch (notifErr: any) {
        console.error('[Redemption Notification] Error in notification flow:', notifErr.message || notifErr)
    }


    return {
        success: true,
        redemptionId: (redemption as any).id,
        redeemedAt: (redemption as any).redeemed_at,
        message: 'Redemption recorded successfully'
    }
})
