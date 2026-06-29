import {
  corsHeaders,
  errorResponse,
  getKakaoConfig,
  jsonResponse,
  kakaoFetch,
  readJson,
  stringValue,
  updateSupabasePaymentResult,
} from '../_shared/kakao-pay.ts'

function logApprove(step: string, details: Record<string, unknown> = {}) {
  console.info(JSON.stringify({
    event: 'kakao-approve',
    step,
    ...details,
  }))
}

function logApproveError(step: string, error: unknown, details: Record<string, unknown> = {}) {
  console.error(JSON.stringify({
    event: 'kakao-approve',
    step,
    errorName: error instanceof Error ? error.name : typeof error,
    errorMessage: error instanceof Error ? error.message : String(error),
    errorStack: error instanceof Error ? error.stack : undefined,
    ...details,
  }))
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return errorResponse('Method not allowed.', 405, 'METHOD_NOT_ALLOWED')
  }

  try {
    logApprove('start', {
      method: request.method,
      url: request.url,
    })
    const body = await readJson(request)
    const tid = stringValue(body.tid)
    const pgToken = stringValue(body.pgToken ?? body.pg_token)
    const partnerOrderId = stringValue(body.partnerOrderId ?? body.partner_order_id ?? body.orderId)
    const partnerUserId = stringValue(body.partnerUserId ?? body.partner_user_id)
    logApprove('payload', {
      orderId: partnerOrderId,
      hasTid: Boolean(tid),
      hasPgToken: Boolean(pgToken),
      hasPartnerUserId: Boolean(partnerUserId),
      tidPrefix: tid ? tid.slice(0, 8) : '',
    })

    if (!tid) throw new Error('tid is required.')
    if (!pgToken) throw new Error('pgToken is required.')
    if (!partnerOrderId) throw new Error('partnerOrderId is required.')
    if (!partnerUserId) throw new Error('partnerUserId is required.')

    const { cid } = getKakaoConfig()
    logApprove('kakao-request', {
      orderId: partnerOrderId,
      cid,
      tidPrefix: tid.slice(0, 8),
    })
    const approved = await kakaoFetch('approve', {
      cid,
      tid,
      partner_order_id: partnerOrderId,
      partner_user_id: partnerUserId,
      pg_token: pgToken,
    }) as Record<string, unknown>
    logApprove('kakao-response', {
      orderId: partnerOrderId,
      approvedKeys: approved && typeof approved === 'object' ? Object.keys(approved) : [],
      aid: stringValue(approved.aid),
      kakaoStatus: approved.kakaoStatus,
      kakaoResponseEmpty: approved.kakaoResponseEmpty === true,
    })
    logApprove('supabase-update-request', {
      orderId: partnerOrderId,
    })
    const supabaseResult = await updateSupabasePaymentResult({
      orderId: partnerOrderId,
      orderStatus: 'PAID',
      paymentStatus: 'APPROVED',
      providerPaymentKey: tid,
      paymentMethod: 'KAKAO_PAY',
      provider: 'KAKAO',
    })
    logApprove('supabase-update-response', {
      orderId: partnerOrderId,
      status: supabaseResult.status,
      orderRows: supabaseResult.orderRows.length,
      paymentRows: supabaseResult.paymentRows.length,
      failures: supabaseResult.failures,
    })

    logApprove('done', {
      orderId: partnerOrderId,
      paymentStatus: 'APPROVED',
      orderStatus: 'PAID',
    })
    return jsonResponse({
      ...approved,
      orderId: partnerOrderId,
      orderNo: partnerOrderId,
      partnerOrderId,
      partnerUserId,
      paymentStatus: 'APPROVED',
      orderStatus: 'PAID',
      supabaseResult,
    })
  } catch (error) {
    logApproveError('error', error)
    return errorResponse(error instanceof Error ? error.message : 'Failed to approve KakaoPay payment.', 400)
  }
})
