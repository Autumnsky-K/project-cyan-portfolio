import { apiFetch, parseApiResponse } from '../shared/api/springApiClient'

const PAYMENT_PREPARE_TIMEOUT_MS = Number(
  import.meta.env.VITE_PAYMENT_PREPARE_TIMEOUT_MS ?? 15000,
)

function isAbortError(error) {
  return error instanceof DOMException && error.name === 'AbortError'
}

export async function prepareCheckout(payload) {
  const controller = new AbortController()
  const timeoutId = globalThis.setTimeout(() => {
    controller.abort()
  }, PAYMENT_PREPARE_TIMEOUT_MS)

  let response

  try {
    response = await apiFetch('/checkout/prepare', {
      method: 'POST',
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
  } catch (error) {
    if (isAbortError(error)) {
      throw new Error('Toss Payments 결제 준비 시간이 초과되어 결과를 받지 못했습니다.', {
        cause: error,
      })
    }

    throw error
  } finally {
    globalThis.clearTimeout(timeoutId)
  }

  return parseApiResponse(response, '결제를 준비하지 못했습니다.')
}

export async function approveCheckoutPayment(payload) {
  const response = await apiFetch('/checkout/payments/approve', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return parseApiResponse(response, '결제를 승인하지 못했습니다.')
}

export async function recoverKakaoPaymentAttempt(orderId) {
  const query = new URLSearchParams()
  if (orderId) {
    query.set('orderId', orderId)
  }

  const response = await apiFetch(`/checkout/payments/kakao/attempt?${query.toString()}`)

  return parseApiResponse(response, 'KakaoPay 결제 시도를 복구하지 못했습니다.')
}

export async function cancelCheckoutPayment(payload) {
  const response = await apiFetch('/checkout/payments/cancel', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return parseApiResponse(response, '결제를 취소하지 못했습니다.')
}

export async function failCheckoutPayment(payload) {
  const response = await apiFetch('/checkout/payments/fail', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return parseApiResponse(response, '결제 실패 상태를 기록하지 못했습니다.')
}
