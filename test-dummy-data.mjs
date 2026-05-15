import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL || 'http://127.0.0.1:54321', process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy')

async function run() {
  console.log("Supabase not set up locally, I'll just look at the code");
}
run();
