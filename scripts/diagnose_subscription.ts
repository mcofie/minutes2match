
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

// Load env from root
const envPath = path.resolve(process.cwd(), '.env')
if (fs.existsSync(envPath)) {
    console.log('Loading .env from', envPath)
    dotenv.config({ path: envPath })
} else {
    console.log('.env not found at', envPath)
}

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    db: { schema: 'm2m' }
})

async function diagnose() {
    console.log('--- DIAGNOSTICS START ---')

    // 1. Check Payments
    console.log('\nChecking recent subscription payments...')
    const { data: payments, error: payError } = await supabase
        .from('payments')
        .select('*')
        .eq('purpose', 'subscription')
        .order('created_at', { ascending: false })
        .limit(5)

    if (payError) {
        console.error('Error fetching payments:', payError)
    } else {
        console.log(`Found ${payments.length} subscription payments.`)
        payments.forEach(p => {
            console.log(`- ID: ${p.id}, Status: ${p.status}, User: ${p.user_id}, Date: ${p.created_at}`)
        })
    }

    // 2. Check Subscriptions
    console.log('\nChecking subscriptions table...')
    const { data: subs, error: subError } = await supabase
        .from('subscriptions')
        .select('*')

    if (subError) {
        console.error('Error fetching subscriptions:', subError)
    } else {
        console.log(`Found ${subs.length} subscriptions.`)
        subs.forEach(s => {
            console.log(`- ID: ${s.id}, User: ${s.user_id}, Status: ${s.status}, End: ${s.end_date}`)
        })
    }

    // 3. Dry Run Insert (Rollback logic or just check if possible)
    console.log('\nTesting Subscription Insert Permission...')
    // We won't actually insert to avoid garbage, but we can try to select with a weird query
    // Actually, let's try to find a user from the payments and see if they have a sub

    if (payments && payments.length > 0) {
        const lastPayer = payments[0].user_id
        console.log(`\nVerifying subscription for user ${lastPayer}...`)

        const { data: userSub, error: userSubError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', lastPayer)

        if (userSubError) console.error('Error:', userSubError)
        else console.log('User Subscription:', userSub)
    }

    console.log('\n--- DIAGNOSTICS END ---')
}

diagnose().catch(console.error)
