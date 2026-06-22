import {
  SPRING_API_BASE_URL,
  apiFetch,
  isSpringApiUrl,
  parseApiResponse,
} from '../shared/api/springApiClient'

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
const DEV_MEMBER_ID = import.meta.env.VITE_DEV_MEMBER_ID ?? '1'
const KAKAO_READY_URL =
  import.meta.env.VITE_KAKAO_READY_URL ??
  (SUPABASE_FUNCTIONS_URL
    ? `${SUPABASE_FUNCTIONS_URL}/kakao-ready`
    : `${SPRING_API_BASE_URL}/payments/kakao/ready`)
const KAKAO_APPROVE_URL =
  import.meta.env.VITE_KAKAO_APPROVE_URL ??
  (SUPABASE_FUNCTIONS_URL
    ? `${SUPABASE_FUNCTIONS_URL}/kakao-approve`
    : `${SPRING_API_BASE_URL}/payments/kakao/approve`)
const KAKAO_CANCEL_URL =
  import.meta.env.VITE_KAKAO_CANCEL_URL ?? `${SPRING_API_BASE_URL}/payments/kakao/cancel`
const KAKAO_FAIL_URL =
  import.meta.env.VITE_KAKAO_FAIL_URL ?? `${SPRING_API_BASE_URL}/payments/kakao/fail`

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
  return {
    ...order,
    memberId: order.memberId ?? order.customer?.memberId ?? DEV_MEMBER_ID,
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

async function paymentFetch(url, payload, options = {}) {
  const { headers, ...fetchOptions } = options

  if (isSpringApiUrl(url)) {
    return apiFetch(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers,
      ...fetchOptions,
    })
  }

  return fetch(url, {
    method: 'POST',
    headers: buildFunctionHeaders(headers),
    body: JSON.stringify(payload),
    ...fetchOptions,
  })
}

export async function requestKakaoPayReady(order, options = {}) {
  const response = await paymentFetch(KAKAO_READY_URL, buildKakaoReadyPayload(order), options)

  return parseApiResponse(response, 'Failed to prepare KakaoPay payment.')
}

export async function approveKakaoPay({ orderId, tid, pgToken }, options = {}) {
  const response = await paymentFetch(KAKAO_APPROVE_URL, { orderId, tid, pgToken }, options)

  return parseApiResponse(response, 'Failed to approve KakaoPay payment.')
}

export async function cancelKakaoPay(orderId, options = {}) {
  const response = await paymentFetch(KAKAO_CANCEL_URL, { orderId }, options)

  return parseApiResponse(response, 'Failed to cancel KakaoPay payment.')
}

export async function failKakaoPay(orderId, reason, options = {}) {
  const response = await paymentFetch(KAKAO_FAIL_URL, { orderId, reason }, options)

  return parseApiResponse(response, 'Failed to record failed KakaoPay payment.')
}
