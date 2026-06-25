import { Link } from 'react-router-dom'
import { useCart } from './useCart'
import './goods-cart-side-panel.css'

function formatCartPrice(value: number): string {
  return `${Number(value ?? 0).toLocaleString('ko-KR')} KRW`
}

function GoodsCartSidePanel() {
  const {
    clearCart,
    error,
    isSignedIn,
    items,
    removeCartItem,
    status,
    updateCartItemQuantity,
  } = useCart()

  const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity ?? 0), 0)
  const totalPrice = items.reduce((sum, item) => sum + Number(item.price ?? 0) * Number(item.quantity ?? 0), 0)
  const isEmpty = items.length === 0

  return (
    <aside className="goods-cart-side-panel" aria-label="Cart">
      <div className="goods-cart-panel-heading">
        <div>
          <span>Cart</span>
          <strong>{totalQuantity}</strong>
        </div>
        {!isEmpty && (
          <button type="button" onClick={() => void clearCart()}>
            Clear
          </button>
        )}
      </div>

      {status === 'loading' ? (
        <p className="goods-cart-panel-state">Loading cart...</p>
      ) : status === 'error' ? (
        <p className="goods-cart-panel-state">{error || 'Unable to load cart.'}</p>
      ) : isEmpty ? (
        <p className="goods-cart-panel-state">Your cart is empty.</p>
      ) : (
        <ul className="goods-cart-panel-list">
          {items.map((item) => (
            <li key={item.cartItemKey}>
              <div className="goods-cart-panel-image" aria-hidden="true">
                {item.imageUrl ? <img src={item.imageUrl} alt="" /> : <span>{item.categoryName}</span>}
              </div>
              <div className="goods-cart-panel-item">
                <strong>{item.name}</strong>
                <span>{formatCartPrice(item.price)}</span>
                <div className="goods-cart-panel-controls">
                  <button
                    type="button"
                    disabled={item.quantity <= 1}
                    onClick={() => void updateCartItemQuantity(item.cartItemKey, item.quantity - 1)}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    disabled={item.maxQuantity !== null && item.quantity >= item.maxQuantity}
                    onClick={() => void updateCartItemQuantity(item.cartItemKey, item.quantity + 1)}
                  >
                    +
                  </button>
                  <button type="button" onClick={() => void removeCartItem(item.cartItemKey)}>
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="goods-cart-panel-footer">
        <div>
          <span>Total</span>
          <strong>{formatCartPrice(totalPrice)}</strong>
        </div>
        <Link className="goods-cart-panel-checkout" aria-disabled={isEmpty} to="/cart">
          {isSignedIn ? 'Checkout' : 'Sign in to checkout'}
        </Link>
      </div>
    </aside>
  )
}

export default GoodsCartSidePanel
