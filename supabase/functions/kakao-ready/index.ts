import {
  corsHeaders,
  errorResponse,
  getKakaoConfig,
  jsonResponse,
  kakaoFetch,
  numberValue,
  positiveInteger,
  readJson,
  redirectUrl,
  stringValue,
  updateSupabasePaymentAttemptReady,
} from '../_shared/kakao-pay.ts'

type OrderItem = {
  goodsId?: unknown
  productId?: unknown
  name?: unknown
  price?: unknown
  quantity?: unknown
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return errorResponse('Method not allowed.', 405, 'METHOD_NOT_ALLOWED')
  }

  try {
    const body = await readJson(request)
    const items = Array.isArray(body.items) ? body.items as OrderItem[] : []
    const totalAmount = positiveInteger(body.totalAmount ?? body.totalPrice, 'totalAmount')
    const memberId = stringValue(body.memberId ?? (body.customer as { memberId?: unknown } | undefined)?.memberId)
    const partnerOrderId = stringValue(body.partnerOrderId ?? body.orderNumber ?? body.orderId)
    const partnerUserId = stringValue(body.partnerUserId) || (memberId ? `member-${memberId}` : '')
    const firstItem = items[0] ?? {}
    const itemName = stringValue(body.itemName) ||
      (items.length > 1
        ? `${stringValue(firstItem.name) || 'Goods'} plus ${items.length - 1} more`
        : stringValue(firstItem.name) || 'Goods')
    const quantity = items.reduce((total, item) => total + positiveInteger(item.quantity, 'item.quantity'), 0)

    if (!partnerOrderId) {
      throw new Error('partnerOrderId is required.')
    }
    if (!partnerUserId) {
      throw new Error('partnerUserId is required.')
    }
    if (items.length === 0 || quantity <= 0) {
      throw new Error('items are required.')
    }

    const pricedItems = items.filter((item) => item.price != null)
    if (pricedItems.length === items.length) {
      const itemTotal = items.reduce((total, item) => {
        return total + Math.floor(numberValue(item.price)) * positiveInteger(item.quantity, 'item.quantity')
      }, 0)

      if (itemTotal !== totalAmount) {
        throw new Error(`totalAmount mismatch. expected ${itemTotal}, received ${totalAmount}.`)
      }
    }

    const { cid } = getKakaoConfig()
    const readyPayload = {
      cid,
      partner_order_id: partnerOrderId,
      partner_user_id: partnerUserId,
      item_name: itemName,
      quantity,
      total_amount: totalAmount,
      tax_free_amount: 0,
      approval_url: redirectUrl(request, '/payment/success', { orderId: partnerOrderId }),
      cancel_url: redirectUrl(request, '/payment/cancel', { orderId: partnerOrderId }),
      fail_url: redirectUrl(request, '/payment/fail', { orderId: partnerOrderId }),
    }
    const ready = await kakaoFetch('ready', readyPayload) as Record<string, unknown>
    const tid = stringValue(ready.tid)
    const supabaseAttemptResult = tid
      ? await updateSupabasePaymentAttemptReady({
        orderId: partnerOrderId,
        partnerUserId,
        tid,
      })
      : {
        status: 'NOT_SYNCED',
        message: 'KakaoPay ready response did not include tid.',
        failures: [],
        rows: [],
      }

    return jsonResponse({
      ...ready,
      orderId: partnerOrderId,
      orderNo: partnerOrderId,
      partnerOrderId,
      partner_order_id: partnerOrderId,
      partnerUserId,
      partner_user_id: partnerUserId,
      totalAmount,
      readyRequestUrl: new URL(request.url).toString(),
      paymentMode: 'supabase-edge',
      usedFallback: false,
      supabaseAttemptResult,
    })
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Failed to prepare KakaoPay payment.', 400)
  }
})
