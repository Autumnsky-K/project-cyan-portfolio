import { apiFetch, parseApiResponse } from '../shared/api/springApiClient'

export async function fetchOrders(options = {}) {
  const response = await apiFetch('/orders', options)
  return parseApiResponse(response, 'Failed to load orders.')
}

export async function createOrderWithItems(order, options = {}) {
  const response = await apiFetch('/orders', {
    method: 'POST',
    body: JSON.stringify(order),
    ...options,
  })

  return parseApiResponse(response, 'Failed to create order.')
}

export async function updateOrderPaymentStatus(orderId, payload, options = {}) {
  const response = await apiFetch(`/orders/${orderId}/payment`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    ...options,
  })

  return parseApiResponse(response, 'Failed to update payment status.')
}
