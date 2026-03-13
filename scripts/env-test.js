import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    { db: { schema: 'm2m' } }
)

async function runSQL() {
    // Supabase JS client cannot run raw SQL unfortunately.
    // I will use an RPC if it exists, or try to run DDL via psql by getting the URL from .env if I can.

    // Actually! The user has DATABASE_URL in the .env if DOTENV works!
    // Wait, let's see .env content.
    console.log('Using SUPABASE_URL:', process.env.SUPABASE_URL)
}

runSQL()
