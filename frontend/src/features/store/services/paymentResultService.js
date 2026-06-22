import { loadOrders, saveOrder } from '../storage/orderStorage'
import {
  clearPendingPayment,
  loadPendingPayment,
} from '../storage/paymentStorage'
import { ORDER_STATUS, updateOrderStatus } from '../utils/storeUtils'

function findOrderByPendingPayment(pendingPayment) {
  if (!pendingPayment?.orderId) {
    return null
  }

  return loadOrders().find(
    (order) =>
      (order.orderId || order.orderNumber) === pendingPayment.orderId ||
      order.orderId === pendingPayment.localOrderId ||
      order.orderNumber === pendingPayment.orderNo,
  )
}

function updatePendingPaymentOrder(status) {
  const pendingPayment = loadPendingPayment()

  if (!pendingPayment) {
    return {
      order: null,
      pendingPayment: null,
    }
  }

  const order = findOrderByPendingPayment(pendingPayment)

  if (!order) {
    clearPendingPayment()
    return {
      order: null,
      pendingPayment,
    }
  }

  const nextOrder = updateOrderStatus(order, status)
  saveOrder(nextOrder)
  clearPendingPayment()

  return {
    order: nextOrder,
    pendingPayment,
  }
}

export function approveSuccess({ pgToken } = {}) {
  if (!pgToken) {
    return {
      order: null,
      pendingPayment: loadPendingPayment(),
      reason: 'MISSING_PG_TOKEN',
    }
  }

  const result = updatePendingPaymentOrder(ORDER_STATUS.PAID)

  if (!result.order) {
    return result
  }

  const approvedOrder = {
    ...result.order,
    paymentApproval: {
      pgToken: pgToken || '',
      tid: result.pendingPayment?.tid || '',
      approvedAt: new Date().toISOString(),
    },
  }

  saveOrder(approvedOrder)

  return {
    ...result,
    order: approvedOrder,
  }
}

export function approveLocalPreview({ pgToken } = {}) {
  return Promise.resolve(approveSuccess({ pgToken }))
}

export function markFailed() {
  return updatePendingPaymentOrder(ORDER_STATUS.PAYMENT_FAILED)
}

export function markCanceled() {
  return updatePendingPaymentOrder(ORDER_STATUS.CANCELED)
}

export function markExpired() {
  return updatePendingPaymentOrder(ORDER_STATUS.EXPIRED)
}
