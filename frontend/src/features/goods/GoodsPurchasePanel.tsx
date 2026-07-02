import { useEffect, useRef, useState } from 'react'
import type { GoodsDetail } from '../../api/goods'
import { useCart } from '../cart/useCart'
import { formatGoodsPrice } from './goodsFormatters'
import GoodsRatingSummary from './GoodsRatingSummary'
import GoodsStatusBadge from './GoodsStatusBadge'

type GoodsPurchasePanelProps = {
  goods: GoodsDetail
  onReviewClick?: () => void
  isLiked?: boolean
  isLikePending?: boolean
  likeFeedback?: string
  onLikeToggle?: () => void
  shareFeedback?: string
  onShare?: () => void
}

function GoodsPurchasePanel({
  goods,
  onReviewClick,
  isLiked = false,
  isLikePending = false,
  likeFeedback = '',
  onLikeToggle,
  shareFeedback = '',
  onShare,
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

  function updateQuantity(nextQuantity: number) {
    if (!Number.isFinite(nextQuantity)) return
    setQuantity(Math.max(1, Math.min(Math.trunc(nextQuantity), maxQuantity || 1)))
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
        <GoodsStatusBadge salesStatus={goods.salesStatus} isBestSeller={goods.isBestSeller} />
        <p>{goods.artistName ?? 'Project Cyan'}</p>
        <h2>{goods.name}</h2>
        <div className="purchase-rating-row">
          <GoodsRatingSummary
            averageRating={goods.averageRating}
            reviewCount={goods.reviewCount}
          />
          <button className="purchase-review-link" type="button" onClick={onReviewClick}>
            리뷰 보기
          </button>
        </div>
        <strong>{formatGoodsPrice(unitPrice)}</strong>
      </div>

      <div className="purchase-selection">
        <span>수량</span>
        <div className="detail-quantity" aria-label="수량">
          <button
            disabled={selectedQuantity <= 1}
            type="button"
            onClick={() => updateQuantity(selectedQuantity - 1)}
          >
            −
          </button>
          <input
            aria-label="수량 직접 입력"
            disabled={!canAdd}
            inputMode="numeric"
            max={maxQuantity || 1}
            min={1}
            type="number"
            value={selectedQuantity}
            onChange={(event) => updateQuantity(event.currentTarget.valueAsNumber)}
          />
          <button
            disabled={!maxQuantity || selectedQuantity >= maxQuantity}
            type="button"
            onClick={() => updateQuantity(selectedQuantity + 1)}
          >
            +
          </button>
        </div>
        <small>재고 {maxQuantity.toLocaleString()}개</small>
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
      <div className="purchase-secondary-actions">
        <button
          className="detail-like-button"
          type="button"
          aria-label={isLiked ? `${goods.name} 좋아요 취소` : `${goods.name} 좋아요`}
          aria-pressed={isLiked}
          disabled={isLikePending}
          onClick={onLikeToggle}
        >
          <span
            className="favorite-heart-icon"
            data-filled={isLiked}
            aria-hidden="true"
          />
          <span>좋아요</span>
          <span>{Number(goods.likeCount ?? 0).toLocaleString()}</span>
        </button>
        <button className="purchase-share-button" type="button" onClick={onShare}>
          <span aria-hidden="true">↗</span>
          <span>{shareFeedback || '공유하기'}</span>
        </button>
      </div>
      {likeFeedback && <span className="detail-like-feedback" role="status">{likeFeedback}</span>}
      {feedback && <span className="purchase-feedback" role="status">{feedback}</span>}
      <ul className="purchase-help-list" aria-label="구매 안내">
        <li>결제 금액별 1% 적립</li>
        <li>평균 배송 2~3일</li>
      </ul>
    </aside>
  )
}

export default GoodsPurchasePanel
