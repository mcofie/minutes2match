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

async function cleanupUsers() {
    console.log('Starting Cleanup Process...')

    // 1. Get Admins
    const { data: admins, error: adminsError } = await supabase
        .from('admins')
        .select('id')

    if (adminsError) {
        console.error('Error fetching admins:', adminsError)
        return
    }
    const adminIds = new Set(admins.map(a => a.id))

    // 2. Get Vibe Answers Counts
    const { data: vibeAnswers, error: vibeError } = await supabase
        .from('vibe_answers')
        .select('user_id')

    const vibeCounts = {}
    if (vibeAnswers) {
        vibeAnswers.forEach(v => {
            vibeCounts[v.user_id] = (vibeCounts[v.user_id] || 0) + 1
        })
    }

    // 3. Get Profiles
    const { data: fullProfiles, error: fullProfilesError } = await supabase
        .from('profiles')
        .select('*')

    if (fullProfilesError) {
        console.error(fullProfilesError)
        return
    }

    const usersToDelete = []

    for (const profile of fullProfiles) {
        const isAdmin = adminIds.has(profile.id)
        const createdAt = new Date(profile.created_at).getTime()
        const updatedAt = new Date(profile.updated_at).getTime()
        const isUpdatedTimestamp = updatedAt > createdAt
        const vibeCount = vibeCounts[profile.id] || 0
        const hasPhoto = profile.photo_url && !profile.photo_url.includes('placeholder')

        // Heuristic:
        // Keep if Admin OR Updated (Timestamp changed OR Photo added OR Vibe answers > 0)
        // Delete otherwise

        if (isAdmin) {
            // Keep
        } else if (isUpdatedTimestamp || hasPhoto || vibeCount > 0) {
            // Keep
        } else {
            usersToDelete.push(profile)
        }
    }

    console.log(`Identified ${usersToDelete.length} users to delete.`)

    if (usersToDelete.length === 0) {
        console.log('No users to delete.')
        return
    }

    console.log('Deleting users...')
    let deletedCount = 0
    let errorCount = 0

    for (const user of usersToDelete) {
        try {
            // Delete from Auth (cascades to Profile in DB)
            const { error } = await supabase.auth.admin.deleteUser(user.id)

            if (error) {
                console.error(`Failed to delete ${user.display_name} (${user.id}):`, error.message)
                errorCount++
            } else {
                console.log(`Deleted ${user.display_name} (${user.id})`)
                deletedCount++
            }
        } catch (e) {
            console.error(`Exception deleting ${user.display_name}:`, e)
            errorCount++
        }
    }

    console.log('\nCleanup Complete.')
    console.log(`Successfully deleted: ${deletedCount}`)
    console.log(`Errors: ${errorCount}`)
}

cleanupUsers()
