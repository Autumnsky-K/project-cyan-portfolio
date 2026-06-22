import { Link } from 'react-router-dom'
import CartPanel from '../features/store/components/CartPanel'
import CheckoutForm from '../features/store/components/CheckoutForm'
import OrderHistory from '../features/store/components/OrderHistory'
import PaymentPanel from '../features/store/components/PaymentPanel'
import ProductList from '../features/store/components/ProductList'
import { useStoreFlow } from '../features/store/hooks/useStoreFlow'
import './Store.css'

function Store() {
  const store = useStoreFlow()

  return (
    <main className="store-page">
      <header className="store-header">
        <div>
          <p className="eyebrow">SM Universe Store</p>
          <h1>Cart</h1>
        </div>
        <nav className="store-nav" aria-label="Store navigation">
          <Link to="/">Home</Link>
          <Link to="/artists">Artists</Link>
          <Link to="/goods">Goods</Link>
          <Link to="/cart" aria-current="page">
            Cart
          </Link>
        </nav>
      </header>

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
            <a href="#products">Products</a>
            <a href="#cart">Cart</a>
            <a href="#checkout">Payment</a>
            <a href="#order-history">Orders</a>
          </div>
        </aside>

        <div className="goods-content cart-content">
          <ProductList
            products={store.products}
            status={store.productStatus}
            message={store.productMessage}
            onAddToCart={store.addToCart}
            onUseFallbackProducts={store.useFallbackProducts}
          />

          <CartPanel
            cartItems={store.cartItems}
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
              />
              <PaymentPanel
                checkoutForm={store.checkoutForm}
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

          <OrderHistory
            completedOrder={store.completedOrder}
            message={store.orderHistoryMessage}
            orders={store.orders}
          />

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
        </div>
      </section>
    </main>
  )
}

export default Store
