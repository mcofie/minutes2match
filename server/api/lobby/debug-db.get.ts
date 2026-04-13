import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole(event)
  const { data, error } = await client
    .schema('m2m')
    .from('profiles')
    .select('id, display_name, gender, interested_in, is_active, birth_date, location')
    .eq('is_active', true)
    
  return { 
     total_active_profiles: data?.length || 0,
     profiles: data,
     error 
  }
})
