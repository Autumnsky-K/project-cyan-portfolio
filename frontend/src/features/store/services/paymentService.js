import {
  getKakaoPayReadyDebugInfo,
  requestKakaoPayReady as requestKakaoPayReadyApi,
} from '../../../api/payment'
import {
  ORDER_STATUS,
  PAYMENT_METHODS,
} from '../utils/storeUtils'

export async function requestKakaoPayReady(order) {
  return requestKakaoPayReadyApi(order)
}

export function getKakaoReadyDebugInfo() {
  return getKakaoPayReadyDebugInfo()
}

export function handleMockPayment(order) {
  return {
    ...order,
    status: ORDER_STATUS.PAID,
    updatedAt: new Date().toISOString(),
  }
}

export const createMockPaidOrder = handleMockPayment

export function createKakaoPendingPayment(order, kakaoReady = {}) {
  return {
    tid: kakaoReady.tid || '',
    orderId: kakaoReady.orderId || order.orderId,
    localOrderId: order.orderId,
    orderNo: kakaoReady.orderNo || order.orderNumber,
    partnerOrderId:
      kakaoReady.partnerOrderId ||
      kakaoReady.partner_order_id ||
      order.partnerOrderId,
    partnerUserId: kakaoReady.partnerUserId || '',
    paymentMethod: PAYMENT_METHODS.KAKAO_PAY,
    createdAt: new Date().toISOString(),
  }
}
