import { normalizePaymentStatus } from '../../../constants/status'
import {
  PAYMENT_METHODS,
  formatPrice,
  getPaymentMethodLabel,
} from '../utils/storeUtils'

function getPaymentStatusLabel(status) {
  const contractStatus = normalizePaymentStatus(status)
  const labels = {
    READY: 'Ready',
    APPROVED: 'Approved',
    CANCELED: 'Canceled',
    FAILED: 'Failed',
  }

  return labels[contractStatus] || contractStatus
}

function getAddressSummary(checkoutForm) {
  return [
    checkoutForm.address.trim(),
    checkoutForm.addressDetail.trim(),
  ]
    .filter(Boolean)
    .join(' ')
}

function PaymentPanel({
  checkoutForm,
  hasBlockingCartIssue = false,
  isCartEmpty,
  isPaymentProcessing,
  message,
  paymentMethod,
  paymentStatus,
  totalPrice,
  totalQuantity,
  allowDevPayment = false,
  allowManualPaymentActions = false,
  onCancelPayment,
  onFailPayment,
  onPaymentMethodChange,
  requiresShipping = true,
}) {
  const paymentStatusLabel = getPaymentStatusLabel(paymentStatus)
  const visiblePaymentMethod = allowDevPayment
    ? paymentMethod
    : paymentMethod === PAYMENT_METHODS.KAKAO_PAY
      ? PAYMENT_METHODS.KAKAO_PAY
      : PAYMENT_METHODS.TOSS
  const addressSummary = getAddressSummary(checkoutForm)

  return (
    <aside className="payment-panel">
      <h3>Payment</h3>
      <fieldset className="payment-methods" disabled={isPaymentProcessing}>
        <legend>결제 수단</legend>
        {allowDevPayment && (
          <label>
            <input
              checked={paymentMethod === PAYMENT_METHODS.MOCK}
              name="paymentMethod"
              onChange={(event) => onPaymentMethodChange(event.target.value)}
              type="radio"
              value={PAYMENT_METHODS.MOCK}
            />
            Dev preview
          </label>
        )}
        <label>
          <input
            checked={paymentMethod === PAYMENT_METHODS.TOSS}
            name="paymentMethod"
            onChange={(event) => onPaymentMethodChange(event.target.value)}
            type="radio"
            value={PAYMENT_METHODS.TOSS}
          />
          Toss Payments
        </label>
        <label>
          <input
            checked={paymentMethod === PAYMENT_METHODS.KAKAO_PAY}
            name="paymentMethod"
            onChange={(event) => onPaymentMethodChange(event.target.value)}
            type="radio"
            value={PAYMENT_METHODS.KAKAO_PAY}
          />
          KakaoPay
        </label>
      </fieldset>

      <div className="confirm-box" aria-labelledby="confirm-title">
        <h3 id="confirm-title">주문 확인</h3>
        {isCartEmpty ? (
          <p>결제하기 전에 상품을 카트에 담아 주세요.</p>
        ) : (
          <>
            <p>
              상품 {totalQuantity}개 / 결제 예정 금액{' '}
              <strong>{formatPrice(totalPrice)}</strong>
            </p>
            <p>
              결제 수단: <strong>{getPaymentMethodLabel(visiblePaymentMethod)}</strong>
            </p>
            <p>
              주문자: {checkoutForm.name.trim() || '-'} /{' '}
              {checkoutForm.email.trim() || '-'} /{' '}
              {checkoutForm.phone.trim() || '-'}
            </p>
            {requiresShipping ? (
              <>
                <p>주소: {addressSummary || '-'}</p>
                <p>배송 요청사항: {checkoutForm.deliveryRequest.trim() || '-'}</p>
              </>
            ) : (
              <p>배송: 디지털 상품 저장소에서 다운로드</p>
            )}
          </>
        )}
      </div>

      <dl className="payment-summary">
        <dt>수량</dt>
        <dd>{totalQuantity}</dd>
        <dt>합계</dt>
        <dd>{formatPrice(totalPrice)}</dd>
        <dt>상태</dt>
        <dd>
          {normalizePaymentStatus(paymentStatus)} ({paymentStatusLabel})
        </dd>
      </dl>

      {isPaymentProcessing && (
        <p className="status-message" aria-live="polite">
          결제를 준비하고 있습니다. 결제 페이지가 열릴 때까지 기다려 주세요.
        </p>
      )}

      {hasBlockingCartIssue && (
        <p className="status-message" aria-live="polite">
          결제하기 전에 카트 상품의 문제를 확인해 주세요.
        </p>
      )}

      <button disabled={isCartEmpty || hasBlockingCartIssue || isPaymentProcessing} type="submit">
        {isPaymentProcessing
          ? '결제 준비 중...'
          : visiblePaymentMethod === PAYMENT_METHODS.KAKAO_PAY
            ? 'KakaoPay 결제하기'
            : visiblePaymentMethod === PAYMENT_METHODS.TOSS
              ? 'Toss Payments로 결제하기'
            : 'Create dev preview order'}
      </button>

      {message && <p className="status-message">{message}</p>}

      {allowManualPaymentActions && (
        <div className="payment-actions">
          <button
            type="button"
            onClick={onFailPayment}
            disabled={isPaymentProcessing}
          >
            Mark failed
          </button>
          <button
            type="button"
            onClick={onCancelPayment}
            disabled={isPaymentProcessing}
          >
            Mark canceled
          </button>
        </div>
      )}
    </aside>
  )
}

export default PaymentPanel
