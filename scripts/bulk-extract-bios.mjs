import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'

dotenv.config()

const config = {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseServiceKey: process.env.SUPABASE_SECRET_KEY,
    geminiApiKey: process.env.GEMINI_API_KEY
}

if (!config.supabaseUrl || !config.supabaseServiceKey || !config.geminiApiKey) {
    console.error('Missing config')
    process.exit(1)
}

const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey, {
    db: { schema: 'm2m' }
})

const genAI = new GoogleGenerativeAI(config.geminiApiKey)
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

async function extractPreferencesFromBio(bio) {
    if (!bio || bio.length < 10) return null

    const prompt = `
        You are an expert matchmaker for "Minutes 2 Match", a premium matchmaking service.
        Analyze the following user bio and extract structured preferences and self-traits.
        
        BIO: "${bio}"

        Respond ONLY in JSON format with this structure:
        {
            "seeking": {
                "attributes": ["attribute1", "attribute2"],
                "dealbreakers": ["db1", "db2"],
                "lifestyle": ["ls1", "ls2"]
            },
            "self": {
                "personality": ["p1", "p2"],
                "values": ["v1", "v2"],
                "lifestyle": ["ls3", "ls4"]
            }
        }
    `

    try {
        const result = await model.generateContent(prompt)
        const responseText = await result.response.text()
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0])
        }
        return null
    } catch (error) {
        console.error('AI Preference Extraction Error:', error)
        return null
    }
}

async function run() {
    console.log('--- Minutes 2 Match: Bulk Bio Extraction ---')
    
    // Fetch profiles with bio
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, display_name, about_me')
        .not('about_me', 'is', null)

    if (error) {
        console.error('Fetch error:', error)
        return
    }

    if (!profiles || profiles.length === 0) {
        console.log('No profiles with bios found.')
        return
    }

    console.log(`Found ${profiles.length} profiles to process.`)

    let successCount = 0;
    let failCount = 0;

    for (const profile of profiles) {
        process.stdout.write(`Processing: ${profile.display_name} (${profile.id})... `)
        
        try {
            const extracted = await extractPreferencesFromBio(profile.about_me)
            if (extracted) {
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ preferences_extracted: extracted })
                    .eq('id', profile.id)

                if (updateError) {
                    if (updateError.code === '42703') {
                        console.log('FAILED (Column "preferences_extracted" does not exist. Apply migrations first!)')
                        process.exit(1)
                    }
                    console.error('Update Error:', updateError)
                    failCount++
                } else {
                    console.log('DONE')
                    successCount++
                }
            } else {
                console.log('AI Failed to parse.')
                failCount++
            }
        } catch (e) {
            console.error('System Error:', e)
            failCount++
        }
    }

    console.log(`\n\n--- Bulk processing complete! ---`)
    console.log(`Successfully processed: ${successCount}`)
    console.log(`Failed to process: ${failCount}`)
}

run().catch(err => {
    console.error('Fatal execution error:', err)
    process.exit(1)
})
