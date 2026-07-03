import { Link } from 'react-router-dom'
import type { GoodsDetail } from '../../api/goods'
import type { DigitalLibraryItem } from '../../api/digitalLibrary'
import Button from '../../shared/components/Button'
import QuantityStepper from '../../shared/components/QuantityStepper'
import { formatGoodsPrice } from './goodsFormatters'
import GoodsRatingSummary from './GoodsRatingSummary'
import GoodsStatusBadge from './GoodsStatusBadge'
import { useGoodsPurchaseCart } from './useGoodsPurchaseCart'

type GoodsPurchasePanelProps = {
  goods: GoodsDetail
  onReviewClick?: () => void
  isLiked?: boolean
  isLikePending?: boolean
  likeFeedback?: string
  onLikeToggle?: () => void
  shareFeedback?: string
  onShare?: () => void
  digitalEntitlement?: DigitalLibraryItem | null
  digitalClaimFeedback?: string
  isClaimingFreeDigitalGoods?: boolean
  onFreeDigitalClaim?: () => void
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
  digitalEntitlement = null,
  digitalClaimFeedback = '',
  isClaimingFreeDigitalGoods = false,
  onFreeDigitalClaim,
}: GoodsPurchasePanelProps) {
  const isDigitalGoods = goods.fulfillmentType === 'DIGITAL'
  const isFreeDigitalGoods = isDigitalGoods && Number(goods.price ?? 0) === 0
  const isPurchasedDigitalGoods = isDigitalGoods && Boolean(digitalEntitlement)
  const {
    addSelectedQuantityToCart,
    canAdd,
    feedback,
    isAddingCart,
    maxQuantity,
    selectedQuantity,
    unitPrice,
    updateQuantity,
  } = useGoodsPurchaseCart(goods)

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

      {isDigitalGoods && (
        <p className="purchase-digital-notice">
          디지털 상품입니다. 구매 후 30일마다 1회씩 마이페이지에서 다운로드 할 수 있습니다.
        </p>
      )}

      {isPurchasedDigitalGoods ? (
        <div className="purchase-owned-digital">
          <span>구매 완료</span>
          <p>배송 없이 마이페이지의 디지털 제품 저장소에서 다운로드할 수 있습니다.</p>
          <Link className="purchase-button purchase-download-link" to={`/mypage/digital-library?goodsId=${goods.goodsId}`}>
            구매완료(다운로드)
          </Link>
        </div>
      ) : (
        <>
          <div className="purchase-selection">
            <span>수량</span>
            <QuantityStepper
              disabled={!canAdd || isDigitalGoods}
              editable
              max={isDigitalGoods ? 1 : maxQuantity || 1}
              value={isDigitalGoods ? 1 : selectedQuantity}
              onChange={updateQuantity}
            />
            <small>{isDigitalGoods ? '디지털 상품은 1개만 구매 가능' : `재고 ${maxQuantity.toLocaleString()}개`}</small>
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
          {isFreeDigitalGoods ? (
            <button
              className="purchase-button"
              data-claim-free-digital={goods.goodsId}
              disabled={!canAdd || isClaimingFreeDigitalGoods}
              type="button"
              onClick={onFreeDigitalClaim}
            >
              {isClaimingFreeDigitalGoods ? '구매 처리 중...' : '구매하기'}
            </button>
          ) : (
            <Button
              className="purchase-button"
              data-add-to-cart={goods.goodsId}
              disabled={!canAdd || isAddingCart}
              fullWidth
              size="large"
              variant="primary"
              onClick={() => void addSelectedQuantityToCart()}
            >
              {isAddingCart ? '담는 중...' : isDigitalGoods ? '디지털 굿즈 담기' : '카트에 담기'}
            </Button>
          )}
        </>
      )}
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
      {digitalClaimFeedback && <span className="purchase-feedback" role="status">{digitalClaimFeedback}</span>}
      {feedback && <span className="purchase-feedback" role="status">{feedback}</span>}
      <ul className="purchase-help-list" aria-label="구매 안내">
        <li>결제 금액별 1% 적립</li>
        <li>{isDigitalGoods ? '실물 배송이 없는 상품' : '평균 배송 2~3일'}</li>
      </ul>
    </aside>
  )
}

export default GoodsPurchasePanel
