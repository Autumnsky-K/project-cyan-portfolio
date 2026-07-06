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
import { useCart } from '../features/cart/useCart'
import './Store.css'

function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const access = useCurrentMemberAccess()
  const { clearCart } = useCart()
  const orderId = searchParams.get('orderId')
  const pgToken = searchParams.get('pg_token')
  const paymentKey = searchParams.get('paymentKey')
  const amount = searchParams.get('amount')
  const [result, setResult] = useState({
    status: 'loading',
    userMessage: '결제 승인 결과를 확인하고 있습니다.',
    developerMessage: '',
    data: null,
  })

  useEffect(() => {
    if (access.isLoading) {
      return undefined
    }

    let ignore = false

    async function confirmPayment() {
      try {
        const data = await resolvePaymentApproval({
          access: { isAdmin: access.isAdmin },
          amount,
          orderId,
          paymentKey,
          pgToken,
        })

        if (ignore) return

        localStorage.removeItem('checkoutForm')
        try {
          await clearCart()
        } catch (cartError) {
          console.error('[PaymentSuccess] Failed to clear cart after payment approval.', cartError)
        }

        if (ignore) return

        setResult({
          status: 'success',
          userMessage: '결제가 승인되었습니다.',
          developerMessage: '',
          data,
        })
      } catch (error) {
        if (ignore) return
        setResult({
          status: 'error',
          userMessage: '결제 결과를 확인하지 못했습니다.',
          developerMessage: error.message,
          data: { amount, orderId, paymentKey, pgToken },
        })
      }
    }

    void confirmPayment()

    return () => {
      ignore = true
    }
  }, [access.isAdmin, access.isLoading, amount, clearCart, orderId, paymentKey, pgToken])

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
        <p className="result-eyebrow">결제 결과</p>
        <h1>주문이 완료되었습니다</h1>
        <p>{result.userMessage}</p>
        {result.status === 'error' && result.developerMessage && (
          <p className="status-message">{result.developerMessage}</p>
        )}
        <div className="result-summary">
          <p>
            주문 <strong>{orderNumber}</strong>
          </p>
          <p>
            결제 <strong>{paymentStatus}</strong>
          </p>
          <p>
            주문 상태 <strong>{orderStatus}</strong>
          </p>
        </div>
        <div className="result-box">
          <h2>주문 상품</h2>
          {items.length === 0 ? (
            <p>표시할 주문 상품이 없습니다.</p>
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
          <Link className="button-link" to="/mypage">
            주문 내역 보기
          </Link>
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

export default PaymentSuccess
