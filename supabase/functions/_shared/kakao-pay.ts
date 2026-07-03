export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

type JsonResponseInit = {
  status?: number
}

export function jsonResponse(body: unknown, init: JsonResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
}

export function errorResponse(message: string, status = 400, code = 'KAKAO_PAY_ERROR'): Response {
  return jsonResponse({ error: code, message, status }, { status })
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = await request.json()
    return body && typeof body === 'object' && !Array.isArray(body)
      ? body as Record<string, unknown>
      : {}
  } catch {
    return {}
  }
}

export function stringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

export function numberValue(value: unknown): number {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

export function positiveInteger(value: unknown, fieldName: string): number {
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
      throw new Error(
        `KAKAO_PAY_SECRET_KEY contains an invalid HTTP header character at index ${index}. Re-save the raw KakaoPay dev secret key only, without labels, spaces, or line breaks.`,
      )
    }
  }

  return secretKey
}

export function getKakaoConfig() {
  const secretKey = normalizeKakaoSecretKey(Deno.env.get('KAKAO_PAY_SECRET_KEY') ?? '')
  const cid = Deno.env.get('KAKAO_PAY_CID') ?? 'TC0ONETIME'
  const apiBaseUrl = Deno.env.get('KAKAO_PAY_API_BASE_URL') ?? 'https://open-api.kakaopay.com/online/v1/payment'

  return {
    apiBaseUrl: apiBaseUrl.replace(/\/+$/, ''),
    cid,
    secretKey,
  }
}

export async function kakaoFetch(path: string, payload: Record<string, unknown>) {
  const { apiBaseUrl, secretKey } = getKakaoConfig()
  const response = await fetch(`${apiBaseUrl}/${path.replace(/^\/+/, '')}`, {
    method: 'POST',
    headers: {
      Authorization: `SECRET_KEY ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  let text = ''
  try {
    text = await response.text()
  } catch (error) {
    throw new Error(
      `KakaoPay ${path} response body could not be read. status=${response.status}, contentType=${response.headers.get('content-type') ?? 'unknown'}, contentLength=${response.headers.get('content-length') ?? 'none'}. ${
        error instanceof Error ? error.message : String(error)
      }`,
    )
  }
  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = {
        rawResponse: text,
      }
    }
  }

  if (!response.ok) {
    const message =
      data && typeof data === 'object' && 'msg' in data
        ? String((data as { msg?: unknown }).msg)
        : data && typeof data === 'object' && 'rawResponse' in data
          ? `KakaoPay ${path} request failed: ${String((data as { rawResponse?: unknown }).rawResponse)}`
          : `KakaoPay ${path} request failed with status ${response.status}.`
    throw new Error(message)
  }

  if (!data || typeof data !== 'object') {
    return {
      kakaoStatus: response.status,
      kakaoResponseEmpty: true,
    }
  }

  return data
}

type PaymentResultUpdate = {
  orderId: string
  orderStatus: string
  paymentStatus: string
  providerPaymentKey?: string
  paymentMethod?: string
  provider?: string
}

type SupabaseUpdateCandidate = {
  table: string
  matchColumns: string[]
  payload: Record<string, unknown>
}

function getSupabaseRestConfig() {
  const projectUrl = Deno.env.get('SUPABASE_URL') ?? Deno.env.get('SUPABASE_PROJECT_URL') ?? ''
  const serviceRoleKey =
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ??
    Deno.env.get('SERVICE_ROLE_KEY') ??
    ''

  if (!projectUrl) {
    throw new Error('SUPABASE_URL is not configured.')
  }
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured.')
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

async function patchSupabaseRows(
  table: string,
  matchColumn: string,
  matchValue: string,
  payload: Record<string, unknown>,
): Promise<Record<string, unknown>[]> {
  const { restUrl, serviceRoleKey } = getSupabaseRestConfig()
  const url = `${restUrl}/${table}?${matchColumn}=eq.${encodeURIComponent(matchValue)}`
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(payload),
  })
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

async function postSupabaseRpc(
  functionName: string,
  payload: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const { restUrl, serviceRoleKey } = getSupabaseRestConfig()
  const response = await fetch(`${restUrl}/rpc/${functionName}`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      data && typeof data === 'object' && ('message' in data || 'code' in data)
        ? `${String((data as { code?: unknown }).code ?? 'SUPABASE_RPC_FAILED')}: ${String((data as { message?: unknown }).message ?? 'Supabase RPC failed.')}`
        : 'Supabase RPC failed.'
    throw new Error(message)
  }

  return data && typeof data === 'object' && !Array.isArray(data)
    ? data as Record<string, unknown>
    : {}
}

async function updateFirstMatchingCandidate(
  candidate: SupabaseUpdateCandidate,
  orderId: string,
): Promise<Record<string, unknown>[]> {
  let lastError: unknown = null

  for (const matchColumn of candidate.matchColumns) {
    try {
      const rows = await patchSupabaseRows(candidate.table, matchColumn, orderId, candidate.payload)
      if (rows.length > 0) {
        return rows
      }
    } catch (error) {
      lastError = error
      if (!isMissingColumnError(error)) {
        throw error
      }
    }
  }

  if (lastError && !isMissingColumnError(lastError)) {
    throw lastError
  }

  return []
}

export async function updateSupabasePaymentResult(result: PaymentResultUpdate) {
  if (result.orderStatus === 'PAID' && result.paymentStatus === 'APPROVED') {
    const rpcResult = await postSupabaseRpc('approve_checkout_payment', {
      p_order_key: result.orderId,
      p_payment_status: result.paymentStatus,
      p_order_status: result.orderStatus,
      p_provider_payment_key: result.providerPaymentKey ?? '',
      p_payment_method: result.paymentMethod ?? '',
      p_provider: result.provider ?? '',
    })
    const orderRows = numberValue(rpcResult.orderRows) > 0 ? [rpcResult] : []
    const paymentRows = numberValue(rpcResult.paymentRows) > 0 ? [rpcResult] : []

    return {
      status: stringValue(rpcResult.status) || (orderRows.length > 0 || paymentRows.length > 0 ? 'SYNCED' : 'NOT_SYNCED'),
      message: stringValue(rpcResult.message) || 'Supabase payment result was updated.',
      failures: [],
      orderRows,
      paymentRows,
      stockResult: rpcResult,
    }
  }

  const failures: string[] = []
  const orderRows = await updateFirstMatchingCandidate(
    {
      table: 'orders',
      matchColumns: ['order_no', 'order_number', 'partner_order_id'],
      payload: {
        order_status: result.orderStatus,
      },
    },
    result.orderId,
  ).catch((error) => {
    failures.push(error instanceof Error ? error.message : String(error))
    return []
  })
  let paymentRows = await updateFirstMatchingCandidate(
    {
      table: 'payment',
      matchColumns: ['provider_order_id', 'order_no', 'partner_order_id'],
      payload: {
        payment_status: result.paymentStatus,
        provider_payment_key: result.providerPaymentKey,
        payment_method: result.paymentMethod,
        provider: result.provider,
      },
    },
    result.orderId,
  ).catch((error) => {
    failures.push(error instanceof Error ? error.message : String(error))
    return []
  })

  if (paymentRows.length === 0) {
    paymentRows = await updateFirstMatchingCandidate(
      {
        table: 'payment',
        matchColumns: ['provider_order_id', 'order_no', 'partner_order_id'],
        payload: {
          payment_status: result.paymentStatus,
        },
      },
      result.orderId,
    ).catch((error) => {
      failures.push(error instanceof Error ? error.message : String(error))
      return []
    })
  }

  return {
    status: orderRows.length > 0 || paymentRows.length > 0 ? 'SYNCED' : 'NOT_SYNCED',
    message:
      orderRows.length > 0 || paymentRows.length > 0
        ? 'Supabase payment result was updated.'
        : `No Supabase order or payment row matched KakaoPay order ${result.orderId}.`,
    failures,
    orderRows,
    paymentRows,
  }
}

export async function updateSupabasePaymentAttemptReady({
  orderId,
  partnerUserId,
  tid,
}: {
  orderId: string
  partnerUserId: string
  tid: string
}) {
  const failures: string[] = []
  const rows = await updateFirstMatchingCandidate(
    {
      table: 'payment_attempt',
      matchColumns: ['provider_order_id', 'partner_order_id'],
      payload: {
        tid,
        partner_order_id: orderId,
        partner_user_id: partnerUserId,
        attempt_status: 'IN_PROGRESS',
        payment_method: 'KAKAO_PAY',
        provider: 'KAKAO',
      },
    },
    orderId,
  ).catch((error) => {
    failures.push(error instanceof Error ? error.message : String(error))
    return []
  })

  return {
    status: rows.length > 0 ? 'SYNCED' : 'NOT_SYNCED',
    message:
      rows.length > 0
        ? 'Supabase KakaoPay attempt was updated.'
        : `No Supabase payment_attempt row matched KakaoPay order ${orderId}.`,
    failures,
    rows,
  }
}

export function getRequestOrigin(request: Request): string {
  const origin = request.headers.get('origin') ?? ''
  if (origin) return origin.replace(/\/+$/, '')

  const siteUrl = Deno.env.get('SITE_URL') ?? Deno.env.get('APP_ORIGIN') ?? ''
  return siteUrl.replace(/\/+$/, '')
}

export function redirectUrl(request: Request, path: string, params: Record<string, string>): string {
  const origin = getRequestOrigin(request)
  if (!origin) {
    throw new Error('Request origin is unavailable. Set SITE_URL for deployed functions.')
  }

  const url = new URL(path, `${origin}/`)
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))
  return url.toString()
}
