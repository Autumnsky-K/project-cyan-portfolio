import { useEffect, useState } from "react"
import { Link, useSearchParams } from 'react-router-dom'
import { approveKakaoPay } from '../api/payment'
import {
  ORDER_CONTRACT_STATUS,
  PAYMENT_CONTRACT_STATUS,
  normalizeOrderStatus,
  normalizePaymentStatus,
} from '../constants/status'
import { approveLocalPreview } from '../features/store/services/paymentResultService'
import { loadOrders } from '../features/store/storage/orderStorage'
import {
  clearPendingPayment,
  loadPendingPayment,
} from '../features/store/storage/paymentStorage'
import { formatPrice } from '../features/store/utils/storeUtils'
import { useCurrentMemberAccess } from '../features/member/useCurrentMemberAccess'
import './Store.css'

function findPreviewOrder(pendingPayment, orderId) {
  const orderKey = pendingPayment?.localOrderId || pendingPayment?.orderId || orderId

  return loadOrders().find(
    (order) =>
      order.orderId === orderKey ||
      order.orderNumber === orderKey ||
      order.orderId === pendingPayment?.localOrderId,
  )
}

function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const access = useCurrentMemberAccess()
  const orderId = searchParams.get('orderId')
  const pgToken = searchParams.get('pg_token')
  const [result, setResult] = useState({
    status: 'loading',
    userMessage: 'Confirming KakaoPay approval.',
    developerMessage: '',
    data: null,
  })

  useEffect(() => {
    if (access.isLoading) {
      return undefined
    }

    let ignore = false
    const pendingPayment = loadPendingPayment()
    const targetOrderId = orderId || pendingPayment?.orderId
    const tid = pendingPayment?.tid
    const previewOrder = findPreviewOrder(pendingPayment, targetOrderId)

    if (!targetOrderId || !pgToken) {
      Promise.resolve().then(() => {
        if (ignore) return
        setResult({
          status: 'error',
          userMessage: 'Missing payment approval data.',
          developerMessage: 'orderId or pg_token is missing.',
          data: { orderId: targetOrderId, order: previewOrder },
        })
      })
      return undefined
    }

    approveKakaoPay({ orderId: targetOrderId, tid, pgToken })
      .catch((error) => {
        if (access.isAdmin) {
          return approveLocalPreview({ orderId: targetOrderId, pgToken })
        }

        throw error
      })
      .then((data) => {
        if (ignore) return
        clearPendingPayment()
        setResult({
          status: 'success',
          userMessage: 'Payment approved.',
          developerMessage: '',
          data: { ...data, order: data?.order || previewOrder, pendingPayment },
        })
      })
      .catch((error) => {
        if (ignore) return
        setResult({
          status: 'error',
          userMessage: 'Payment approval failed.',
          developerMessage: error.message,
          data: { orderId: targetOrderId, tid, pgToken, order: previewOrder },
        })
      })

    return () => {
      ignore = true
    }
  }, [access.isAdmin, access.isLoading, orderId, pgToken])

  const order = result.data?.order
  const orderNumber =
    order?.orderNumber ||
    result.data?.orderNo ||
    result.data?.pendingPayment?.orderNo ||
    result.data?.orderId ||
    orderId ||
    '-'
  const paymentStatus = normalizePaymentStatus(
    result.data?.paymentStatus ||
      (result.status === 'success'
        ? PAYMENT_CONTRACT_STATUS.APPROVED
        : PAYMENT_CONTRACT_STATUS.FAILED),
  )
  const orderStatus = normalizeOrderStatus(
    result.data?.orderStatus ||
      order?.status ||
      (result.status === 'success'
        ? ORDER_CONTRACT_STATUS.PAID
        : ORDER_CONTRACT_STATUS.PENDING),
  )
  const items = order?.items || []

  return (
    <main className="page store-page">
      <section className="store-section payment-result">
        <p className="result-eyebrow">Payment result</p>
        <h1>Order Complete</h1>
        <p>{result.userMessage}</p>
        <div className="result-summary">
          <p>
            Order <strong>{orderNumber}</strong>
          </p>
          <p>
            Payment <strong>{paymentStatus}</strong>
          </p>
          <p>
            Order status <strong>{orderStatus}</strong>
          </p>
        </div>
        <div className="result-box">
          <h2>Items</h2>
          {items.length === 0 ? (
            <p>No preview items are available.</p>
          ) : (
            <ul>
              {items.map((item) => (
                <li key={`${orderNumber}-${item.productId || item.goodsId}`}>
                  {item.name} x {item.quantity} = {formatPrice(item.price * item.quantity)}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="payment-actions">
          <Link className="button-link" to="/cart#order-history">
            View orders
          </Link>
          <Link className="button-link" to="/cart">
            Back to cart
          </Link>
        </div>
        {access.isAdmin && (
          <details className="developer-debug">
            <summary>Developer debug</summary>
            <p>{result.developerMessage || '-'}</p>
            <pre>{JSON.stringify(result.data, null, 2)}</pre>
          </details>
        )}
      </section>
    </main>
  )
}

export default PaymentSuccess
