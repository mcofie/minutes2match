
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

// Load .env manually to be sure
const envConfig = dotenv.parse(fs.readFileSync('.env'))
for (const k in envConfig) {
    process.env[k] = envConfig[k]
}

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY // or SUPABASE_KEY / SUPABASE_SERVICE_ROLE_KEY check what is in env

// Try alternative names if not found
const url = supabaseUrl
const key = supabaseKey || process.env.SUPABASE_KEY || process.env.SUPABASE_zSERVICE_ROLE_KEY

console.log('URL:', url)
console.log('Key present:', !!key)

if (!url || !key) {
    console.error('Missing credentials')
    process.exit(1)
}

const supabase = createClient(url, key)

async function inspect() {
    console.log('--- Inspecting Matches ---')
    const { data, error } = await supabase
        .schema('m2m')
        .from('matches')
        .select(`
      *,
      user_1:profiles!matches_user_1_id_fkey(id),
      user_2:profiles!matches_user_2_id_fkey(id)
    `)
        .limit(1)

    if (error) {
        console.error('Error:', error)
    } else {
        console.log('Success! Data:', JSON.stringify(data, null, 2))
    }
}

inspect()
