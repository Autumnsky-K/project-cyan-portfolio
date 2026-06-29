import {
  corsHeaders,
  errorResponse,
  getKakaoConfig,
  jsonResponse,
  kakaoFetch,
  positiveInteger,
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

  try {
    const body = await readJson(request)
    const tid = stringValue(body.tid)
    const orderId = stringValue(body.orderId ?? body.partnerOrderId ?? body.partner_order_id)
    const cancelAmount = positiveInteger(body.cancelAmount ?? body.amount, 'cancelAmount')

    if (!tid) throw new Error('tid is required.')

    const { cid } = getKakaoConfig()
    const canceled = await kakaoFetch('cancel', {
      cid,
      tid,
      cancel_amount: cancelAmount,
      cancel_tax_free_amount: 0,
    }) as Record<string, unknown>
    const supabaseResult = await updateSupabasePaymentResult({
      orderId,
      orderStatus: 'CANCELED',
      paymentStatus: 'CANCELED',
      providerPaymentKey: tid,
      paymentMethod: 'KAKAO_PAY',
      provider: 'KAKAO',
    })

    return jsonResponse({
      ...canceled,
      orderId,
      paymentStatus: 'CANCELED',
      orderStatus: 'CANCELED',
      supabaseResult,
    })
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Failed to cancel KakaoPay payment.', 400)
  }
})
