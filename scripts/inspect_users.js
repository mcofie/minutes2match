import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Load .env
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env') })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    db: { schema: 'm2m' }
})

async function inspectUsers() {
    console.log('Inspecting users...')

    // 1. Get Admins
    const { data: admins, error: adminsError } = await supabase
        .from('admins')
        .select('id')

    if (adminsError) {
        console.error('Error fetching admins:', adminsError)
        return
    }
    const adminIds = new Set(admins.map(a => a.id))
    console.log(`Found ${adminIds.size} admins.`)

    // 2. Get Profiles
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, created_at, updated_at, display_name, phone')

    if (profilesError) {
        console.error('Error fetching profiles:', profilesError)
        return
    }
    console.log(`Found ${profiles.length} profiles.`)


    // 3. Get Vibe Answers Counts
    const { data: vibeAnswers, error: vibeError } = await supabase
        .from('vibe_answers')
        .select('user_id')

    const vibeCounts = {}
    if (vibeAnswers) {
        vibeAnswers.forEach(v => {
            vibeCounts[v.user_id] = (vibeCounts[v.user_id] || 0) + 1
        })
    }

    // 4. Analyze
    let seededCount = 0
    let updatedCount = 0
    let adminCount = 0

    const usersToDelete = []

    // Get Profiles with all fields
    const { data: fullProfiles, error: fullProfilesError } = await supabase
        .from('profiles')
        .select('*')

    if (fullProfilesError) { console.error(fullProfilesError); return; }

    for (const profile of fullProfiles) {
        const isAdmin = adminIds.has(profile.id)
        const createdAt = new Date(profile.created_at).getTime()
        const updatedAt = new Date(profile.updated_at).getTime()
        const isUpdatedTimestamp = updatedAt > createdAt
        const vibeCount = vibeCounts[profile.id] || 0
        const hasPhoto = profile.photo_url && !profile.photo_url.includes('placeholder')

        // Heuristic for "Updated":
        // User interacted with the app.
        // Maybe they have vibe answers? (If seeded users don't)
        // Maybe they have a real photo?
        // Maybe is_verified is true?

        // Let's print details to decide.

        let status = 'Seeded'
        if (isAdmin) {
            status = 'Admin'
            adminCount++
        } else if (isUpdatedTimestamp || hasPhoto || vibeCount > 0) {
            // Assume verified or photo or timestamp change means updated
            status = 'Updated'
            updatedCount++
        } else {
            status = 'Seeded'
            seededCount++
            usersToDelete.push(profile.id)
        }

        console.log(`[${status}] ${profile.display_name} (${profile.phone}) UpdatedAtDiff: ${updatedAt - createdAt}ms | Vibes: ${vibeCount} | Photo: ${hasPhoto} | Verified: ${profile.is_verified}`)
    }


    console.log('\nSummary:')
    console.log(`Admins: ${adminCount}`)
    console.log(`Updated Profiles (timestamp/photo/vibes): ${updatedCount}`)
    console.log(`Seeded (To Delete): ${seededCount}`)

    if (seededCount > 0) {
        console.log(`\nTo delete ${seededCount} users, run the cleanup script.`)
    }
}

inspectUsers()
