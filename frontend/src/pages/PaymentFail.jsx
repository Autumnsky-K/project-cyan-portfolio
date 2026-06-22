import { useEffect, useState } from "react"
import { Link, useSearchParams } from 'react-router-dom'
import { failKakaoPay } from '../api/payment'
import {
  PAYMENT_CONTRACT_STATUS,
  normalizePaymentStatus,
} from '../constants/status'
import { markFailed } from '../features/store/services/paymentResultService'
import { clearPendingPayment } from '../features/store/storage/paymentStorage'
import './Store.css'

function PaymentFail() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')
  const reason = searchParams.get('reason') || 'Payment approval failed.'
  const [result, setResult] = useState({
    userMessage: 'Confirming payment failure.',
    developerMessage: '',
    data: null,
  })

  useEffect(() => {
    let ignore = false

    failKakaoPay(orderId, reason)
      .catch(() => markFailed(orderId, reason))
      .then((data) => {
        if (ignore) return
        clearPendingPayment()
        setResult({
          userMessage: 'Payment failed.',
          developerMessage: '',
          data,
        })
      })
      .catch((error) => {
        if (ignore) return
        setResult({
          userMessage: 'Could not confirm payment failure.',
          developerMessage: error.message,
          data: { orderId, reason },
        })
      })

    return () => {
      ignore = true
    }
  }, [orderId, reason])

  const paymentStatus = normalizePaymentStatus(
    result.data?.paymentStatus || PAYMENT_CONTRACT_STATUS.FAILED,
  )

  return (
    <main className="page store-page">
      <section className="store-section payment-result">
        <p className="result-eyebrow">Payment result</p>
        <h1>Payment Failed</h1>
        <p>{result.userMessage}</p>
        <div className="result-summary">
          <p>
            Order <strong>{orderId || '-'}</strong>
          </p>
          <p>
            Payment <strong>{paymentStatus}</strong>
          </p>
          <p>
            Reason <strong>{reason}</strong>
          </p>
        </div>
        <div className="payment-actions">
          <Link className="button-link" to="/cart#checkout">
            Retry checkout
          </Link>
          <Link className="button-link" to="/cart">
            Back to cart
          </Link>
        </div>
        <details className="developer-debug">
          <summary>Developer debug</summary>
          <p>{result.developerMessage || reason}</p>
          <pre>{JSON.stringify(result.data, null, 2)}</pre>
        </details>
      </section>
    </main>
  )
}

export default PaymentFail
