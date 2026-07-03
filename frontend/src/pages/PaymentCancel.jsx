import { useEffect, useState } from "react"
import { Link, useSearchParams } from 'react-router-dom'
import {
  PAYMENT_CONTRACT_STATUS,
  normalizePaymentStatus,
} from '../constants/status'
import { resolvePaymentCancellation } from '../features/store/services/paymentResultService'
import { useCurrentMemberAccess } from '../features/member/useCurrentMemberAccess'
import './Store.css'

function PaymentCancel() {
  const [searchParams] = useSearchParams()
  const access = useCurrentMemberAccess()
  const orderId = searchParams.get('orderId')
  const [result, setResult] = useState({
    userMessage: '결제 취소 결과를 확인하고 있습니다.',
    developerMessage: '',
    data: null,
  })

  useEffect(() => {
    if (access.isLoading) {
      return undefined
    }

    let ignore = false

    resolvePaymentCancellation({ access: { isAdmin: access.isAdmin }, orderId })
      .then((data) => {
        if (ignore) return
        setResult({
          userMessage: '결제가 취소되었습니다.',
          developerMessage: '',
          data,
        })
      })
      .catch((error) => {
        if (ignore) return
        setResult({
          userMessage: '결제 취소 결과를 확인하지 못했습니다.',
          developerMessage: error.message,
          data: { orderId },
        })
      })

    return () => {
      ignore = true
    }
  }, [access.isAdmin, access.isLoading, orderId])

  const paymentStatus = normalizePaymentStatus(
    result.data?.paymentStatus || PAYMENT_CONTRACT_STATUS.CANCELED,
  )

  return (
    <main className="page store-page">
      <section className="store-section payment-result">
        <p className="result-eyebrow">결제 결과</p>
        <h1>결제가 취소되었습니다</h1>
        <p>{result.userMessage}</p>
        <div className="result-summary">
          <p>
            주문 <strong>{orderId || '-'}</strong>
          </p>
          <p>
            결제 <strong>{paymentStatus}</strong>
          </p>
        </div>
        <div className="payment-actions">
          <Link className="button-link" to="/cart">
            카트로 돌아가기
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

export default PaymentCancel
