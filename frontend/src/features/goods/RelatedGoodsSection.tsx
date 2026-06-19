import { Link } from 'react-router-dom'
import type { GoodsSummary } from '../../api/goods'
import { formatGoodsPrice } from './goodsFormatters'
import GoodsImage from './GoodsImage'
import GoodsStatusBadge from './GoodsStatusBadge'

function RelatedGoodsSection({ goods }: { goods: GoodsSummary[] }) {
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
          >
            <div>
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
            <span>{formatGoodsPrice(item.price)}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default RelatedGoodsSection
