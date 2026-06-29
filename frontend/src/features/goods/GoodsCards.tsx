import { type MouseEvent, useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import type { GoodsSummary } from '../../api/goods'
import { useCart } from '../cart/useCart'
import GoodsImage from './GoodsImage'
import GoodsRatingSummary from './GoodsRatingSummary'
import GoodsStatusBadge from './GoodsStatusBadge'

export type GoodsViewMode = 'grid' | 'list'

type GoodsCardsProps = {
  items: GoodsSummary[]
  viewMode: GoodsViewMode
  isFavorite: (goodsId: number) => boolean
  toggleFavorite: (goodsId: number) => void | Promise<void>
  onOpenDetail: (event: MouseEvent<HTMLAnchorElement>, goodsId: number) => void
}

function GoodsCards({
  items,
  viewMode,
  isFavorite,
  toggleFavorite,
  onOpenDetail,
}: GoodsCardsProps) {
  const { addCartItem } = useCart()
  const [addingGoodsId, setAddingGoodsId] = useState<number | null>(null)
  const openDetail = useCallback(
    (goodsId: number) => (event: MouseEvent<HTMLAnchorElement>) => onOpenDetail(event, goodsId),
    [onOpenDetail],
  )

  async function handleAddCart(item: GoodsSummary) {
    setAddingGoodsId(item.goodsId)
    try {
      await addCartItem({
        goodsId: item.goodsId,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
        artistName: item.artistName,
        categoryName: item.categoryName,
        tags: item.tags,
        shippingFee: 0,
      })
    } finally {
      setAddingGoodsId(null)
    }
  }

  return (
    <div className={`goods-grid goods-${viewMode}`}>
      {items.map((item) => {
        const tags = item.tags ?? []
        const hasReviews = Number(item.reviewCount ?? 0) > 0

        return (
          <article className="goods-card" data-goods-id={item.goodsId} key={item.goodsId}>
            <Link
              className="goods-image goods-detail-link"
              aria-label={`${item.name} 상세 보기`}
              to={`/goods/${item.goodsId}`}
              onClick={openDetail(item.goodsId)}
            >
              <GoodsImage src={item.imageUrl} alt={item.name} fallbackLabel={item.categoryName} />
            </Link>
            <div className="goods-card-body">
              <div className="card-topline">
                <span>{item.artistName ?? 'SM Artist'}</span>
                <GoodsStatusBadge salesStatus={item.salesStatus} isBestSeller={item.isBestSeller} />
              </div>
              <h3>
                <Link
                  className="goods-name-link"
                  to={`/goods/${item.goodsId}`}
                  onClick={openDetail(item.goodsId)}
                >
                  {item.name}
                </Link>
              </h3>
              <p>{item.categoryName ?? 'Goods'}</p>
              <div className="tag-row" data-empty={tags.length === 0}>
                {tags.map((tag) => <span key={tag}>{tag}</span>)}
              </div>
              <div className="card-footer">
                <strong>KRW {Number(item.price ?? 0).toLocaleString()}</strong>
                {hasReviews && (
                  <GoodsRatingSummary
                    averageRating={item.averageRating}
                    reviewCount={item.reviewCount}
                    compact
                  />
                )}
                <div className="card-footer-actions">
                  <button
                    className="card-action"
                    type="button"
                    disabled={addingGoodsId === item.goodsId}
                    onClick={() => void handleAddCart(item)}
                  >
                    {addingGoodsId === item.goodsId ? 'Adding' : 'Cart'}
                  </button>
                  <Link
                    className="card-action"
                    to={`/goods/${item.goodsId}`}
                    onClick={openDetail(item.goodsId)}
                  >
                    View
                  </Link>
                  <button
                    className="favorite-button"
                    type="button"
                    aria-label={isFavorite(item.goodsId) ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`}
                    aria-pressed={isFavorite(item.goodsId)}
                    onClick={() => toggleFavorite(item.goodsId)}
                  >
                    <span aria-hidden="true">{isFavorite(item.goodsId) ? '♥' : '♡'}</span>
                  </button>
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
