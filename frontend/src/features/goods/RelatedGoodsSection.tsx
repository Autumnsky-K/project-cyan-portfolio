import { type MouseEvent, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { GoodsSummary } from '../../api/goods'
import { formatGoodsPrice } from './goodsFormatters'
import GoodsImage from './GoodsImage'
import GoodsStatusBadge from './GoodsStatusBadge'
import GoodsRatingSummary from './GoodsRatingSummary'

function RelatedGoodsSection({ goods }: { goods: GoodsSummary[] }) {
  const navigate = useNavigate()

  const openRelatedGoods = useCallback((event: MouseEvent<HTMLAnchorElement>, goodsId: number) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

    event.preventDefault()
    const currentUrl = new URL(window.location.href)
    currentUrl.searchParams.set('_detailScroll', String(Math.round(window.scrollY)))
    window.history.replaceState(
      window.history.state,
      '',
      `${currentUrl.pathname}${currentUrl.search}`,
    )
    navigate(`/goods/${goodsId}`)
  }, [navigate])

  if (goods.length === 0) return null

  return (
    <section className="related-section">
      <div>
        <p className="eyebrow">MORE GOODS</p>
        <h2>관련 상품</h2>
      </div>
      <div className="related-grid">
        {goods.map((item) => (
          <Link
            className="related-card"
            data-goods-id={item.goodsId}
            key={item.goodsId}
            to={`/goods/${item.goodsId}`}
            onClick={(event) => openRelatedGoods(event, item.goodsId)}
          >
            <div className="related-card-image">
              <GoodsImage
                src={item.imageUrl}
                alt={item.name}
                fallbackLabel={item.categoryName}
              />
            </div>
            <div className="related-card-topline">
              <p>{item.artistName}</p>
              <GoodsStatusBadge salesStatus={item.salesStatus} isBestSeller={item.isBestSeller} />
            </div>
            <strong>{item.name}</strong>
            <GoodsRatingSummary averageRating={item.averageRating} reviewCount={item.reviewCount} compact />
            <span>{formatGoodsPrice(item.price)}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default RelatedGoodsSection
