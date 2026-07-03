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
        <legend>Payment method</legend>
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
        <h3 id="confirm-title">Order confirmation</h3>
        {isCartEmpty ? (
          <p>Add products before checkout.</p>
        ) : (
          <>
            <p>
              {totalQuantity} items / expected payment{' '}
              <strong>{formatPrice(totalPrice)}</strong>
            </p>
            <p>
              Method: <strong>{getPaymentMethodLabel(visiblePaymentMethod)}</strong>
            </p>
            <p>
              Customer: {checkoutForm.name.trim() || '-'} /{' '}
              {checkoutForm.email.trim() || '-'} /{' '}
              {checkoutForm.phone.trim() || '-'}
            </p>
            {requiresShipping ? (
              <>
                <p>Address: {addressSummary || '-'}</p>
                <p>Delivery request: {checkoutForm.deliveryRequest.trim() || '-'}</p>
              </>
            ) : (
              <p>Delivery: 디지털 상품 저장소에서 다운로드</p>
            )}
          </>
        )}
      </div>

      <dl className="payment-summary">
        <dt>Quantity</dt>
        <dd>{totalQuantity}</dd>
        <dt>Total</dt>
        <dd>{formatPrice(totalPrice)}</dd>
        <dt>Status</dt>
        <dd>
          {normalizePaymentStatus(paymentStatus)} ({paymentStatusLabel})
        </dd>
      </dl>

      {isPaymentProcessing && (
        <p className="status-message" aria-live="polite">
          Payment is being prepared. Wait until the payment page opens.
        </p>
      )}

      {hasBlockingCartIssue && (
        <p className="status-message" aria-live="polite">
          Resolve cart item issues before checkout.
        </p>
      )}

      <button disabled={isCartEmpty || hasBlockingCartIssue || isPaymentProcessing} type="submit">
        {isPaymentProcessing
          ? 'Preparing payment...'
          : visiblePaymentMethod === PAYMENT_METHODS.KAKAO_PAY
            ? 'Prepare KakaoPay'
            : visiblePaymentMethod === PAYMENT_METHODS.TOSS
              ? 'Prepare Toss Payments'
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
