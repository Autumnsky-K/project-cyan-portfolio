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

type GoodsPurchasePanelProps = {
  goods: GoodsDetail
  onReviewClick?: () => void
  isLiked?: boolean
  isLikePending?: boolean
  likeFeedback?: string
  onLikeToggle?: () => void
}

function GoodsPurchasePanel({
  goods,
  onReviewClick,
  isLiked = false,
  isLikePending = false,
  likeFeedback = '',
  onLikeToggle,
}: GoodsPurchasePanelProps) {
  const { addCartItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [feedback, setFeedback] = useState('')
  const [isAddingCart, setIsAddingCart] = useState(false)
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

  async function handleAddCartItem() {
    if (!canAdd) return

    setIsAddingCart(true)
    try {
      await addCartItem(
        {
          ...goods,
          variantPrice: unitPrice,
          maxQuantity,
          shippingFee: 0,
        },
        selectedQuantity,
      )
      showFeedback('장바구니에 담았습니다.')
    } catch (cartError) {
      showFeedback(cartError instanceof Error ? cartError.message : '장바구니에 담지 못했습니다.')
    } finally {
      setIsAddingCart(false)
    }
  }

  return (
    <aside className="purchase-panel">
      <div className="purchase-heading">
        <div className="purchase-heading-top">
          <span className={`purchase-state state-${goods.purchaseState?.toLowerCase()}`}>
            {PURCHASE_STATE_LABELS[goods.purchaseState ?? ''] ?? goods.salesStatus ?? '판매 정보'}
          </span>
        </div>
        <p>{goods.artistName ?? 'Project Cyan'}</p>
        <h2>{goods.name}</h2>
        <div className="detail-social-row">
          <GoodsRatingSummary
            averageRating={goods.averageRating}
            reviewCount={goods.reviewCount}
            onClick={onReviewClick}
          />
          <button
            className="detail-like-button"
            type="button"
            aria-label={isLiked ? `${goods.name} 좋아요 취소` : `${goods.name} 좋아요`}
            aria-pressed={isLiked}
            disabled={isLikePending}
            onClick={onLikeToggle}
          >
            <span aria-hidden="true">♥</span>
            <span>{Number(goods.likeCount ?? 0).toLocaleString()}</span>
          </button>
          {likeFeedback && <span className="detail-like-feedback" role="status">{likeFeedback}</span>}
        </div>
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
            +
          </button>
        </div>
      </div>

      <div className="purchase-total">
        <span>총 상품 금액</span>
        <strong>{formatGoodsPrice(unitPrice * selectedQuantity)}</strong>
      </div>

      {!canAdd && (
        <p className="purchase-message">
          {goods.purchaseMessage || '구매 가능한 상품이 아닙니다.'}
        </p>
      )}
      <button
        className="purchase-button"
        data-add-to-cart={goods.goodsId}
        disabled={!canAdd || isAddingCart}
        type="button"
        onClick={() => void handleAddCartItem()}
      >
        {isAddingCart ? '담는 중...' : '장바구니 담기'}
      </button>
      {feedback && <span className="purchase-feedback" role="status">{feedback}</span>}
    </aside>
  )
}

export default GoodsPurchasePanel
