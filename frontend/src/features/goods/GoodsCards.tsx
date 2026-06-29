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

  function handleFavoriteClick(event: MouseEvent<HTMLButtonElement>, goodsId: number) {
    event.preventDefault()
    event.stopPropagation()
    void toggleFavorite(goodsId)
  }

  async function handleAddCartClick(event: MouseEvent<HTMLButtonElement>, item: GoodsSummary) {
    event.preventDefault()
    event.stopPropagation()
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
        const favoriteCount = Number(item.favoriteCount ?? 0)

        return (
          <article className="goods-card" data-goods-id={item.goodsId} key={item.goodsId}>
            <Link
              className="goods-card-link-overlay"
              aria-label={`${item.name} 상세 보기`}
              to={`/goods/${item.goodsId}`}
              onClick={openDetail(item.goodsId)}
            />
            <div className="goods-image goods-detail-link">
              <GoodsImage src={item.imageUrl} alt="" fallbackLabel={item.categoryName} />
              <button
                className="favorite-button"
                type="button"
                aria-label={isFavorite(item.goodsId) ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`}
                aria-pressed={isFavorite(item.goodsId)}
                onClick={(event) => handleFavoriteClick(event, item.goodsId)}
              >
                <span aria-hidden="true">{isFavorite(item.goodsId) ? '♥' : '♡'}</span>
              </button>
            </div>
            <div className="goods-card-body">
              <div className="card-topline">
                <span>{item.artistName ?? 'SM Artist'}</span>
                <GoodsStatusBadge salesStatus={item.salesStatus} isBestSeller={item.isBestSeller} />
              </div>
              <h3>
                {item.name}
              </h3>
              <p>{item.categoryName ?? 'Goods'}</p>
              <div className="card-footer">
                <strong>KRW {Number(item.price ?? 0).toLocaleString()}</strong>
                <div className="card-meta-row">
                  {hasReviews && (
                    <GoodsRatingSummary
                      averageRating={item.averageRating}
                      reviewCount={item.reviewCount}
                      compact
                    />
                  )}
                  <span className="favorite-summary" aria-label={`${favoriteCount.toLocaleString()}명이 찜한 상품`}>
                    <span aria-hidden="true">♥</span>
                    {favoriteCount.toLocaleString()}
                  </span>
                  <button
                    className="card-cart-temp-button"
                    type="button"
                    disabled={addingGoodsId === item.goodsId}
                    onClick={(event) => void handleAddCartClick(event, item)}
                  >
                    {addingGoodsId === item.goodsId ? '담는 중' : '담기(삭제예정)'}
                  </button>
                </div>
              </div>
              <div className="tag-row" data-empty={tags.length === 0}>
                {tags.map((tag) => <span key={tag}>{tag}</span>)}
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}

export default GoodsCards
