import {
  ORDER_CONTRACT_STATUS,
  PAYMENT_CONTRACT_STATUS,
  normalizeOrderStatus,
  normalizePaymentStatus,
} from '../../../constants/status'

export const ORDER_STATUS = {
  CREATED: 'CREATED',
  PAYMENT_READY: 'PAYMENT_READY',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  PAID: 'PAID',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  CANCELED: 'CANCELED',
  EXPIRED: 'EXPIRED',
}

export const PAYMENT_METHODS = {
  MOCK: 'MOCK',
  KAKAO_PAY: 'KAKAO_PAY',
  TOSS: 'TOSS',
}

export function calculateTotalQuantity(items) {
  return items.reduce((total, item) => total + item.quantity, 0)
}

export function calculateTotalPrice(items) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0)
}

export function createOrderId() {
  return `ORD-${Date.now()}`
}

export function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('ko-KR')
}

export function formatPrice(value) {
  return `${Number(value || 0).toLocaleString('ko-KR')} KRW`
}

export function getPaymentMethodLabel(paymentMethod) {
  if (paymentMethod === PAYMENT_METHODS.KAKAO_PAY) return 'KakaoPay'
  if (paymentMethod === PAYMENT_METHODS.TOSS) return 'Toss Payments'
  return '개발용 미리보기'
}

export function getStatusLabel(status) {
  const labels = {
    [ORDER_CONTRACT_STATUS.PENDING]: '대기 중',
    [ORDER_CONTRACT_STATUS.PAID]: '결제 완료',
    [ORDER_CONTRACT_STATUS.PREPARING]: '상품 준비 중',
    [ORDER_CONTRACT_STATUS.SHIPPED]: '배송 중',
    [ORDER_CONTRACT_STATUS.DONE]: '처리 완료',
    [ORDER_CONTRACT_STATUS.CANCELED]: '취소됨',
    [PAYMENT_CONTRACT_STATUS.READY]: '결제 준비',
    [PAYMENT_CONTRACT_STATUS.APPROVED]: '결제 승인',
    [PAYMENT_CONTRACT_STATUS.CANCELED]: '결제 취소',
    [PAYMENT_CONTRACT_STATUS.FAILED]: '결제 실패',
    [ORDER_STATUS.CREATED]: '주문 생성',
    [ORDER_STATUS.PAYMENT_READY]: '결제 준비',
    [ORDER_STATUS.PAYMENT_PENDING]: '결제 대기 중',
    [ORDER_STATUS.PAID]: '결제 완료',
    [ORDER_STATUS.PAYMENT_FAILED]: '결제 실패',
    [ORDER_STATUS.CANCELED]: '취소됨',
    [ORDER_STATUS.EXPIRED]: '만료됨',
  }

  return labels[status] || status
}

export function normalizeProduct(goods) {
  return {
    id: String(goods.id ?? goods.goodsId ?? goods.goods_id),
    goodsId: goods.goodsId ?? goods.goods_id ?? goods.id,
    name: goods.name ?? goods.goodsName ?? goods.goods_name ?? '이름 없는 상품',
    artist: goods.artist ?? goods.artistName ?? goods.artist_name ?? 'CYAN',
    description: goods.description ?? goods.summary ?? '',
    image: goods.image ?? goods.imageUrl ?? goods.mainImageUrl ?? goods.image_url ?? goods.main_image_url ?? '',
    price: Number(goods.price ?? goods.unitPrice ?? goods.unit_price ?? 0),
    fulfillmentType: goods.fulfillmentType ?? goods.fulfillment_type ?? null,
  }
}

export function updateOrderStatus(order, status) {
  return {
    ...order,
    status,
    orderStatus: normalizeOrderStatus(status),
    paymentStatus: normalizePaymentStatus(status),
    updatedAt: new Date().toISOString(),
  }
}

export function isPendingPaymentExpired(pendingPayment, now = new Date()) {
  if (!pendingPayment?.createdAt) return false

  const createdAt = new Date(pendingPayment.createdAt)
  const expiresInMs = 30 * 60 * 1000

  return now.getTime() - createdAt.getTime() > expiresInMs
}
