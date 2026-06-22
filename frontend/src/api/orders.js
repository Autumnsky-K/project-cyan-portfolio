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
  return parseResponse(response, 'Failed to load orders.')
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

  return parseResponse(response, 'Failed to create order.')
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

  return parseResponse(response, 'Failed to update payment status.')
}
