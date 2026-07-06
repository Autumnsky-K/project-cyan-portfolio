import { type CSSProperties, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AsyncState from '../../shared/components/AsyncState'
import QuantityStepper from '../../shared/components/QuantityStepper'
import { useCart } from './useCart'
import './goods-cart-side-panel.css'

const CART_PANEL_DEFAULT_TOP_PX = 96
const CART_PANEL_CONTROL_GAP_PX = 16
const VTUBER_CONTROLS_SELECTOR = '.vtuber-controls'

function formatCartPrice(value: number): string {
  return `${Number(value ?? 0).toLocaleString('ko-KR')} KRW`
}

function formatCompactCartPrice(value: number): string {
  return String(Number(value ?? 0))
}

function GoodsCartSidePanel() {
  const [panelTopOffset, setPanelTopOffset] = useState(CART_PANEL_DEFAULT_TOP_PX)
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
  const panelStyle = {
    '--cart-panel-top': `${panelTopOffset}px`,
  } as CSSProperties

  useEffect(() => {
    let animationFrameId: number | null = null
    let mutationObserver: MutationObserver | null = null

    function updatePanelTopOffset() {
      const controlsElement = document.querySelector<HTMLElement>(VTUBER_CONTROLS_SELECTOR)

      if (!controlsElement) {
        setPanelTopOffset(CART_PANEL_DEFAULT_TOP_PX)
        return
      }

      const controlsRect = controlsElement.getBoundingClientRect()
      const controlsStyle = window.getComputedStyle(controlsElement)
      const isControlsVisible =
        controlsRect.width > 0 &&
        controlsRect.height > 0 &&
        controlsStyle.display !== 'none' &&
        controlsStyle.visibility !== 'hidden'

      setPanelTopOffset(
        isControlsVisible
          ? Math.round(Math.max(
              CART_PANEL_DEFAULT_TOP_PX,
              controlsRect.bottom + CART_PANEL_CONTROL_GAP_PX,
            ))
          : CART_PANEL_DEFAULT_TOP_PX,
      )
    }

    function schedulePanelTopOffsetUpdate() {
      if (animationFrameId !== null) {
        return
      }

      animationFrameId = window.requestAnimationFrame(() => {
        animationFrameId = null
        updatePanelTopOffset()
      })
    }

    schedulePanelTopOffsetUpdate()

    mutationObserver = new MutationObserver(schedulePanelTopOffsetUpdate)
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    })

    window.addEventListener('resize', schedulePanelTopOffsetUpdate)
    window.addEventListener('scroll', schedulePanelTopOffsetUpdate, { passive: true })

    return () => {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId)
      }

      mutationObserver?.disconnect()
      window.removeEventListener('resize', schedulePanelTopOffsetUpdate)
      window.removeEventListener('scroll', schedulePanelTopOffsetUpdate)
    }
  }, [])

  return (
    <aside className="goods-cart-side-panel" aria-label="카트" style={panelStyle}>
      <Link
        className="goods-cart-panel-compact-summary"
        to="/cart"
        aria-label={`Cart ${totalQuantity}, ${formatCompactCartPrice(totalPrice)}`}
      >
        <span className="goods-cart-panel-compact-heading">
          <span className="goods-cart-panel-compact-icon" aria-hidden="true" />
          <strong>{totalQuantity}</strong>
        </span>
        <span className="goods-cart-panel-compact-price">
          {formatCompactCartPrice(totalPrice)}
        </span>
      </Link>

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
