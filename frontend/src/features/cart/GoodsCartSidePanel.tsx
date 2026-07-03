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
    <aside className="goods-cart-side-panel" aria-label="카트">
      <div className="goods-cart-panel-heading">
        <div>
          <span>Cart</span>
          <strong>{totalQuantity}</strong>
        </div>
        {!isEmpty && (
          <button type="button" onClick={() => void clearCart()}>
            비우기
          </button>
        )}
      </div>

      {status === 'loading' ? (
        <AsyncState kind="loading" size="compact" title="카트를 불러오는 중입니다..." />
      ) : status === 'error' ? (
        <AsyncState kind="error" size="compact" title={error || '카트를 불러오지 못했습니다.'} />
      ) : isEmpty ? (
        <AsyncState kind="empty" size="compact" title="카트가 비어 있습니다." />
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
                    삭제
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="goods-cart-panel-footer">
        <div>
          <span>합계</span>
          <strong>{formatCartPrice(totalPrice)}</strong>
        </div>
        <Link className="goods-cart-panel-checkout" aria-disabled={isEmpty} to="/cart">
          카트 보기
        </Link>
      </div>
    </aside>
  )
}

export default GoodsCartSidePanel
