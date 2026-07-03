const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'

async function parseResponse(response, fallbackMessage) {
  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.message ?? fallbackMessage)
  }

  return response.json()
}

export async function fetchOrders(options = {}) {
  const response = await fetch(`${API_BASE_URL}/orders`, options)
  return parseResponse(response, '주문 내역을 불러오지 못했습니다.')
}

export async function createOrderWithItems(order, options = {}) {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    body: JSON.stringify(order),
    ...options,
  })

  return parseResponse(response, '주문을 생성하지 못했습니다.')
}

export async function updateOrderPaymentStatus(orderId, payload, options = {}) {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/payment`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    body: JSON.stringify(payload),
    ...options,
  })

  return parseResponse(response, '결제 상태를 변경하지 못했습니다.')
}
