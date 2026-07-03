import { formatPrice } from '../utils/storeUtils'
import QuantityStepper from '../../../shared/components/QuantityStepper'

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
            const imageUrl = item.image ?? item.imageUrl ?? ''
            const isDigitalItem = item.fulfillmentType === 'DIGITAL'

            return (
              <li key={cartItemKey}>
                <div className={`cart-item-image ${imageUrl ? 'has-image' : 'is-empty'}`} aria-hidden="true">
                  {imageUrl && <img src={imageUrl} alt="" />}
                </div>
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
                  <QuantityStepper
                    disabled={isDigitalItem}
                    label={`${item.name} 수량`}
                    max={isDigitalItem ? 1 : item.maxQuantity ?? null}
                    value={item.quantity}
                    onChange={(nextQuantity) => {
                      if (nextQuantity < item.quantity) onDecreaseQuantity(cartItemKey)
                      if (nextQuantity > item.quantity) onIncreaseQuantity(cartItemKey)
                    }}
                  />
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
