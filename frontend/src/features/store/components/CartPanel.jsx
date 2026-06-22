import { formatPrice } from '../utils/storeUtils'

function CartPanel({
  cartItems,
  isCartEmpty,
  totalPrice,
  totalQuantity,
  onDecreaseQuantity,
  onIncreaseQuantity,
  onRemoveFromCart,
}) {
  return (
    <section className="store-section" id="cart" aria-labelledby="cart-title">
      <div className="section-heading">
        <h2 id="cart-title">Cart</h2>
        <p>
          {totalQuantity} items / {formatPrice(totalPrice)}
        </p>
      </div>
      {isCartEmpty ? (
        <p>Your cart is empty.</p>
      ) : (
        <ul className="cart-list">
          {cartItems.map((item) => (
            <li key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <span>{formatPrice(item.price)}</span>
              </div>
              <div className="cart-controls">
                <button type="button" onClick={() => onDecreaseQuantity(item.id)}>
                  -
                </button>
                <span>{item.quantity}</span>
                <button type="button" onClick={() => onIncreaseQuantity(item.id)}>
                  +
                </button>
                <button type="button" onClick={() => onRemoveFromCart(item.id)}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default CartPanel
