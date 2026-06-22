import { useEffect, useMemo, useState } from 'react'
import {
  fetchGoodsReviews,
  fetchGoodsReviewSummary,
  type GoodsReviewSummary,
  type PageResponse,
  type GoodsReview,
} from '../../api/goods'

type ReviewSort = 'newest' | 'rating'
type ReviewStatus = 'loading' | 'data' | 'error'

const EMPTY_SUMMARY: GoodsReviewSummary = {
  averageRating: 0,
  reviewCount: 0,
  ratingFiveCount: 0,
  ratingFourCount: 0,
  ratingThreeCount: 0,
  ratingTwoCount: 0,
  ratingOneCount: 0,
}

function formatReviewDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' }).format(date)
}

function GoodsReviewsPanel({ goodsId }: { goodsId: number }) {
  const [summary, setSummary] = useState<GoodsReviewSummary>(EMPTY_SUMMARY)
  const [reviewsPage, setReviewsPage] = useState<PageResponse<GoodsReview> | null>(null)
  const [status, setStatus] = useState<ReviewStatus>('loading')
  const [error, setError] = useState('')
  const [sort, setSort] = useState<ReviewSort>('newest')
  const [page, setPage] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    Promise.resolve()
      .then(() => {
        if (controller.signal.aborted) return null
        setStatus('loading')
        setError('')
        return Promise.all([
          fetchGoodsReviewSummary(goodsId, { signal: controller.signal }),
          fetchGoodsReviews(goodsId, page, 5, sort, { signal: controller.signal }),
        ])
      })
      .then((result) => {
        if (!result || controller.signal.aborted) return
        const [nextSummary, nextReviewsPage] = result
        setSummary(nextSummary)
        setReviewsPage(nextReviewsPage)
        setStatus('data')
      })
      .catch((loadError) => {
        if (loadError instanceof DOMException && loadError.name === 'AbortError') return
        setError(loadError instanceof Error ? loadError.message : '리뷰를 불러오지 못했습니다.')
        setStatus('error')
      })

    return () => controller.abort()
  }, [goodsId, page, sort])

  const ratingCounts = useMemo(
    () => [
      summary.ratingFiveCount,
      summary.ratingFourCount,
      summary.ratingThreeCount,
      summary.ratingTwoCount,
      summary.ratingOneCount,
    ],
    [summary],
  )

  function changeSort(nextSort: ReviewSort) {
    setSort(nextSort)
    setPage(0)
  }

  return (
    <section className="goods-reviews" aria-labelledby="goods-reviews-heading">
      <div className="review-summary">
        <div className="review-score">
          <p>구매자 평점</p>
          <strong><span aria-hidden="true">★</span> {summary.averageRating.toFixed(1)}</strong>
          <span>리뷰 {summary.reviewCount.toLocaleString()}개</span>
        </div>
        <div className="review-distribution" aria-label="별점 분포">
          {ratingCounts.map((count, index) => {
            const rating = 5 - index
            const percentage = summary.reviewCount > 0 ? (count / summary.reviewCount) * 100 : 0
            return (
              <div key={rating}>
                <span>{rating}점</span>
                <span className="review-distribution-track">
                  <span style={{ width: `${percentage}%` }} />
                </span>
                <span>{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="review-list-heading">
        <h2 id="goods-reviews-heading">상품 리뷰</h2>
        <div>
          <button aria-pressed={sort === 'newest'} type="button" onClick={() => changeSort('newest')}>
            최신순
          </button>
          <button aria-pressed={sort === 'rating'} type="button" onClick={() => changeSort('rating')}>
            별점순
          </button>
        </div>
      </div>

      {status === 'loading' && <div className="review-state">리뷰를 불러오는 중입니다...</div>}
      {status === 'error' && <div className="review-state error-state">{error}</div>}
      {status === 'data' && summary.reviewCount === 0 && (
        <div className="review-state">아직 작성된 리뷰가 없습니다.</div>
      )}
      {status === 'data' && (reviewsPage?.content ?? []).map((review) => (
        <article className="review-item" key={review.reviewId}>
          <div className="review-item-meta">
            <strong><span aria-hidden="true">★</span> {review.rating}.0</strong>
            <span>{review.authorName}</span>
            <time dateTime={review.createdAt}>{formatReviewDate(review.createdAt)}</time>
          </div>
          {review.optionLabel && <p className="review-option">구매 옵션 · {review.optionLabel}</p>}
          <p>{review.content}</p>
        </article>
      ))}

      {(reviewsPage?.totalPages ?? 0) > 1 && (
        <nav className="review-pagination" aria-label="리뷰 페이지">
          <button disabled={page === 0} type="button" onClick={() => setPage((value) => value - 1)}>
            이전
          </button>
          <span>{page + 1} / {reviewsPage?.totalPages}</span>
          <button
            disabled={page >= (reviewsPage?.totalPages ?? 1) - 1}
            type="button"
            onClick={() => setPage((value) => value + 1)}
          >
            다음
          </button>
        </nav>
      )}
    </section>
  )
}

export default GoodsReviewsPanel
