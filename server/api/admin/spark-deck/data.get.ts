import { requireAdminAccess } from '~/server/utils/admin'

export default defineEventHandler(async (event) => {
  const { client } = await requireAdminAccess(event)

  const [{ data: polls, error: pollsError }, { data: payments, error: paymentsError }] = await Promise.all([
    client
      .schema('m2m')
      .from('poll_questions')
      .select('*')
      .order('created_at', { ascending: false }),
    client
      .schema('m2m')
      .from('payments')
      .select('id, user_id, amount, currency, status, provider_ref, created_at, metadata')
      .eq('purpose', 'spark_deck')
      .order('created_at', { ascending: false })
      .limit(25)
  ])

  if (pollsError) {
    throw createError({ statusCode: 500, statusMessage: pollsError.message })
  }

  if (paymentsError) {
    throw createError({ statusCode: 500, statusMessage: paymentsError.message })
  }

  const orders = (payments || []).map((payment: any) => {
    const shipping = payment.metadata?.shippingDetails || {}
    return {
      id: payment.id,
      user_id: payment.user_id,
      amount: payment.amount,
      currency: payment.currency || 'GHS',
      status: payment.status,
      provider_ref: payment.provider_ref,
      created_at: payment.created_at,
      shipping_name: shipping.name || null,
      shipping_phone: shipping.phone || null,
      shipping_address: shipping.address || null
    }
  })

  const orderSummary = orders.reduce((acc: any, order: any) => {
    acc.total += 1
    acc.revenue += Number(order.amount || 0)
    acc.pending += order.status === 'pending' ? 1 : 0
    acc.success += order.status === 'success' ? 1 : 0
    acc.failed += order.status === 'failed' ? 1 : 0
    return acc
  }, { total: 0, revenue: 0, pending: 0, success: 0, failed: 0 })

  return {
    success: true,
    polls: polls || [],
    orders,
    orderSummary
  }
})
