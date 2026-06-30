import { type MouseEvent, useCallback } from 'react'
import { Link } from 'react-router-dom'
import type { GoodsSummary } from '../../api/goods'
import GoodsImage from './GoodsImage'
import GoodsRatingSummary from './GoodsRatingSummary'
import GoodsStatusBadge from './GoodsStatusBadge'
import { formatGoodsPrice } from './goodsFormatters'

export type GoodsViewMode = 'grid' | 'list'

type GoodsCardsProps = {
  items: GoodsSummary[]
  viewMode: GoodsViewMode
  isLiked: (goodsId: number) => boolean
  isLikePending: (goodsId: number) => boolean
  toggleLike: (item: GoodsSummary) => void | Promise<void>
  onOpenDetail: (event: MouseEvent<HTMLAnchorElement>, goodsId: number) => void
}

function GoodsCards({
  items,
  viewMode,
  isLiked,
  isLikePending,
  toggleLike,
  onOpenDetail,
}: GoodsCardsProps) {
  const openDetail = useCallback(
    (goodsId: number) => (event: MouseEvent<HTMLAnchorElement>) => onOpenDetail(event, goodsId),
    [onOpenDetail],
  )

  function handleLikeClick(event: MouseEvent<HTMLButtonElement>, item: GoodsSummary) {
    event.preventDefault()
    event.stopPropagation()
    void toggleLike(item)
  }

  return (
    <div className={`goods-grid goods-${viewMode}`}>
      {items.map((item) => {
        const hasReviews = Number(item.reviewCount ?? 0) > 0
        const likeCount = Number(item.likeCount ?? 0)
        const liked = isLiked(item.goodsId)
        const likePending = isLikePending(item.goodsId)

        return (
          <article className="goods-card" data-goods-id={item.goodsId} key={item.goodsId}>
            <Link
              className="goods-card-link-overlay"
              aria-label={`View details for ${item.name}`}
              to={`/goods/${item.goodsId}`}
              onClick={openDetail(item.goodsId)}
            />
            <div className="goods-image goods-detail-link">
              <GoodsImage src={item.imageUrl} alt="" fallbackLabel={item.categoryName} />
              <GoodsStatusBadge salesStatus={item.salesStatus} isBestSeller={item.isBestSeller} />
              <button
                className="favorite-button"
                type="button"
                aria-label={liked ? `Unlike ${item.name}` : `Like ${item.name}`}
                aria-pressed={liked}
                disabled={likePending}
                onClick={(event) => handleLikeClick(event, item)}
              >
                <span
                  className="favorite-heart-icon"
                  data-filled={liked}
                  aria-hidden="true"
                />
              </button>
            </div>
            <div className="goods-card-body">
              <div className="card-topline">
                <span>{item.artistName ?? 'SM Artist'}</span>
              </div>
              <h3>{item.name}</h3>
              <div className="card-footer">
                <strong>{formatGoodsPrice(Number(item.price ?? 0))}</strong>
                <div className="card-meta-row">
                  {hasReviews && (
                    <GoodsRatingSummary
                      averageRating={item.averageRating}
                      reviewCount={item.reviewCount}
                      compact
                    />
                  )}
                  <span className="like-summary" aria-label={`${likeCount.toLocaleString()} likes`}>
                    <span aria-hidden="true">♥</span>
                    {likeCount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}

export default GoodsCards
