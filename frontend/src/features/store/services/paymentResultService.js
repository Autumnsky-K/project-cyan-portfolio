import {
  approveCheckoutPayment,
  cancelCheckoutPayment,
  failCheckoutPayment,
  recoverKakaoPaymentAttempt,
} from '../../../api/checkout'
import {
  approveKakaoPay,
  cancelKakaoPay,
  failKakaoPay,
} from '../../../api/payment'
import {
  ORDER_CONTRACT_STATUS,
  PAYMENT_CONTRACT_STATUS,
  normalizeOrderStatus,
} from '../../../constants/status'
import { loadOrders, saveOrder } from '../storage/orderStorage'
import {
  clearPendingPayment,
  loadPendingPayment,
} from '../storage/paymentStorage'
import {
  ORDER_STATUS,
  PAYMENT_METHODS,
  updateOrderStatus,
} from '../utils/storeUtils'

const paymentResultRequests = new Map()

function once(key, factory) {
  const currentRequest = paymentResultRequests.get(key)

  if (currentRequest) {
    return currentRequest
  }

  const nextRequest = factory().finally(() => {
    paymentResultRequests.delete(key)
  })

  paymentResultRequests.set(key, nextRequest)
  return nextRequest
}

function numericValue(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function findOrderByPendingPayment(pendingPayment, fallbackOrderId) {
  const orderKey =
    pendingPayment?.localOrderId ||
    pendingPayment?.orderId ||
    pendingPayment?.orderNo ||
    pendingPayment?.partnerOrderId ||
    fallbackOrderId

  if (!orderKey) {
    return null
  }

  return loadOrders().find(
    (order) =>
      order.orderId === orderKey ||
      order.orderNumber === orderKey ||
      order.orderId === pendingPayment?.localOrderId ||
      order.orderNumber === pendingPayment?.orderNo ||
      order.partnerOrderId === orderKey ||
      order.partnerOrderId === fallbackOrderId ||
      order.partnerOrderId === pendingPayment?.partnerOrderId,
  ) || null
}

function updatePendingPaymentOrder(status, fallbackOrderId) {
  const pendingPayment = loadPendingPayment()

  if (!pendingPayment) {
    return {
      order: findOrderByPendingPayment(null, fallbackOrderId),
      pendingPayment: null,
    }
  }

  const order = findOrderByPendingPayment(pendingPayment, fallbackOrderId)

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

function checkoutResultPayload(pendingPayment, params = {}) {
  return {
    orderId: numericValue(pendingPayment?.orderId),
    orderNo: pendingPayment?.orderNo || params.orderId || null,
    paymentId: numericValue(pendingPayment?.paymentId),
    provider: pendingPayment?.paymentMethod || params.provider || null,
    providerPaymentKey:
      params.paymentKey ||
      params.pgToken ||
      pendingPayment?.providerPaymentKey ||
      pendingPayment?.tid ||
      null,
    paymentMethod: pendingPayment?.paymentMethod || params.provider || null,
    amount: numericValue(params.amount ?? pendingPayment?.amount),
    reason: params.reason || null,
  }
}

function canSyncCheckoutResult(pendingPayment) {
  return Boolean(
    pendingPayment?.paymentId ||
      (pendingPayment?.orderId && numericValue(pendingPayment.orderId) !== null),
  )
}

function isKakaoPayment(payment) {
  const method = String(payment?.paymentMethod || payment?.provider || '').toUpperCase()
  return method === PAYMENT_METHODS.KAKAO_PAY || method === 'KAKAO'
}

function mergeRecoveredAttempt(pendingPayment, attempt) {
  if (!attempt) {
    return pendingPayment
  }

  return {
    ...pendingPayment,
    paymentMethod: PAYMENT_METHODS.KAKAO_PAY,
    provider: attempt.provider || pendingPayment?.provider || 'KAKAO',
    orderId: attempt.orderId ?? pendingPayment?.orderId,
    orderNo: attempt.orderNo || pendingPayment?.orderNo,
    paymentId: attempt.paymentId ?? pendingPayment?.paymentId,
    amount: attempt.amount ?? pendingPayment?.amount,
    providerPaymentKey:
      attempt.providerPaymentKey || pendingPayment?.providerPaymentKey || attempt.tid,
    tid: attempt.tid || pendingPayment?.tid,
    partnerOrderId:
      attempt.partnerOrderId ||
      pendingPayment?.partnerOrderId ||
      attempt.orderNo ||
      String(attempt.orderId || ''),
    partnerUserId: attempt.partnerUserId || pendingPayment?.partnerUserId,
    paymentStatus: attempt.paymentStatus || pendingPayment?.paymentStatus,
    orderStatus: attempt.orderStatus || pendingPayment?.orderStatus,
    attemptStatus: attempt.attemptStatus || pendingPayment?.attemptStatus,
  }
}

async function recoverKakaoPaymentFromServer(targetOrderId, pendingPayment) {
  if (!targetOrderId) {
    return pendingPayment
  }

  if (pendingPayment?.tid && pendingPayment?.partnerOrderId && pendingPayment?.partnerUserId) {
    return pendingPayment
  }

  const attempt = await recoverKakaoPaymentAttempt(targetOrderId)
  return mergeRecoveredAttempt(pendingPayment, attempt)
}

function approvedData(data, localResult, fallback = {}) {
  return {
    ...fallback,
    ...data,
    paymentStatus: data?.paymentStatus || PAYMENT_CONTRACT_STATUS.APPROVED,
    orderStatus: data?.orderStatus || ORDER_CONTRACT_STATUS.PAID,
    order: data?.order || localResult.order || fallback.order,
    pendingPayment:
      data?.pendingPayment ||
      localResult.pendingPayment ||
      fallback.pendingPayment,
  }
}

function terminalData(data, localResult, fallback = {}) {
  return {
    ...fallback,
    ...data,
    order: data?.order || localResult.order || fallback.order,
    pendingPayment:
      data?.pendingPayment ||
      localResult.pendingPayment ||
      fallback.pendingPayment,
  }
}

export function approveSuccess({ pgToken, orderId } = {}) {
  if (!pgToken) {
    return {
      order: findOrderByPendingPayment(loadPendingPayment(), orderId),
      pendingPayment: loadPendingPayment(),
      reason: 'MISSING_APPROVAL_TOKEN',
    }
  }

  const result = updatePendingPaymentOrder(ORDER_STATUS.PAID, orderId)

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

export function approveLocalPreview({ pgToken, orderId } = {}) {
  return Promise.resolve(approveSuccess({ pgToken, orderId }))
}

export async function resolvePaymentApproval({
  amount,
  orderId,
  paymentKey,
  pgToken,
} = {}) {
  const pendingPayment = loadPendingPayment()
  const targetOrderId = orderId || pendingPayment?.orderId || pendingPayment?.orderNo
  const approvalToken = paymentKey || pgToken
  const previewOrder = findOrderByPendingPayment(pendingPayment, targetOrderId)
  const key = `approve:${targetOrderId || ''}:${pendingPayment?.tid || ''}:${approvalToken || ''}`

  if (normalizeOrderStatus(previewOrder?.status) === ORDER_CONTRACT_STATUS.PAID) {
    clearPendingPayment()
    return approvedData({}, { order: previewOrder, pendingPayment }, {
      orderId: targetOrderId,
      pgToken,
      paymentKey,
    })
  }

  return once(key, async () => {
    if (pgToken || isKakaoPayment(pendingPayment)) {
      const kakaoPayment = await recoverKakaoPaymentFromServer(targetOrderId, pendingPayment)

      if (!targetOrderId || !pgToken || !kakaoPayment?.tid) {
        throw new Error('Missing KakaoPay approval data.')
      }
      if (!kakaoPayment.partnerOrderId || !kakaoPayment.partnerUserId) {
        throw new Error('Missing KakaoPay merchant approval identifiers.')
      }

      const data = await approveKakaoPay({
        orderId: targetOrderId,
        tid: kakaoPayment.tid,
        pgToken,
        partnerOrderId: kakaoPayment.partnerOrderId,
        partnerUserId: kakaoPayment.partnerUserId,
      })
      const localResult = approveSuccess({ orderId: targetOrderId, pgToken })

      return approvedData(data, localResult, {
        order: previewOrder,
        orderId: targetOrderId,
        pendingPayment: kakaoPayment,
        pgToken,
      })
    }

    if (canSyncCheckoutResult(pendingPayment)) {
      const data = await approveCheckoutPayment(
        checkoutResultPayload(pendingPayment, {
          amount,
          orderId: targetOrderId,
          paymentKey: approvalToken,
        }),
      )
      const localResult = approveSuccess({
        orderId: targetOrderId,
        pgToken: approvalToken || 'approved',
      })

      return approvedData(data, localResult, {
        order: previewOrder,
        orderId: targetOrderId,
        pendingPayment,
        paymentKey,
      })
    }

    throw new Error('Missing persisted payment data. Payment result cannot be verified.')
  })
}

export async function resolvePaymentCancellation({ access, orderId } = {}) {
  const pendingPayment = loadPendingPayment()
  const targetOrderId = orderId || pendingPayment?.orderId || pendingPayment?.orderNo
  const key = `cancel:${targetOrderId || ''}:${pendingPayment?.tid || ''}`

  return once(key, async () => {
    if (pendingPayment?.paymentMethod === PAYMENT_METHODS.KAKAO_PAY) {
      const data = await cancelKakaoPay(targetOrderId, {
        tid: pendingPayment?.tid,
        amount: pendingPayment?.amount,
        partnerOrderId: pendingPayment?.partnerOrderId,
      }).catch((error) => {
        if (access?.isAdmin) {
          return markCanceled(targetOrderId)
        }

        throw error
      })
      const localResult = markCanceled(targetOrderId)

      return terminalData(data, localResult, {
        orderId: targetOrderId,
        paymentStatus: PAYMENT_CONTRACT_STATUS.CANCELED,
      })
    }

    const data = canSyncCheckoutResult(pendingPayment)
      ? await cancelCheckoutPayment(checkoutResultPayload(pendingPayment, { orderId: targetOrderId }))
      : {}
    const localResult = markCanceled(targetOrderId)

    return terminalData(data, localResult, {
      orderId: targetOrderId,
      paymentStatus: PAYMENT_CONTRACT_STATUS.CANCELED,
    })
  })
}

export async function resolvePaymentFailure({ orderId, reason } = {}) {
  const pendingPayment = loadPendingPayment()
  const targetOrderId = orderId || pendingPayment?.orderId || pendingPayment?.orderNo
  const key = `fail:${targetOrderId || ''}:${reason || ''}`

  return once(key, async () => {
    if (pendingPayment?.paymentMethod === PAYMENT_METHODS.KAKAO_PAY) {
      const data = await failKakaoPay(targetOrderId, reason).catch((error) => {
        console.error('[Payment] Failed to sync failed KakaoPay state. Marking failed locally.', error)
        return markFailed(targetOrderId)
      })
      const localResult = markFailed(targetOrderId)

      return terminalData(data, localResult, {
        orderId: targetOrderId,
        paymentStatus: PAYMENT_CONTRACT_STATUS.FAILED,
        orderStatus: ORDER_CONTRACT_STATUS.PENDING,
        reason,
      })
    }

    const data = canSyncCheckoutResult(pendingPayment)
      ? await failCheckoutPayment(checkoutResultPayload(pendingPayment, { orderId: targetOrderId, reason }))
      : {}
    const localResult = markFailed(targetOrderId)

    return terminalData(data, localResult, {
      orderId: targetOrderId,
      paymentStatus: PAYMENT_CONTRACT_STATUS.FAILED,
      orderStatus: ORDER_CONTRACT_STATUS.PENDING,
      reason,
    })
  })
}

export function markFailed(orderId) {
  return updatePendingPaymentOrder(ORDER_STATUS.PAYMENT_FAILED, orderId)
}

export function markCanceled(orderId) {
  return updatePendingPaymentOrder(ORDER_STATUS.CANCELED, orderId)
}

export function markExpired(orderId) {
  return updatePendingPaymentOrder(ORDER_STATUS.EXPIRED, orderId)
}
