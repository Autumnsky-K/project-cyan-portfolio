type GoodsRatingSummaryProps = {
  averageRating?: number | null
  reviewCount?: number | null
  compact?: boolean
  onClick?: () => void
}

function GoodsRatingSummary({
  averageRating,
  reviewCount,
  compact = false,
  onClick,
}: GoodsRatingSummaryProps) {
  const count = Number(reviewCount ?? 0)
  const rating = Number(averageRating ?? 0)
  const contents = count > 0
    ? (
        <>
          <span className="goods-rating-star" aria-hidden="true">★</span>
          <strong>{rating.toFixed(1)}</strong>
          <span>({count.toLocaleString()})</span>
        </>
      )
    : <span>리뷰 없음</span>

  if (onClick) {
    return (
      <button className="goods-rating-summary" data-compact={compact} type="button" onClick={onClick}>
        {contents}
      </button>
    )
  }

  return (
    <span className="goods-rating-summary" data-compact={compact}>
      {contents}
    </span>
  )
}

export default GoodsRatingSummary
