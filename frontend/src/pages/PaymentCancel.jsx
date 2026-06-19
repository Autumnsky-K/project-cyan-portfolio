import { useEffect, useState } from "react"
import { Link, useSearchParams } from 'react-router-dom'
import { cancelKakaoPay } from '../api/payment'
import {
  PAYMENT_CONTRACT_STATUS,
  normalizePaymentStatus,
} from '../constants/status'
import { markCanceled } from '../features/store/services/paymentResultService'
import { clearPendingPayment } from '../features/store/storage/paymentStorage'
import './Store.css'

function PaymentCancel() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [result, setResult] = useState({
    userMessage: 'Confirming payment cancellation.',
    developerMessage: '',
    data: null,
  })

  useEffect(() => {
    let ignore = false

    cancelKakaoPay(orderId)
      .catch(() => markCanceled(orderId))
      .then((data) => {
        if (ignore) return
        clearPendingPayment()
        setResult({
          userMessage: 'Payment was canceled.',
          developerMessage: '',
          data,
        })
      })
      .catch((error) => {
        if (ignore) return
        setResult({
          userMessage: 'Could not confirm cancellation.',
          developerMessage: error.message,
          data: { orderId },
        })
      })

    return () => {
      ignore = true
    }
  }, [orderId])

  const paymentStatus = normalizePaymentStatus(
    result.data?.paymentStatus || PAYMENT_CONTRACT_STATUS.CANCELED,
  )

  return (
    <main className="page store-page">
      <section className="store-section payment-result">
        <p className="result-eyebrow">Payment result</p>
        <h1>Payment Canceled</h1>
        <p>{result.userMessage}</p>
        <div className="result-summary">
          <p>
            Order <strong>{orderId || '-'}</strong>
          </p>
          <p>
            Payment <strong>{paymentStatus}</strong>
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
          <p>{result.developerMessage || '-'}</p>
          <pre>{JSON.stringify(result.data, null, 2)}</pre>
        </details>
      </section>
    </main>
  )
}

export default PaymentCancel
