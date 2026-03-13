import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { event_id, code, participants } = body

    if (!event_id || !code || !Array.isArray(participants)) {
        throw createError({ statusCode: 400, message: 'Invalid request data' })
    }

    const client = serverSupabaseServiceRole(event) as any

    // 1. Verify Organizer
    const { data: franchiseEvent, error: authError } = await client
        .schema('m2m')
        .from('franchise_events')
        .select('id, status')
        .eq('id', event_id)
        .eq('access_code', String(code).trim())
        .single()

    if (authError || !franchiseEvent) {
        throw createError({ statusCode: 403, message: 'Unauthorized' })
    }

    const results = {
        total: participants.length,
        created: 0,
        linked: 0,
        errors: [] as string[]
    }

    // 2. Process each participant
    for (const p of participants) {
        try {
            const rawPhone = String(p.phone || p.phoneNumber || '').replace(/\D/g, '')
            if (!rawPhone) {
                results.errors.push('Skipping record: No phone number provided')
                continue
            }

            const phone = rawPhone.length === 10 ? `+233${rawPhone.slice(1)}` : (rawPhone.startsWith('233') ? `+${rawPhone}` : `+${rawPhone}`)
            const name = p.name || p.displayName || 'Guest'
            const gender = String(p.gender || 'female').toLowerCase() === 'male' ? 'male' : 'female'
            const guestId = String(p.guestId || p.seatNumber || '').trim()

            console.log(`[Franchise Import] Processing ${name} (${phone}) - GuestID: ${guestId}`)

            // A. Find or Create Profile (Shadow Onboarding)
            // 1. Check if profile exists by phone in m2m schema
            let { data: profile } = await client
                .schema('m2m')
                .from('profiles')
                .select('id')
                .eq('phone', phone)
                .maybeSingle()

            if (!profile) {
                console.log(`[Franchise Import] No profile found for ${phone}. Checking Auth...`)

                // 2. We need a valid auth ID to satisfy the FK. 
                // We try creating/getting the auth user via Admin API.
                let authId: string | null = null

                const { data: userList } = await client.auth.admin.listUsers()
                const existingAuthUser = userList?.users.find((u: any) => u.phone === phone || u.phone === phone.replace('+', ''))

                if (existingAuthUser) {
                    authId = existingAuthUser.id
                    console.log(`[Franchise Import] Existing Auth User found: ${authId}`)
                } else {
                    console.log(`[Franchise Import] Creating new Auth User for ${phone}`)
                    const { data: newAuth, error: authError } = await client.auth.admin.createUser({
                        phone: phone,
                        phone_confirm: true, // DO NOT SEND SMS
                        user_metadata: { display_name: name, gender: gender }
                    })

                    if (authError) {
                        console.error(`[Franchise Import] Auth Creation Error for ${phone}:`, authError)
                        results.errors.push(`Auth Error for ${phone}: ${authError.message}`)
                        continue
                    }
                    authId = newAuth.user.id
                    results.created++
                }

                // 3. Now create the m2m profile using that Auth ID
                if (authId) {
                    const { data: newProfile, error: createError } = await client
                        .schema('m2m')
                        .from('profiles')
                        .upsert({
                            id: authId, // satisfying the profiles_id_fkey
                            phone: phone,
                            display_name: name,
                            gender: gender,
                            is_verified: false
                        })
                        .select('id')
                        .maybeSingle()

                    if (createError) {
                        console.error(`[Franchise Import] Profile insertion failed for ${phone}:`, createError)
                        results.errors.push(`Profile Error for ${phone}: ${createError.message}`)
                        continue
                    }
                    profile = newProfile
                }
            } else {
                console.log(`[Franchise Import] Existing profile found for ${phone}: ${profile.id}`)
                results.linked++
            }

            if (!profile?.id) {
                results.errors.push(`Could not resolve identity for ${phone}`)
                continue
            }


            // B. Link to Franchise Event
            console.log(`[Franchise Import] Linking profile ${profile.id} to event ${event_id}`)
            const { error: linkError } = await client
                .schema('m2m')
                .from('franchise_participants')
                .upsert({
                    event_id: event_id,
                    user_id: profile.id,
                    participant_number: guestId,
                    gender: gender
                })

            if (linkError) {
                console.error(`[Franchise Import] Link Error for ${phone}:`, linkError)
                results.errors.push(`Failed to link ${phone}: ${linkError.message}`)
            } else {
                console.log(`[Franchise Import] Successfully linked ${phone}`)
            }

        } catch (err: any) {
            console.error(`[Franchise Import] Unexpected error:`, err)
            results.errors.push(`General error processing record: ${err.message}`)
        }
    }

    if (results.errors.length > 0) {
        console.warn(`[Franchise Import] Completed with ${results.errors.length} errors`)
    }

    return {
        success: results.errors.length < participants.length,
        stats: results,
        errorCount: results.errors.length
    }

})
