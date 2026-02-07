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

// Use service_role key - this bypasses RLS completely
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    db: { schema: 'm2m' },
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function fixSubscriptions() {
    console.log('=== SUBSCRIPTION FIX SCRIPT ===\n')

    // 1. Find all successful subscription payments
    console.log('Step 1: Finding successful subscription payments...')
    const { data: payments, error: payError } = await supabase
        .from('payments')
        .select('*')
        .eq('purpose', 'subscription')
        .eq('status', 'success')
        .order('created_at', { ascending: false })

    if (payError) {
        console.error('Error fetching payments:', payError)
        return
    }

    console.log(`Found ${payments?.length || 0} successful subscription payments.\n`)

    if (!payments || payments.length === 0) {
        console.log('No subscription payments to process.')
        return
    }

    // 2. For each payment, check if subscription exists
    for (const payment of payments) {
        console.log(`Processing payment: ${payment.id}`)
        console.log(`  User: ${payment.user_id}`)
        console.log(`  Date: ${payment.created_at}`)

        // Check for existing subscription
        const { data: existingSub, error: subError } = await supabase
            .from('subscriptions')
            .select('id, status, end_date')
            .eq('user_id', payment.user_id)
            .maybeSingle()

        if (subError) {
            console.error(`  Error checking subscription:`, subError.message)

            // If permission denied, we need to fix permissions first
            if (subError.code === '42501') {
                console.log('\n⚠️  Permission denied. Running permission fix...')

                // Try to fix permissions using raw SQL via RPC or direct query
                // Since we can't run DDL via supabase-js easily, we'll output the fix command
                console.log('\n❌ Cannot fix permissions via script. Please run this SQL in Supabase SQL Editor:\n')
                console.log(`GRANT ALL ON m2m.subscriptions TO service_role;`)
                console.log(`GRANT SELECT ON m2m.subscriptions TO authenticated;`)
                console.log('\nThen re-run this script.')
                return
            }
            continue
        }

        if (existingSub) {
            console.log(`  ✓ Subscription already exists: ${existingSub.id}`)
            console.log(`    Status: ${existingSub.status}, Expires: ${existingSub.end_date}`)
        } else {
            console.log(`  ✗ No subscription found. Creating...`)

            // Calculate subscription period (1 month from payment date)
            const startDate = new Date(payment.created_at)
            const endDate = new Date(startDate)
            endDate.setMonth(endDate.getMonth() + 1)

            const { data: newSub, error: insertError } = await supabase
                .from('subscriptions')
                .insert({
                    user_id: payment.user_id,
                    status: 'active',
                    start_date: startDate.toISOString(),
                    end_date: endDate.toISOString(),
                    auto_renew: false
                })
                .select()
                .single()

            if (insertError) {
                console.error(`  ❌ Failed to create subscription:`, insertError.message)
            } else {
                console.log(`  ✅ Subscription created!`)
                console.log(`    ID: ${newSub.id}`)
                console.log(`    Expires: ${newSub.end_date}`)
            }
        }
        console.log('')
    }

    // 3. Final verification
    console.log('\n=== FINAL VERIFICATION ===')
    const { data: allSubs, error: verifyError } = await supabase
        .from('subscriptions')
        .select('*')

    if (verifyError) {
        console.error('Error verifying subscriptions:', verifyError)
    } else {
        console.log(`Total subscriptions in database: ${allSubs?.length || 0}`)
        allSubs?.forEach(s => {
            const isActive = new Date(s.end_date) > new Date()
            console.log(`  - User: ${s.user_id}, Status: ${s.status}, Active: ${isActive}, Expires: ${s.end_date}`)
        })
    }

    console.log('\n=== SCRIPT COMPLETE ===')
}

fixSubscriptions().catch(console.error)
