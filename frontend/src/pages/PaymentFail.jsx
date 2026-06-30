import { useEffect, useState } from "react"
import { Link, useSearchParams } from 'react-router-dom'
import {
  PAYMENT_CONTRACT_STATUS,
  normalizePaymentStatus,
} from '../constants/status'
import { resolvePaymentFailure } from '../features/store/services/paymentResultService'
import { useCurrentMemberAccess } from '../features/member/useCurrentMemberAccess'
import './Store.css'

function PaymentFail() {
  const [searchParams] = useSearchParams()
  const access = useCurrentMemberAccess()
  const orderId = searchParams.get('orderId')
  const reason = searchParams.get('reason') || 'Payment approval failed.'
  const [result, setResult] = useState({
    userMessage: 'Confirming payment failure.',
    developerMessage: '',
    data: null,
  })

  useEffect(() => {
    if (access.isLoading) {
      return undefined
    }

    let ignore = false

    resolvePaymentFailure({ orderId, reason })
      .then((data) => {
        if (ignore) return
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
  }, [access.isAdmin, access.isLoading, orderId, reason])

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
          <Link className="button-link" to="/cart">
            Back to cart
          </Link>
        </div>
        {access.isAdmin && (
          <details className="developer-debug">
            <summary>Developer debug</summary>
            <p>{result.developerMessage || reason}</p>
            <pre>{JSON.stringify(result.data, null, 2)}</pre>
          </details>
        )}
      </section>
    </main>
  )
}

export default PaymentFail
