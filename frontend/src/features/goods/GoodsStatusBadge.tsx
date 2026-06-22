type GoodsStatusBadgeProps = {
  salesStatus?: string | null
  isBestSeller?: boolean | null
}

const STATUS_LABELS: Record<string, string> = {
  ON_SALE: 'On sale',
  SOLD_OUT: 'Sold out',
  UPCOMING: 'Coming soon',
  RESERVATION: 'Pre-order',
  ENDED: 'Sale ended',
  DISCONTINUED: 'Discontinued',
  HIDDEN: 'Unavailable',
}

function GoodsStatusBadge({ salesStatus, isBestSeller }: GoodsStatusBadgeProps) {
  const normalizedStatus = salesStatus?.trim().toUpperCase() || 'ON_SALE'
  const label = STATUS_LABELS[normalizedStatus]
    ?? normalizedStatus.replaceAll('_', ' ').toLocaleLowerCase()

  return (
    <span className="goods-status-list">
      <span className="goods-status-badge" data-status={normalizedStatus.toLocaleLowerCase()}>
        {label}
      </span>
      {isBestSeller && (
        <span className="goods-status-badge" data-status="best">
          Best
        </span>
      )}
    </span>
  )
}

export default GoodsStatusBadge
