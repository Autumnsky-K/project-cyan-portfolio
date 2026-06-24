import { useEffect } from 'react'
import CartPanel from '../features/store/components/CartPanel'
import CheckoutForm from '../features/store/components/CheckoutForm'
import OrderHistory from '../features/store/components/OrderHistory'
import PaymentPanel from '../features/store/components/PaymentPanel'
import ProductList from '../features/store/components/ProductList'
import { useStoreFlow } from '../features/store/hooks/useStoreFlow'
import { PAYMENT_METHODS } from '../features/store/utils/storeUtils'
import { useCurrentMemberAccess } from '../features/member/useCurrentMemberAccess'
import Header from '../shared/components/Header'
import './Store.css'

function Store() {
  const access = useCurrentMemberAccess()
  const isAdmin = access.isAdmin
  const store = useStoreFlow({
    allowLocalFallback: isAdmin,
    defaultMemberId: access.member?.memberId ?? access.member?.userId,
    fetchOrderHistory: isAdmin,
  })

  useEffect(() => {
    if (access.isLoading || isAdmin) return
    if (store.paymentMethod !== PAYMENT_METHODS.KAKAO_PAY) {
      store.setPaymentMethod(PAYMENT_METHODS.KAKAO_PAY)
    }
  }, [access.isLoading, isAdmin, store.paymentMethod, store.setPaymentMethod])

  if (access.isLoading) {
    return (
      <main className="store-page">
        <Header />
        <section className="store-section cart-loading-state">
          <p>Loading cart...</p>
        </section>
      </main>
    )
  }

  return (
    <main className="store-page">
      <Header />

      <section className="cart-access-bar" aria-label="Temporary access mode">
        <div>
          <span className="access-mode-title">Mode</span>
          {isAdmin && <strong>Admin store debug mode</strong>}
        </div>
        <div className="access-mode-switch">
          <button
            aria-pressed={!isAdmin}
            type="button"
            onClick={() => access.setAccessMode('user')}
          >
            User
          </button>
          <button
            aria-pressed={isAdmin}
            type="button"
            onClick={() => access.setAccessMode('admin')}
          >
            Admin
          </button>
        </div>
      </section>

      <section className="store-toolbar" aria-label="Cart summary">
        <div className="cart-total">
          <span>Items</span>
          <strong>{store.totalQuantity}</strong>
        </div>
        <div className="cart-total">
          <span>Total</span>
          <strong>{store.totalPrice.toLocaleString('ko-KR')} KRW</strong>
        </div>
      </section>

      <section className="store-layout">
        <aside className="filter-panel" aria-label="Cart steps">
          <div className="panel-heading">
            <h2>Checkout</h2>
          </div>
          <div className="cart-step-list">
            {isAdmin && <a href="#products">Products</a>}
            <a href="#cart">Cart</a>
            <a href="#checkout">Payment</a>
            {isAdmin && <a href="#order-history">Orders</a>}
          </div>
        </aside>

        <div className="goods-content cart-content">
          {isAdmin && (
            <ProductList
              products={store.products}
              status={store.productStatus}
              message={store.productMessage}
              onAddToCart={store.addToCart}
              onUseFallbackProducts={store.useFallbackProducts}
            />
          )}

          <CartPanel
            cartError={store.cartError}
            cartItems={store.cartItems}
            cartStatus={store.cartStatus}
            isCartEmpty={store.isCartEmpty}
            totalPrice={store.totalPrice}
            totalQuantity={store.totalQuantity}
            onDecreaseQuantity={store.decreaseQuantity}
            onIncreaseQuantity={store.increaseQuantity}
            onRemoveFromCart={store.removeFromCart}
          />

          <section className="store-section" id="checkout" aria-labelledby="checkout-title">
            <h2 id="checkout-title">Checkout</h2>
            <form className="checkout-form" onSubmit={store.handleCheckout}>
              <CheckoutForm
                checkoutForm={store.checkoutForm}
                errors={store.errors}
                onChange={store.updateCheckoutForm}
                showMemberId={isAdmin}
              />
              <PaymentPanel
                allowDevPayment={isAdmin}
                allowManualPaymentActions={isAdmin}
                checkoutForm={store.checkoutForm}
                hasBlockingCartIssue={store.hasBlockingCartIssue}
                isCartEmpty={store.isCartEmpty}
                isPaymentProcessing={store.isPaymentProcessing}
                message={store.message}
                paymentMethod={store.paymentMethod}
                paymentStatus={store.paymentStatus}
                pendingPayment={store.pendingPayment}
                totalPrice={store.totalPrice}
                totalQuantity={store.totalQuantity}
                onCancelPayment={store.handlePaymentCancel}
                onFailPayment={() => store.handlePaymentFail()}
                onPaymentMethodChange={store.setPaymentMethod}
                onRetryPayment={store.retryPayment}
              />
            </form>
          </section>

          {isAdmin && (
            <OrderHistory
              completedOrder={store.completedOrder}
              message={store.orderHistoryMessage}
              orders={store.orders}
            />
          )}

          {isAdmin && (
            <section className="store-section payment-debug" aria-labelledby="payment-debug-title">
              <h2 id="payment-debug-title">Payment Debug</h2>
              <dl>
                <dt>KakaoPay ready URL</dt>
                <dd>{store.lastKakaoReadyDebug?.readyRequestUrl || '-'}</dd>
                <dt>Pending payment</dt>
                <dd>
                  <pre>{JSON.stringify(store.storedPendingPayment, null, 2)}</pre>
                </dd>
                <dt>Last ready payload</dt>
                <dd>
                  <pre>{JSON.stringify(store.lastKakaoReadyPayload, null, 2)}</pre>
                </dd>
                <dt>Last ready response</dt>
                <dd>
                  <pre>{JSON.stringify(store.lastKakaoReadyResponse, null, 2)}</pre>
                </dd>
                <dt>Last error</dt>
                <dd>{store.lastKakaoReadyError || '-'}</dd>
              </dl>
            </section>
          )}
        </div>
      </section>
    </main>
  )
}

export default Store
