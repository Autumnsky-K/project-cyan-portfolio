import { Link } from 'react-router-dom'
import AsyncState from '../../shared/components/AsyncState'
import QuantityStepper from '../../shared/components/QuantityStepper'
import { useCart } from './useCart'
import './goods-cart-side-panel.css'

function formatCartPrice(value: number): string {
  return `${Number(value ?? 0).toLocaleString('ko-KR')} KRW`
}

function GoodsCartSidePanel() {
  const {
    clearCart,
    error,
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
        <AsyncState kind="loading" size="compact" title="Loading cart..." />
      ) : status === 'error' ? (
        <AsyncState kind="error" size="compact" title={error || 'Unable to load cart.'} />
      ) : isEmpty ? (
        <AsyncState kind="empty" size="compact" title="Your cart is empty." />
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
                  <QuantityStepper
                    label={`${item.name} 수량`}
                    max={item.maxQuantity}
                    value={item.quantity}
                    onChange={(nextQuantity) => void updateCartItemQuantity(item.cartItemKey, nextQuantity)}
                  />
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
          View cart
        </Link>
      </div>
    </aside>
  )
}

export default GoodsCartSidePanel
