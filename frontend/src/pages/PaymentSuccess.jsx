import { useEffect, useState } from "react"
import { Link, useSearchParams } from 'react-router-dom'
import {
  ORDER_CONTRACT_STATUS,
  PAYMENT_CONTRACT_STATUS,
  normalizeOrderStatus,
  normalizePaymentStatus,
} from '../constants/status'
import { resolvePaymentApproval } from '../features/store/services/paymentResultService'
import { formatPrice } from '../features/store/utils/storeUtils'
import { useCurrentMemberAccess } from '../features/member/useCurrentMemberAccess'
import './Store.css'

function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const access = useCurrentMemberAccess()
  const orderId = searchParams.get('orderId')
  const pgToken = searchParams.get('pg_token')
  const paymentKey = searchParams.get('paymentKey')
  const amount = searchParams.get('amount')
  const [result, setResult] = useState({
    status: 'loading',
    userMessage: 'Confirming payment approval.',
    developerMessage: '',
    data: null,
  })

  useEffect(() => {
    if (access.isLoading) {
      return undefined
    }

    let ignore = false

    resolvePaymentApproval({
      access: { isAdmin: access.isAdmin },
      amount,
      orderId,
      paymentKey,
      pgToken,
    })
      .then((data) => {
        if (ignore) return
        localStorage.removeItem('checkoutForm')
        setResult({
          status: 'success',
          userMessage: 'Payment approved.',
          developerMessage: '',
          data,
        })
      })
      .catch((error) => {
        if (ignore) return
        setResult({
          status: 'error',
          userMessage: 'Payment result could not be verified.',
          developerMessage: error.message,
          data: { amount, orderId, paymentKey, pgToken },
        })
      })

    return () => {
      ignore = true
    }
  }, [access.isAdmin, access.isLoading, amount, orderId, paymentKey, pgToken])

  const order = result.data?.order
  const orderNumber =
    order?.orderNumber ||
    order?.orderNo ||
    result.data?.orderNo ||
    result.data?.pendingPayment?.orderNo ||
    result.data?.orderId ||
    orderId ||
    '-'
  const paymentStatus = normalizePaymentStatus(
    result.data?.paymentStatus ||
      (result.status === 'success'
        ? PAYMENT_CONTRACT_STATUS.APPROVED
        : 'UNVERIFIED'),
  )
  const orderStatus = normalizeOrderStatus(
    result.data?.orderStatus ||
      order?.status ||
      (result.status === 'success' ? ORDER_CONTRACT_STATUS.PAID : 'UNVERIFIED'),
  )
  const items = order?.items || []

  return (
    <main className="page store-page">
      <section className="store-section payment-result">
        <p className="result-eyebrow">Payment result</p>
        <h1>Order Complete</h1>
        <p>{result.userMessage}</p>
        {result.status === 'error' && result.developerMessage && (
          <p className="status-message">{result.developerMessage}</p>
        )}
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
