import { Link } from 'react-router-dom'
import { useCart } from './useCart'
import './cart.css'

function formatPrice(value: number) {
  return `KRW ${Number(value ?? 0).toLocaleString()}`
}

function CartPage() {
  const { items, updateCartItemQuantity, removeCartItem, clearCart } = useCart()
  const itemCount = items.reduce((total, item) => total + item.quantity, 0)
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)
  const shippingFee = items.reduce((maximum, item) => Math.max(maximum, item.shippingFee), 0)
  const total = subtotal + shippingFee

  return (
    <main className="cart-page">
      <header className="store-header">
        <div>
          <p className="eyebrow">SM Universe Store</p>
          <h1>Cart</h1>
        </div>
        <nav className="store-nav" aria-label="Store navigation">
          <Link to="/artists">Artists</Link>
          <Link to="/goods">Goods</Link>
          <span aria-hidden="true" className="store-nav-spacer">
            Cart
          </span>
        </nav>
      </header>

      <section className="cart-layout">
        <div className="cart-items" aria-label="Cart items">
          <div className="cart-heading">
            <div>
              <h2>Selected Goods</h2>
              <p>{itemCount === 0 ? 'No items selected' : `${itemCount} item${itemCount > 1 ? 's' : ''} in cart`}</p>
            </div>
            {items.length > 0 && (
              <button type="button" onClick={clearCart}>
                Clear
              </button>
            )}
          </div>

          {items.length === 0 && (
            <div className="cart-empty">
              <strong>Your cart is empty</strong>
              <span>Add goods from the store to review them here.</span>
              <Link className="cart-action" to="/goods">
                Browse Goods
              </Link>
            </div>
          )}

          {items.map((item) => (
            <article className="cart-item" key={item.cartItemKey}>
              <div className="cart-item-image" aria-label={`${item.name} image`}>
                {item.imageUrl ? <img src={item.imageUrl} alt="" /> : <span>{item.categoryName}</span>}
              </div>

              <div className="cart-item-main">
                <div>
                  <p>{item.artistName}</p>
                  <h2>{item.name}</h2>
                </div>
                <div className="cart-item-tags">
                  <span>{item.categoryName}</span>
                  {item.variantLabel && <span>{item.variantLabel}</span>}
                  {item.tags.slice(0, 2).map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>

              <div className="quantity-control" aria-label={`${item.name} quantity`}>
                <button
                  type="button"
                  onClick={() => updateCartItemQuantity(item.cartItemKey, item.quantity - 1)}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  type="button"
                  disabled={item.maxQuantity !== null && item.quantity >= item.maxQuantity}
                  onClick={() => updateCartItemQuantity(item.cartItemKey, item.quantity + 1)}
                >
                  +
                </button>
              </div>

              <div className="cart-item-price">
                <strong>{formatPrice(item.price * item.quantity)}</strong>
                <button type="button" onClick={() => removeCartItem(item.cartItemKey)}>
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>

        <aside className="cart-summary" aria-label="Cart summary">
          <h2>Summary</h2>
          <dl>
            <div>
              <dt>Items</dt>
              <dd>{itemCount}</dd>
            </div>
            <div>
              <dt>Subtotal</dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>
            <div>
              <dt>Shipping</dt>
              <dd>{formatPrice(shippingFee)}</dd>
            </div>
            <div className="summary-total">
              <dt>Total</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
          </dl>
          <button type="button" disabled>
            Checkout
          </button>
          <p>Checkout will be connected in the order step.</p>
        </aside>
      </section>
    </main>
  )
}

export default CartPage
