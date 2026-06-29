import {
  corsHeaders,
  errorResponse,
  jsonResponse,
  readJson,
  stringValue,
  updateSupabasePaymentResult,
} from '../_shared/kakao-pay.ts'

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return errorResponse('Method not allowed.', 405, 'METHOD_NOT_ALLOWED')
  }

  const body = await readJson(request)
  const orderId = stringValue(body.orderId ?? body.partnerOrderId ?? body.partner_order_id)
  const reason = stringValue(body.reason) || 'Payment failed.'
  const tid = stringValue(body.tid)
  const supabaseResult = await updateSupabasePaymentResult({
    orderId,
    orderStatus: 'PENDING',
    paymentStatus: 'FAILED',
    providerPaymentKey: tid || undefined,
    paymentMethod: 'KAKAO_PAY',
    provider: 'KAKAO',
  })

  return jsonResponse({
    orderId,
    reason,
    paymentStatus: 'FAILED',
    orderStatus: 'PENDING',
    supabaseResult,
  })
})
