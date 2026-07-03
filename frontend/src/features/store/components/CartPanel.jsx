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
          상품 {totalQuantity}개 / {formatPrice(totalPrice)}
        </p>
      </div>
      {cartStatus === 'loading' ? (
        <p>카트를 불러오는 중입니다...</p>
      ) : cartStatus === 'error' ? (
        <p>{cartError || '카트를 불러오지 못했습니다.'}</p>
      ) : isCartEmpty ? (
        <p>카트가 비어 있습니다.</p>
      ) : (
        <ul className="cart-list">
          {cartItems.map((item) => {
            const cartItemKey = item.cartItemKey ?? item.id
            const imageUrl = item.image ?? item.imageUrl ?? ''

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
                    label={`${item.name} 수량`}
                    max={item.maxQuantity ?? null}
                    value={item.quantity}
                    onChange={(nextQuantity) => {
                      if (nextQuantity < item.quantity) onDecreaseQuantity(cartItemKey)
                      if (nextQuantity > item.quantity) onIncreaseQuantity(cartItemKey)
                    }}
                  />
                  <button type="button" onClick={() => onRemoveFromCart(cartItemKey)}>
                    삭제
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
