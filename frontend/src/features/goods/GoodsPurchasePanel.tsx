import { useEffect, useRef, useState } from 'react'
import type { GoodsDetail } from '../../api/goods'
import { useCart } from '../cart/useCart'
import { formatGoodsPrice } from './goodsFormatters'
import GoodsRatingSummary from './GoodsRatingSummary'

const PURCHASE_STATE_LABELS: Record<string, string> = {
  AVAILABLE: '판매 중',
  UPCOMING: '판매 예정',
  ENDED: '판매 종료',
  SOLD_OUT: '품절',
  UNAVAILABLE: '구매 불가',
}

function GoodsPurchasePanel({ goods, onReviewClick }: { goods: GoodsDetail; onReviewClick?: () => void }) {
  const { addCartItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [feedback, setFeedback] = useState('')
  const feedbackTimerRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (feedbackTimerRef.current !== null) window.clearTimeout(feedbackTimerRef.current)
    },
    [],
  )

  const maxQuantity = goods.stockCount ?? 0
  const selectedQuantity = Math.max(1, Math.min(quantity, maxQuantity || 1))
  const purchasingAvailable = goods.purchaseState === 'AVAILABLE'
  const canAdd = purchasingAvailable && maxQuantity > 0
  const unitPrice = Number(goods.price ?? 0)

  function showFeedback(message: string) {
    setFeedback(message)
    if (feedbackTimerRef.current !== null) window.clearTimeout(feedbackTimerRef.current)
    feedbackTimerRef.current = window.setTimeout(() => setFeedback(''), 1800)
  }

  function handleAddCartItem() {
    if (!canAdd) return

    addCartItem(
      {
        ...goods,
        variantPrice: unitPrice,
        maxQuantity,
        shippingFee: 0,
      },
      selectedQuantity,
    )
    showFeedback('장바구니에 담았습니다.')
  }

  return (
    <aside className="purchase-panel">
      <div className="purchase-heading">
        <span className={`purchase-state state-${goods.purchaseState?.toLowerCase()}`}>
          {PURCHASE_STATE_LABELS[goods.purchaseState ?? ''] ?? goods.salesStatus ?? '판매 정보'}
        </span>
        <p>{goods.artistName ?? 'Project Cyan'}</p>
        <h2>{goods.name}</h2>
        <GoodsRatingSummary
          averageRating={goods.averageRating}
          reviewCount={goods.reviewCount}
          onClick={onReviewClick}
        />
        <strong>{formatGoodsPrice(unitPrice)}</strong>
      </div>

      <div className="purchase-selection">
        <span>재고 {maxQuantity}개</span>
        <div className="detail-quantity" aria-label="수량">
          <button
            disabled={selectedQuantity <= 1}
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
          >
            −
          </button>
          <span>{selectedQuantity}</span>
          <button
            disabled={!maxQuantity || selectedQuantity >= maxQuantity}
            type="button"
            onClick={() => setQuantity((value) => value + 1)}
          >
            ＋
          </button>
        </div>
      </div>

      <div className="purchase-total">
        <span>총 상품 금액</span>
        <strong>{formatGoodsPrice(unitPrice * selectedQuantity)}</strong>
      </div>

      {!canAdd && (
        <p className="purchase-message">
          {goods.purchaseMessage || '구매 가능한 옵션을 선택해 주세요.'}
        </p>
      )}
      <button
        className="purchase-button"
        data-add-to-cart={goods.goodsId}
        disabled={!canAdd}
        type="button"
        onClick={handleAddCartItem}
      >
        장바구니 담기
      </button>
      {feedback && <span className="purchase-feedback" role="status">{feedback}</span>}
    </aside>
  )
}

export default GoodsPurchasePanel
