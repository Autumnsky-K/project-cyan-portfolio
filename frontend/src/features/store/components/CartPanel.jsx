import { formatPrice } from '../utils/storeUtils'

function CartPanel({
  className = '',
  cartError = '',
  cartItems,
  cartStatus = 'idle',
  isCartEmpty,
  totalPrice,
  totalQuantity,
  onDecreaseQuantity,
  onIncreaseQuantity,
  onRemoveFromCart,
}) {
  const sectionClassName = ['store-section', className].filter(Boolean).join(' ')

  return (
    <section className={sectionClassName} id="cart" aria-labelledby="cart-title">
      <div className="section-heading">
        <h2 id="cart-title">Cart</h2>
        <p>
          {totalQuantity} items / {formatPrice(totalPrice)}
        </p>
      </div>
      {cartStatus === 'loading' ? (
        <p>Loading cart...</p>
      ) : cartStatus === 'error' ? (
        <p>{cartError || 'Unable to load cart.'}</p>
      ) : isCartEmpty ? (
        <p>Your cart is empty.</p>
      ) : (
        <ul className="cart-list">
          {cartItems.map((item) => {
            const cartItemKey = item.cartItemKey ?? item.id

            return (
              <li key={cartItemKey}>
                <div>
                  <strong>{item.name}</strong>
                  <span>{formatPrice(item.price)}</span>
                  {item.cartIssue && (
                    <p className="cart-item-issue" role="status">
                      {item.cartIssue.message}
                    </p>
                  )}
                </div>
                <div className="cart-controls">
                  <button type="button" onClick={() => onDecreaseQuantity(cartItemKey)}>
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => onIncreaseQuantity(cartItemKey)}>
                    +
                  </button>
                  <button type="button" onClick={() => onRemoveFromCart(cartItemKey)}>
                    Remove
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default CartPanel
