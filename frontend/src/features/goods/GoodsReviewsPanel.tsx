import { type FormEvent, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useGoodsReviews } from './useGoodsReviews'

function formatReviewDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' }).format(date)
}

function GoodsReviewsPanel({ goodsId }: { goodsId: number }) {
  const location = useLocation()
  const navigate = useNavigate()

  const navigateToLogin = useCallback(() => {
    const returnTo = `${location.pathname}${location.search}${location.hash}`
    window.sessionStorage.setItem('project-cyan:login-return-to', returnTo)
    navigate('/login', { state: { from: returnTo } })
  }, [location.hash, location.pathname, location.search, navigate])

  const {
    changeSort,
    content,
    deleteMyReview,
    error,
    formMessage,
    isFormOpen,
    isSaving,
    isSignedIn,
    myReview,
    optionLabel,
    page,
    rating,
    ratingCounts,
    reviewsPage,
    setContent,
    setIsFormOpen,
    setOptionLabel,
    setPage,
    setRating,
    sort,
    status,
    submitReview,
    summary,
  } = useGoodsReviews(goodsId, navigateToLogin)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void submitReview()
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
            const currentRating = 5 - index
            const percentage = summary.reviewCount > 0 ? (count / summary.reviewCount) * 100 : 0
            return (
              <div key={currentRating}>
                <span>{currentRating}점</span>
                <span className="review-distribution-track">
                  <span style={{ width: `${percentage}%` }} />
                </span>
                <span>{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="review-compose-bar">
        <div>
          <strong>{myReview ? '내 리뷰가 등록되어 있습니다.' : '상품을 사용해보셨나요?'}</strong>
          {formMessage && <p className="review-form-message" role="status">{formMessage}</p>}
        </div>
        <div>
          {myReview && (
            <button disabled={isSaving} type="button" onClick={() => void deleteMyReview()}>
              삭제
            </button>
          )}
          <button
            type="button"
            aria-expanded={isFormOpen}
            onClick={() => setIsFormOpen((value) => !value)}
          >
            {isFormOpen ? '작성 취소' : myReview ? '내 리뷰 수정' : '리뷰 남기기'}
          </button>
        </div>
      </div>

      {isFormOpen && (
        <form className="review-form" onSubmit={handleSubmit}>
          {!isSignedIn ? (
            <div className="review-state">
              <strong>로그인 후 리뷰를 작성할 수 있습니다.</strong>
              <button type="button" onClick={navigateToLogin}>로그인</button>
            </div>
          ) : (
            <>
              <label>
                <span>별점</span>
                <select value={rating} onChange={(event) => setRating(Number(event.target.value))}>
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>{value}점</option>
                  ))}
                </select>
              </label>
              <label>
                <span>옵션</span>
                <input
                  maxLength={80}
                  placeholder="예: 포토카드 세트"
                  value={optionLabel}
                  onChange={(event) => setOptionLabel(event.target.value)}
                />
              </label>
              <label>
                <span>내용</span>
                <textarea
                  maxLength={1000}
                  placeholder="상품에 대한 리뷰를 남겨주세요."
                  rows={4}
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                />
              </label>
              <div className="review-form-actions">
                <span>{content.trim().length}/1000</span>
                <button disabled={isSaving} type="submit">
                  {isSaving ? '저장 중...' : myReview ? '리뷰 수정' : '리뷰 등록'}
                </button>
              </div>
            </>
          )}
        </form>
      )}

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
