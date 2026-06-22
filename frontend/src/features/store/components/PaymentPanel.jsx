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

function PaymentPanel({
  checkoutForm,
  isCartEmpty,
  isPaymentProcessing,
  message,
  paymentMethod,
  paymentStatus,
  pendingPayment,
  totalPrice,
  totalQuantity,
  onCancelPayment,
  onFailPayment,
  onPaymentMethodChange,
  onRetryPayment,
}) {
  const paymentStatusLabel = getPaymentStatusLabel(paymentStatus)

  return (
    <aside className="payment-panel">
      <h3>Payment</h3>
      <fieldset className="payment-methods" disabled={isPaymentProcessing}>
        <legend>Payment method</legend>
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
              Method: <strong>{getPaymentMethodLabel(paymentMethod)}</strong>
            </p>
            <p>
              Customer: {checkoutForm.name.trim() || '-'} /{' '}
              {checkoutForm.email.trim() || '-'} /{' '}
              {checkoutForm.phone.trim() || '-'}
            </p>
            <p>Address: {checkoutForm.address.trim() || '-'}</p>
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

      <button disabled={isCartEmpty || isPaymentProcessing} type="submit">
        {isPaymentProcessing
          ? 'Preparing payment...'
          : paymentMethod === PAYMENT_METHODS.KAKAO_PAY
            ? 'Prepare KakaoPay'
            : 'Create dev preview order'}
      </button>

      {pendingPayment && (
        <div className="pending-payment">
          <strong>Pending payment exists</strong>
          <p>Order: {pendingPayment.orderNo || pendingPayment.orderId}</p>
          <p>Method: {getPaymentMethodLabel(pendingPayment.paymentMethod)}</p>
          <p>
            Created:{' '}
            {pendingPayment.createdAt
              ? new Date(pendingPayment.createdAt).toLocaleString('ko-KR')
              : '-'}
          </p>
          <button type="button" onClick={onRetryPayment}>
            Retry
          </button>
          <button type="button" onClick={onCancelPayment}>
            Cancel
          </button>
        </div>
      )}

      {message && <p className="status-message">{message}</p>}

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
    </aside>
  )
}

export default PaymentPanel
