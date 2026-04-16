import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { H3Event } from 'h3'
import type { M2MDatabase } from '~/types/database.types'

export async function requireAdminAccess(event: H3Event) {
  const user = await serverSupabaseUser(event)
  const userId = (user as any)?.id || (user as any)?.sub

  if (!user || !userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const client = serverSupabaseServiceRole<M2MDatabase>(event)
  const { data: admin, error } = await client
    .schema('m2m')
    .from('admins')
    .select('id')
    .eq('id', userId)
    .maybeSingle()

  if (error || !admin) {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }

  return { user, userId, client }
}
