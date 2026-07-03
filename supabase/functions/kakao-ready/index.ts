const DEPLOY_MARK = 'kakao-ready-minimal-2026-07-03-01'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

type OrderItem = {
  goodsId?: unknown
  productId?: unknown
  name?: unknown
  price?: unknown
  quantity?: unknown
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
}

function errorResponse(message: string, status = 400, details: Record<string, unknown> = {}): Response {
  return jsonResponse({
    error: 'KAKAO_PAY_ERROR',
    message,
    status,
    deployMark: DEPLOY_MARK,
    ...details,
  }, status)
}

async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = await request.json()
    return body && typeof body === 'object' && !Array.isArray(body)
      ? body as Record<string, unknown>
      : {}
  } catch {
    return {}
  }
}

function stringValue(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return ''
}

function numberValue(value: unknown): number {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function positiveInteger(value: unknown, fieldName: string): number {
  const number = Math.floor(numberValue(value))
  if (!Number.isInteger(number) || number <= 0) {
    throw new Error(`${fieldName} must be a positive integer.`)
  }

  return number
}

function normalizeKakaoSecretKey(value: string): string {
  const secretKey = value.trim().replace(/^SECRET_KEY\s+/i, '').trim()
  if (!secretKey) {
    throw new Error('KAKAO_PAY_SECRET_KEY is not configured.')
  }

  for (let index = 0; index < secretKey.length; index += 1) {
    const code = secretKey.charCodeAt(index)
    if (code < 0x21 || code > 0x7e) {
      throw new Error(`KAKAO_PAY_SECRET_KEY contains an invalid HTTP header character at index ${index}.`)
    }
  }

  return secretKey
}

function getKakaoConfig() {
  const secretKey = normalizeKakaoSecretKey(
    Deno.env.get('KAKAO_PAY_SECRET_KEY') ??
      Deno.env.get('KAKAO_PAY_SECRET_KEY_DEV') ??
      Deno.env.get('KAKAOPAY_SECRET_KEY_DEV') ??
      '',
  )
  const cid = Deno.env.get('KAKAO_PAY_CID') ?? 'TC0ONETIME'
  const apiBaseUrl =
    Deno.env.get('KAKAO_PAY_API_BASE_URL') ??
    'https://open-api.kakaopay.com/online/v1/payment'

  return {
    apiBaseUrl: apiBaseUrl.replace(/\/+$/, ''),
    cid,
    secretKey,
  }
}

function getRequestOrigin(request: Request): string {
  const origin = request.headers.get('origin') ?? ''
  if (origin) return origin.replace(/\/+$/, '')

  const siteUrl = Deno.env.get('SITE_URL') ?? Deno.env.get('APP_ORIGIN') ?? ''
  return siteUrl.replace(/\/+$/, '')
}

function redirectUrl(request: Request, path: string, params: Record<string, string>): string {
  const origin = getRequestOrigin(request)
  if (!origin) {
    throw new Error('Request origin is unavailable. Set SITE_URL for deployed functions.')
  }

  const url = new URL(path, `${origin}/`)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  return url.toString()
}

function getSupabaseRestConfig() {
  const projectUrl = Deno.env.get('SUPABASE_URL') ?? Deno.env.get('SUPABASE_PROJECT_URL') ?? ''
  const serviceRoleKey =
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ??
    Deno.env.get('SERVICE_ROLE_KEY') ??
    ''

  if (!projectUrl || !serviceRoleKey) {
    return null
  }

  return {
    restUrl: `${projectUrl.replace(/\/+$/, '')}/rest/v1`,
    serviceRoleKey,
  }
}

function isMissingColumnError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  return (
    message.includes('PGRST204') ||
    message.toLowerCase().includes('column') ||
    message.toLowerCase().includes('schema cache')
  )
}

async function patchPaymentAttempt(
  matchColumn: string,
  orderId: string,
  payload: Record<string, unknown>,
): Promise<Record<string, unknown>[]> {
  const config = getSupabaseRestConfig()
  if (!config) {
    throw new Error('Supabase service role configuration is unavailable.')
  }

  const response = await fetch(
    `${config.restUrl}/payment_attempt?${matchColumn}=eq.${encodeURIComponent(orderId)}`,
    {
      method: 'PATCH',
      headers: {
        apikey: config.serviceRoleKey,
        Authorization: `Bearer ${config.serviceRoleKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(payload),
    },
  )
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      data && typeof data === 'object' && ('message' in data || 'code' in data)
        ? `${String((data as { code?: unknown }).code ?? 'SUPABASE_UPDATE_FAILED')}: ${String((data as { message?: unknown }).message ?? 'Supabase update failed.')}`
        : 'Supabase update failed.'
    throw new Error(message)
  }

  return Array.isArray(data) ? data as Record<string, unknown>[] : []
}

async function updatePaymentAttemptReady(orderId: string, partnerUserId: string, tid: string) {
  const payload = {
    tid,
    partner_order_id: orderId,
    partner_user_id: partnerUserId,
    attempt_status: 'IN_PROGRESS',
    payment_method: 'KAKAO_PAY',
    provider: 'KAKAO',
  }
  const failures: string[] = []

  for (const matchColumn of ['provider_order_id', 'partner_order_id']) {
    try {
      const rows = await patchPaymentAttempt(matchColumn, orderId, payload)
      if (rows.length > 0) {
        return {
          status: 'SYNCED',
          message: 'Supabase KakaoPay attempt was updated.',
          failures,
          rows,
        }
      }
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error))
      if (!isMissingColumnError(error)) break
    }
  }

  return {
    status: 'NOT_SYNCED',
    message: `No Supabase payment_attempt row matched KakaoPay order ${orderId}.`,
    failures,
    rows: [],
  }
}

function logReady(step: string, details: Record<string, unknown> = {}) {
  console.info(JSON.stringify({
    event: 'kakao-ready',
    deployMark: DEPLOY_MARK,
    step,
    ...details,
  }))
}

async function callKakaoReady(payload: Record<string, unknown>) {
  const { apiBaseUrl, secretKey } = getKakaoConfig()
  const targetUrl = `${apiBaseUrl}/ready`

  logReady('kakao_fetch_start', {
    url: targetUrl,
    cid: payload.cid,
    partnerOrderId: payload.partner_order_id,
    partnerUserId: payload.partner_user_id,
    itemNameLength: stringValue(payload.item_name).length,
    quantity: payload.quantity,
    totalAmount: payload.total_amount,
  })

  const response = await fetch(targetUrl, {
    method: 'POST',
    headers: {
      Authorization: `SECRET_KEY ${secretKey}`,
      Accept: 'application/json',
      'Accept-Encoding': 'identity',
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(payload),
  })

  logReady('kakao_fetch_response_received', {
    status: response.status,
    contentType: response.headers.get('content-type') ?? 'unknown',
    contentLength: response.headers.get('content-length') ?? 'none',
  })

  let rawText = ''
  try {
    rawText = await response.text()
  } catch (error) {
    throw new Error(
      `KakaoPay ready response body could not be read. status=${response.status}, contentType=${response.headers.get('content-type') ?? 'unknown'}, contentLength=${response.headers.get('content-length') ?? 'none'}. ${
        error instanceof Error ? error.message : String(error)
      }`,
    )
  }

  logReady('kakao_response_text_success', {
    status: response.status,
    rawTextLength: rawText.length,
  })

  let data: unknown = null
  if (rawText) {
    try {
      data = JSON.parse(rawText)
    } catch {
      data = { rawResponse: rawText }
    }
  }

  if (!response.ok) {
    const message =
      data && typeof data === 'object' && ('error_message' in data || 'msg' in data)
        ? String((data as { error_message?: unknown; msg?: unknown }).error_message ?? (data as { msg?: unknown }).msg)
        : rawText || `KakaoPay ready request failed with status ${response.status}.`
    throw new Error(message)
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(`KakaoPay ready response was empty or invalid JSON. status=${response.status}.`)
  }

  return data as Record<string, unknown>
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return errorResponse('Method not allowed.', 405, { code: 'METHOD_NOT_ALLOWED' })
  }

  try {
    logReady('entry', { method: request.method, url: request.url })
    const body = await readJson(request)
    const items = Array.isArray(body.items) ? body.items as OrderItem[] : []
    const totalAmount = positiveInteger(body.totalAmount ?? body.totalPrice, 'totalAmount')
    const memberId = stringValue(body.memberId ?? (body.customer as { memberId?: unknown } | undefined)?.memberId)
    const partnerOrderId = stringValue(body.partnerOrderId ?? body.orderNumber ?? body.orderId)
    const partnerUserId = stringValue(body.partnerUserId) || (memberId ? `member-${memberId}` : '')
    const firstItem = items[0] ?? {}
    const quantity = positiveInteger(
      body.quantity ??
        body.totalQuantity ??
        items.reduce((total, item) => total + positiveInteger(item.quantity, 'item.quantity'), 0),
      'quantity',
    )
    const itemName = stringValue(body.itemName ?? body.orderName) ||
      (items.length > 1
        ? `${stringValue(firstItem.name) || 'Goods'} plus ${items.length - 1} more`
        : stringValue(firstItem.name) || 'Goods')

    if (!partnerOrderId) {
      throw new Error('partnerOrderId is required.')
    }
    if (!partnerUserId) {
      throw new Error('partnerUserId is required.')
    }
    if (items.length === 0 && !body.quantity && !body.totalQuantity) {
      throw new Error('items are required.')
    }

    const pricedItems = items.filter((item) => item.price != null)
    if (pricedItems.length > 0 && pricedItems.length === items.length) {
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

    const ready = await callKakaoReady(readyPayload)
    const tid = stringValue(ready.tid)
    const paymentPageUrl =
      stringValue(ready.next_redirect_pc_url) ||
      stringValue(ready.next_redirect_mobile_url) ||
      stringValue(ready.next_redirect_app_url)

    if (!tid || !paymentPageUrl) {
      throw new Error(
        `KakaoPay ready response did not include ${!tid ? 'tid' : 'payment page URL'}. responseKeys=${Object.keys(ready).sort().join(', ') || 'none'}.`,
      )
    }

    const supabaseAttemptResult = await updatePaymentAttemptReady(partnerOrderId, partnerUserId, tid)

    logReady('return_success', {
      orderId: partnerOrderId,
      hasTid: Boolean(tid),
      hasRedirectUrl: Boolean(paymentPageUrl),
      supabaseAttemptStatus: supabaseAttemptResult.status,
    })

    return jsonResponse({
      ...ready,
      redirectUrl: paymentPageUrl,
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
      deployMark: DEPLOY_MARK,
      supabaseAttemptResult,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to prepare KakaoPay payment.'
    logReady('error', { message })
    return errorResponse(message, 400)
  }
})
