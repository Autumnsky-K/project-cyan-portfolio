import { Link } from 'react-router-dom'

import { useCart } from './useCart'
import './cart-nav.css'

type CartNavLinkProps = {
  current?: boolean
  label?: string
  onClick?: () => void
}

function formatPrice(value: number) {
  return `KRW ${Number(value ?? 0).toLocaleString()}`
}

function CartNavLink({ current = false, label = 'Cart', onClick }: CartNavLinkProps) {
  const { isAuthenticated, items } = useCart()
  const previewItems = items.slice(0, 3)
  const hiddenItemCount = Math.max(items.length - previewItems.length, 0)
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)

  return (
    <span className="cart-nav">
      <Link
        aria-current={current ? 'page' : undefined}
        className="cart-nav-link"
        to="/cart"
        onClick={onClick}
      >
        {label}{items.length > 0 ? ` ${items.length}` : ''}
      </Link>
      <span className="cart-preview" role="status">
        <strong>{isAuthenticated ? '카트' : '비회원 카트'}</strong>
        {items.length === 0 ? (
          <span className="cart-preview-empty">카트가 비어 있습니다</span>
        ) : (
          <>
            <span className="cart-preview-list">
              {previewItems.map((item) => (
                <span className="cart-preview-item" key={item.cartItemKey}>
                  <span>{item.name}</span>
                  <span>x {item.quantity}</span>
                </span>
              ))}
              {hiddenItemCount > 0 && <span className="cart-preview-more">외 {hiddenItemCount}개</span>}
            </span>
            <span className="cart-preview-total">
              <span>합계</span>
              <strong>{formatPrice(subtotal)}</strong>
            </span>
          </>
        )}
      </span>
    </span>
  )
}

export default CartNavLink
