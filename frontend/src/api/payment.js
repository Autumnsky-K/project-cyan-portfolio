const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'
const SUPABASE_PUBLIC_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
const SUPABASE_FUNCTIONS_URL =
  import.meta.env.VITE_SUPABASE_FUNCTIONS_URL ??
  (import.meta.env.VITE_SUPABASE_URL
    ? import.meta.env.VITE_SUPABASE_URL.replace(
        '.supabase.co',
        '.functions.supabase.co',
      )
    : '')
const KAKAO_READY_URL =
  import.meta.env.VITE_KAKAO_READY_URL ??
  (SUPABASE_FUNCTIONS_URL
    ? `${SUPABASE_FUNCTIONS_URL}/kakao-ready`
    : `${API_BASE_URL}/payments/kakao/ready`)
const KAKAO_APPROVE_URL =
  import.meta.env.VITE_KAKAO_APPROVE_URL ??
  (SUPABASE_FUNCTIONS_URL
    ? `${SUPABASE_FUNCTIONS_URL}/kakao-approve`
    : `${API_BASE_URL}/payments/kakao/approve`)
const KAKAO_CANCEL_URL =
  import.meta.env.VITE_KAKAO_CANCEL_URL ??
  (SUPABASE_FUNCTIONS_URL
    ? `${SUPABASE_FUNCTIONS_URL}/kakao-cancel`
    : `${API_BASE_URL}/payments/kakao/cancel`)
const KAKAO_FAIL_URL =
  import.meta.env.VITE_KAKAO_FAIL_URL ??
  (SUPABASE_FUNCTIONS_URL
    ? `${SUPABASE_FUNCTIONS_URL}/kakao-fail`
    : `${API_BASE_URL}/payments/kakao/fail`)
const PAYMENT_PREPARE_TIMEOUT_MS = Number(
  import.meta.env.VITE_PAYMENT_PREPARE_TIMEOUT_MS ?? 15000,
)

function isAbortError(error) {
  return error instanceof DOMException && error.name === 'AbortError'
}

async function parseResponse(response, fallbackMessage) {
  const text = await response.text().catch((error) => {
    throw new Error(
      `${fallbackMessage} Response body could not be read. status=${response.status} ${response.statusText}. ${error.message}`,
      { cause: error },
    )
  })
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch (error) {
      if (!response.ok) {
        throw new Error(
          `${fallbackMessage} status=${response.status} ${response.statusText}. Non-JSON response: ${text.slice(0, 300)}`,
          { cause: error },
        )
      }

      throw new Error(
        `${fallbackMessage} Invalid JSON response: ${text.slice(0, 300)}`,
        { cause: error },
      )
    }
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        `${fallbackMessage} status=${response.status} ${response.statusText}`,
    )
  }

  return data
}

function buildFunctionHeaders(headers = {}) {
  const supabaseHeaders = SUPABASE_PUBLIC_KEY
    ? {
        apikey: SUPABASE_PUBLIC_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLIC_KEY}`,
      }
    : {}

  return {
    ...supabaseHeaders,
    'Content-Type': 'application/json',
    ...headers,
  }
}

export function getKakaoPayReadyDebugInfo() {
  return {
    readyRequestUrl: KAKAO_READY_URL,
    paymentMode: KAKAO_READY_URL.includes('functions.supabase.co')
      ? 'supabase-edge'
      : 'backend',
    usedFallback: false,
  }
}

function buildKakaoReadyPayload(order) {
  const memberId = order.memberId ?? order.customer?.memberId
  if (!Number.isInteger(Number(memberId)) || Number(memberId) <= 0) {
    throw new Error('The logged-in member profile is unavailable.')
  }
  const partnerUserId =
    typeof order.partnerUserId === 'string' && order.partnerUserId.trim()
      ? order.partnerUserId.trim()
      : `member-${Number(memberId)}`

  return {
    ...order,
    memberId: Number(memberId),
    partnerUserId,
    items: (order.items ?? []).map((item) => ({
      ...item,
      goodsId: item.goodsId ?? item.productId,
      productId: item.productId ?? item.goodsId,
      quantity: item.quantity,
      name: item.name,
    })),
    receiverName: order.receiverName ?? order.customer?.name,
    receiverPhone: order.receiverPhone ?? order.customer?.phone,
    postalCode: order.postalCode ?? order.customer?.postalCode ?? null,
    address: order.address ?? order.customer?.address,
    addressDetail: order.addressDetail ?? order.customer?.addressDetail ?? '',
    deliveryRequest:
      order.deliveryRequest ?? order.customer?.deliveryRequest ?? '',
    totalAmount: order.totalAmount ?? order.totalPrice,
  }
}

export async function requestKakaoPayReady(order, options = {}) {
  const controller = new AbortController()
  const timeoutId = globalThis.setTimeout(() => {
    controller.abort()
  }, PAYMENT_PREPARE_TIMEOUT_MS)

  let response

  try {
    response = await fetch(KAKAO_READY_URL, {
      method: 'POST',
      headers: buildFunctionHeaders(options.headers),
      body: JSON.stringify(buildKakaoReadyPayload(order)),
      ...options,
      signal: options.signal ?? controller.signal,
    })
  } catch (error) {
    if (isAbortError(error)) {
      throw new Error('KakaoPay preparation timed out. No payment result was received.', {
        cause: error,
      })
    }

    throw error
  } finally {
    globalThis.clearTimeout(timeoutId)
  }

  return parseResponse(response, 'Failed to prepare KakaoPay payment.')
}

export async function approveKakaoPay({ orderId, tid, pgToken, partnerOrderId, partnerUserId }, options = {}) {
  const payload = { orderId, tid, pgToken, partnerOrderId, partnerUserId }
  let response

  try {
    response = await fetch(KAKAO_APPROVE_URL, {
      method: 'POST',
      headers: buildFunctionHeaders(options.headers),
      body: JSON.stringify(payload),
      ...options,
    })
  } catch (error) {
    throw new Error(
      `Failed to call KakaoPay approve endpoint. url=${KAKAO_APPROVE_URL}, orderId=${orderId}, hasTid=${Boolean(tid)}, hasPgToken=${Boolean(pgToken)}, hasPartnerUserId=${Boolean(partnerUserId)}. ${
        error instanceof Error ? error.message : String(error)
      }`,
      { cause: error },
    )
  }

  return parseResponse(response, 'Failed to approve KakaoPay payment.')
}

export async function cancelKakaoPay(orderId, payment = {}, options = {}) {
  const response = await fetch(KAKAO_CANCEL_URL, {
    method: 'POST',
    headers: buildFunctionHeaders(options.headers),
    body: JSON.stringify({
      orderId,
      tid: payment.tid,
      amount: payment.amount,
      cancelAmount: payment.cancelAmount,
      partnerOrderId: payment.partnerOrderId,
    }),
    ...options,
  })

  return parseResponse(response, 'Failed to cancel KakaoPay payment.')
}

export async function failKakaoPay(orderId, reason, options = {}) {
  const response = await fetch(KAKAO_FAIL_URL, {
    method: 'POST',
    headers: buildFunctionHeaders(options.headers),
    body: JSON.stringify({ orderId, reason }),
    ...options,
  })

  return parseResponse(response, 'Failed to record failed KakaoPay payment.')
}
