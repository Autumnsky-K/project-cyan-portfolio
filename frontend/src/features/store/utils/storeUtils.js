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
  return paymentMethod === PAYMENT_METHODS.KAKAO_PAY ? 'KakaoPay' : 'Dev preview'
}

export function getStatusLabel(status) {
  const labels = {
    [ORDER_CONTRACT_STATUS.PENDING]: 'Pending',
    [ORDER_CONTRACT_STATUS.PAID]: 'Paid',
    [ORDER_CONTRACT_STATUS.PREPARING]: 'Preparing',
    [ORDER_CONTRACT_STATUS.SHIPPED]: 'Shipped',
    [ORDER_CONTRACT_STATUS.DONE]: 'Done',
    [ORDER_CONTRACT_STATUS.CANCELED]: 'Canceled',
    [PAYMENT_CONTRACT_STATUS.READY]: 'Ready',
    [PAYMENT_CONTRACT_STATUS.APPROVED]: 'Approved',
    [PAYMENT_CONTRACT_STATUS.CANCELED]: 'Canceled',
    [PAYMENT_CONTRACT_STATUS.FAILED]: 'Failed',
    [ORDER_STATUS.CREATED]: 'Created',
    [ORDER_STATUS.PAYMENT_READY]: 'Payment ready',
    [ORDER_STATUS.PAYMENT_PENDING]: 'Payment pending',
    [ORDER_STATUS.PAID]: 'Paid',
    [ORDER_STATUS.PAYMENT_FAILED]: 'Payment failed',
    [ORDER_STATUS.CANCELED]: 'Canceled',
    [ORDER_STATUS.EXPIRED]: 'Expired',
  }

  return labels[status] || status
}

export function normalizeProduct(goods) {
  return {
    id: String(goods.id ?? goods.goodsId ?? goods.goods_id),
    goodsId: goods.goodsId ?? goods.goods_id ?? goods.id,
    name: goods.name ?? goods.goodsName ?? goods.goods_name ?? 'Untitled goods',
    artist: goods.artist ?? goods.artistName ?? goods.artist_name ?? 'CYAN',
    description: goods.description ?? goods.summary ?? '',
    image: goods.image ?? goods.imageUrl ?? goods.image_url ?? '',
    price: Number(goods.price ?? goods.unitPrice ?? goods.unit_price ?? 0),
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
