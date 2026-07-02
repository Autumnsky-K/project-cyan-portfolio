import type { GoodsDetail } from '../../api/goods'
import { formatGoodsPrice } from './goodsFormatters'

const PURCHASE_STATE_LABELS: Record<string, string> = {
  AVAILABLE: 'On sale',
  UPCOMING: 'Coming soon',
  ENDED: 'Sale ended',
  SOLD_OUT: 'Sold out',
  UNAVAILABLE: 'Unavailable',
}

function GoodsDetailSpecs({ goods }: { goods: GoodsDetail }) {
  const detailSpecs = [
    { label: '아티스트', value: goods.artistName },
    { label: '카테고리', value: goods.categoryName },
    {
      label: '판매 상태',
      value: PURCHASE_STATE_LABELS[goods.purchaseState ?? ''] ?? goods.salesStatus,
    },
    { label: '가격', value: formatGoodsPrice(Number(goods.price ?? 0)) },
    {
      label: '재고',
      value: goods.stockCount === undefined || goods.stockCount === null
        ? null
        : `${goods.stockCount.toLocaleString()}개`,
    },
    {
      label: '리뷰',
      value: Number(goods.reviewCount ?? 0) > 0
        ? `${Number(goods.reviewCount ?? 0).toLocaleString()}개`
        : null,
    },
  ].filter((item): item is { label: string; value: string } => Boolean(item.value))

  return (
    <dl className="detail-spec-list">
      {detailSpecs.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export default GoodsDetailSpecs
