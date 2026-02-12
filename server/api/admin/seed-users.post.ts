
import { createClient } from '@supabase/supabase-js'

const SEED_DATA = `6/4/2025 3:28:59	Kwame Kwakye	24	Male	0558408624	kwameoduro163@gmail.com	I love to cook a variety. I love food. 	Honesty and openness 	Electrical Engineer. 	Rice Ball and groundnut soup, boudin noire. 	I’ll say I’m very spicy and served hot. 😂	Home-cooked meal together	Something serious
6/11/2025 11:10:28	Gareth Casey Cofie	28	Male	0245143807	garethcofie@gmail.com	I’ve travelled through all 10 regions of Ghana before they became 16 and I plan to do it all over again, this time with a playlist and a poetry journal in hand	I’m definitely drawn to a beautiful smile. It’s the first thing I notice. But beyond that, I’m looking for someone who feels like home. Someone I don’t have to pretend to be okay around. People say communication is key and while that’s true, I think comprehension is just as important. I value emotional intelligence. Someone who is grounded but still open minded. Someone who already knows her values and morals. And someone who knows how to have fun, laugh, and enjoy the moment.	Freelance creative and project manager 	I don't have one (maybe banku and okro stew))	A Salad. Depending on the occasion, I mix the right ingredients to suit the moment. Sometimes vibrant and bold, other times simple and soothing, but always real and fresh	Home-cooked meal together	Open to see where it goes
6/17/2025 15:31:18	Elsa	28	Female	+233 57 513 8168	elsa.yb@gmail.com	I'm a planner - I make plans and lists for almost everything, including my outfits. I can tell you what I plan to wear in two weeks on a Tuesday.	Loves God and is a follower of Christ, doesn't take themselves too seriously, great conversationalist and someone who's a lifelong learner	Communications in the Tech and Education industry	Beans :)	Seemingly tough exterior, but it doesn't take a lot to break the illusion of a barrier. I'm just a softy and sweetie on the inside :)	Cooking class or food tasting	Something serious`

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const supabaseAdmin = createClient(
        config.supabaseUrl || process.env.SUPABASE_URL || '',
        config.supabaseServiceKey || '',
        { auth: { persistSession: false } }
    )

    console.log('Seeding BATCH 4 (Foodies)...')

    const { data: { users: allUsers }, error: listError } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 })
    if (listError) console.error('Error listing users:', listError)

    const emailToId = new Map(allUsers?.map(u => [u.email?.toLowerCase(), u.id]) || [])

    const lines = SEED_DATA.split('\n')
    const rows = []
    let currentRow = ''

    for (const line of lines) {
        if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(line)) {
            if (currentRow) rows.push(currentRow)
            currentRow = line
        } else {
            currentRow = currentRow + '\n' + line
        }
    }
    if (currentRow) rows.push(currentRow)

    const results = []

    for (const row of rows) {
        const cells = row.split('\t')
        if (cells.length < 5) continue

        // Extract fields (Updated for BATCH 4 - Food structure)
        // 0: Timestamp
        // 1: Name
        // 2: Age
        // 3: Gender
        // 4: Phone
        // 5: Email
        // 6: Fun Fact
        // 7: Partner Pref
        // 8: Work
        // 9: Cant Live Without (Food)
        // 10: Describe as Dish
        // 11: Ideal Food Date
        // 12: Looking For

        const timestamp = cells[0].trim()
        const name = cells[1].trim()
        const age = parseInt(cells[2].trim()) || 25
        const gender = cells[3].trim().toLowerCase()
        const rawPhone = cells[4].trim()
        const email = cells[5].trim()

        const funFact = cells[6] ? cells[6].trim() : ''
        const partnerPref = cells[7] ? cells[7].trim() : ''
        const work = cells[8] ? cells[8].trim() : ''
        const foodLove = cells[9] ? cells[9].trim() : ''
        const dishPersona = cells[10] ? cells[10].trim() : ''
        const foodDate = cells[11] ? cells[11].trim() : ''
        const lookingFor = cells[12] ? cells[12].trim() : ''

        const validGender = gender.includes('female') ? 'female' : 'male'
        const normalizedPhone = normalizePhone(rawPhone)

        const cleanText = (text: string) => text ? text.replace(/^"|"$/g, '').trim() : ''

        // Build Bio with Food fields
        const bioParts = [
            cleanText(funFact),
            cleanText(partnerPref) ? `Looking for: ${cleanText(partnerPref)}` : '',
            cleanText(foodLove) ? `Can't live without: ${cleanText(foodLove)}` : '',
            cleanText(dishPersona) ? `If I were a dish: ${cleanText(dishPersona)}` : '',
            cleanText(foodDate) ? `Ideal Food Date: ${cleanText(foodDate)}` : ''
        ]

        const aboutMe = bioParts.filter(Boolean).join('\n\n')
        const occupation = cleanText(work)

        let intent = 'serious'
        if (lookingFor.toLowerCase().includes('open') || lookingFor.toLowerCase().includes('good vibes')) intent = 'casual'
        if (lookingFor.toLowerCase().includes('serious')) intent = 'serious'

        const yearMatch = timestamp.match(/\d{4}/)
        const recordYear = yearMatch ? parseInt(yearMatch[0]) : 2025
        const birthYear = recordYear - age
        const birthDate = `${birthYear}-01-01`

        try {
            let userId = emailToId.get(email.toLowerCase())

            if (!userId) {
                // Create Auth User
                const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                    email,
                    password: 'Password123!',
                    email_confirm: true,
                    user_metadata: { phone: normalizedPhone }
                })

                if (authError) {
                    console.error(`Failed to create user ${email}:`, authError.message)
                    results.push({ email, status: 'error', error: authError.message })
                    continue
                }
                userId = authData.user.id
            }

            // Upsert Profile (Updates existing ones like Kwame and Elsa)
            const { error: profileError } = await supabaseAdmin
                .schema('m2m')
                .from('profiles')
                .upsert({
                    id: userId,
                    phone: normalizedPhone,
                    display_name: name,
                    gender: validGender as 'male' | 'female',
                    birth_date: birthDate,
                    about_me: aboutMe,
                    occupation: occupation,
                    interested_in: validGender === 'male' ? 'female' : 'male',
                    is_verified: true,
                    intent: intent as any
                } as any)

            if (profileError) {
                console.error(`Failed to create/update profile for ${email}:`, profileError.message)
                results.push({ email, status: 'profile_error', error: profileError.message })
            } else {
                // Don't insert vibe_answers - we want seeded users to complete the REAL vibe check
                // This ensures they get redirected to /vibe-check?returnUser=true on login
                // where they can provide accurate answers for better matching
                results.push({ email, status: 'processed', id: userId })
            }

        } catch (err: any) {
            console.error(`Exception for ${email}:`, err)
            results.push({ email, status: 'exception', error: err.message })
        }
    }

    return {
        success: true,
        summary: {
            total: rows.length,
            processed: results.length,
            successful: results.filter(r => r.status === 'processed').length
        },
        details: results
    }
})

function normalizePhone(p: string) {
    let cleaned = p.replace(/\D/g, '') // remove non-digits
    if (!cleaned) return ''

    if (cleaned.startsWith('233')) {
        return '+' + cleaned
    }
    if (cleaned.startsWith('0')) {
        return '+233' + cleaned.substring(1)
    }
    if (cleaned.length === 9) {
        return '+233' + cleaned
    }
    if (cleaned.length === 12 && cleaned.startsWith('233')) {
        return '+' + cleaned
    }

    return '+' + cleaned
}
