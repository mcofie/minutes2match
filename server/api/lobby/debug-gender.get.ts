import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole(event)
  const user = await serverSupabaseUser(event)
  
  if (!user) return { error: 'No user' }

  const { data: profile } = await client
    .schema('m2m')
    .from('profiles')
    .select('id, display_name, gender, interested_in')
    .eq('id', user.id)
    .single()

  const { data: others } = await client
    .schema('m2m')
    .from('profiles')
    .select('id, display_name, gender, interested_in')
    .limit(5)

  return {
    me: profile,
    others: others
  }
})
