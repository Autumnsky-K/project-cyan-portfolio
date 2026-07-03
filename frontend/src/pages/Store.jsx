import CartPanel from '../features/store/components/CartPanel'
import CheckoutForm from '../features/store/components/CheckoutForm'
import OrderHistory from '../features/store/components/OrderHistory'
import PaymentPanel from '../features/store/components/PaymentPanel'
import ProductList from '../features/store/components/ProductList'
import { useStoreFlow } from '../features/store/hooks/useStoreFlow'
import { requestCartLogin } from '../features/cart/requestCartLogin'
import { updateMemberProfile } from '../features/member/member'
import { useCurrentMemberAccess } from '../features/member/useCurrentMemberAccess'
import { useNavigate } from 'react-router-dom'
import './Store.css'

function Store({ mode = 'checkout' }) {
  const navigate = useNavigate()
  const isCheckoutMode = mode !== 'cart'
  const access = useCurrentMemberAccess()
  const isAdmin = access.isAdmin
  const store = useStoreFlow({
    allowLocalFallback: isAdmin,
    defaultCustomerName: access.member?.name,
    defaultCustomerEmail: access.member?.email,
    defaultCustomerPhone: access.member?.phone,
    defaultCustomerAddress: access.member?.address,
    defaultCustomerAddressDetail: access.member?.addressDetail,
    defaultCustomerDeliveryRequest: access.member?.deliveryRequest,
    defaultMemberId: access.member?.memberId,
    fetchOrderHistory: isAdmin,
  })

  function handleCheckoutEntry() {
    if (store.isCartEmpty) return

    if (!store.isCartSignedIn) {
      requestCartLogin(navigate, '/checkout')
      return
    }

    navigate('/checkout')
  }

  async function handleCheckoutProfileConfirm() {
    try {
      await updateMemberProfile(store.checkoutForm)
      await access.refreshMember?.()
    } catch (error) {
      console.error(error)
      window.alert('변경 내용을 저장하지 못했습니다. 다시 시도해 주세요.')
      throw error
    }
  }

  function canPersistCheckoutProfile() {
    return (
      store.isCartSignedIn &&
      !store.isCartEmpty &&
      !store.hasBlockingCartIssue &&
      String(store.checkoutForm.memberId ?? '').trim() &&
      store.checkoutForm.name.trim() &&
      store.checkoutForm.email.trim() &&
      store.checkoutForm.phone.trim() &&
      store.checkoutForm.address.trim()
    )
  }

  async function saveCheckoutProfile() {
    try {
      await updateMemberProfile(store.checkoutForm)
      await access.refreshMember?.()
    } catch (error) {
      console.error(error)
      window.alert('변경 내용을 저장하지 못했습니다. 다시 시도해 주세요.')
      throw error
    }
  }

  async function handleCheckoutSubmit(event) {
    event.preventDefault()

    if (canPersistCheckoutProfile()) {
      try {
        await saveCheckoutProfile()
      } catch {
        return
      }
    }

    store.handleCheckout(event)
  }

  if (isCheckoutMode && access.isLoading) {
    return (
      <div className="store-page">
        <section className="store-section cart-loading-state">
          <p>결제 정보를 불러오는 중입니다...</p>
        </section>
      </div>
    )
  }

  return (
    <div className={`store-page ${isCheckoutMode ? 'is-checkout-mode' : 'is-cart-mode'}`}>
      <section className="store-toolbar" aria-label="카트 요약">
        <div className="cart-total">
          <span>상품 수</span>
          <strong>{store.totalQuantity}</strong>
        </div>
        <div className="cart-total">
          <span>합계</span>
          <strong>{store.totalPrice.toLocaleString('ko-KR')} KRW</strong>
        </div>
      </section>

      <div className={isCheckoutMode ? 'checkout-layout-shell' : 'cart-layout-shell'}>
        <section className="store-layout">
          <aside className="filter-panel" aria-label="카트 결제 단계">
            <div className="panel-heading">
              <h2>{isCheckoutMode ? 'Checkout' : 'Cart'}</h2>
            </div>
            <div className="cart-step-list">
              {isAdmin && <a href="#products">Products</a>}
              <a href="#cart">Cart</a>
              {isCheckoutMode && <a href="#checkout">Payment</a>}
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

            {isCheckoutMode ? (
              <section className="store-section checkout-stage" id="checkout" aria-labelledby="checkout-title">
                <div className="checkout-main">
                  <h2 id="checkout-title">Checkout</h2>
                  <form className="checkout-form" onSubmit={handleCheckoutSubmit}>
                    <CheckoutForm
                      checkoutForm={store.checkoutForm}
                      errors={store.errors}
                      onChange={store.updateCheckoutForm}
                      onConfirmField={handleCheckoutProfileConfirm}
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
                      totalPrice={store.totalPrice}
                      totalQuantity={store.totalQuantity}
                      onCancelPayment={store.handlePaymentCancel}
                      onFailPayment={() => store.handlePaymentFail()}
                      onPaymentMethodChange={store.setPaymentMethod}
                    />
                  </form>
                </div>
              </section>
            ) : (
              <>
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
                <section className="store-section cart-checkout-entry" aria-labelledby="cart-checkout-title">
                  <div>
                    <h2 id="cart-checkout-title">Checkout</h2>
                    <p>
                      {store.isCartSignedIn
                        ? '카트에 담긴 상품의 결제를 진행할 수 있습니다.'
                        : '카트 상품을 결제하려면 로그인해 주세요.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={store.isCartEmpty}
                    onClick={handleCheckoutEntry}
                  >
                    {store.isCartSignedIn ? '결제하러 가기' : '로그인하고 결제하기'}
                  </button>
                </section>
              </>
            )}

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

        {isCheckoutMode && (
          <aside className="checkout-cart-summary" aria-label="카트 요약">
            <CartPanel
              className="checkout-cart-panel"
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
          </aside>
        )}
      </div>
    </div>
  )
}

export default Store
