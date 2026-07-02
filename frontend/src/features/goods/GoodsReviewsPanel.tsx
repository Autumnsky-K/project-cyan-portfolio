import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  createGoodsReview,
  deleteGoodsReview,
  fetchGoodsReviews,
  fetchGoodsReviewSummary,
  fetchMyGoodsReview,
  updateGoodsReview,
  type GoodsReviewSummary,
  type PageResponse,
  type GoodsReview,
} from '../../api/goods'
import { hasSpringApiSession } from '../../shared/api/springApiClient'

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
  const location = useLocation()
  const navigate = useNavigate()
  const [summary, setSummary] = useState<GoodsReviewSummary>(EMPTY_SUMMARY)
  const [reviewsPage, setReviewsPage] = useState<PageResponse<GoodsReview> | null>(null)
  const [myReview, setMyReview] = useState<GoodsReview | null>(null)
  const [status, setStatus] = useState<ReviewStatus>('loading')
  const [error, setError] = useState('')
  const [sort, setSort] = useState<ReviewSort>('newest')
  const [page, setPage] = useState(0)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [optionLabel, setOptionLabel] = useState('')
  const [formMessage, setFormMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const loadReviews = useCallback(async (signal?: AbortSignal) => {
    setStatus('loading')
    setError('')
    const signedIn = await hasSpringApiSession()
    if (signal?.aborted) return
    setIsSignedIn(signedIn)

    const [nextSummary, nextReviewsPage, nextMyReview] = await Promise.all([
      fetchGoodsReviewSummary(goodsId, signal ? { signal } : {}),
      fetchGoodsReviews(goodsId, page, 5, sort, signal ? { signal } : {}),
      signedIn ? fetchMyGoodsReview(goodsId) : Promise.resolve(null),
    ])

    if (signal?.aborted) return
    setSummary(nextSummary)
    setReviewsPage(nextReviewsPage)
    setMyReview(nextMyReview)
    setRating(nextMyReview?.rating ?? 5)
    setContent(nextMyReview?.content ?? '')
    setOptionLabel(nextMyReview?.optionLabel ?? '')
    setStatus('data')
  }, [goodsId, page, sort])

  useEffect(() => {
    const controller = new AbortController()

    loadReviews(controller.signal).catch((loadError) => {
      if (loadError instanceof DOMException && loadError.name === 'AbortError') return
      setError(loadError instanceof Error ? loadError.message : '리뷰를 불러오지 못했습니다.')
      setStatus('error')
    })

    return () => controller.abort()
  }, [loadReviews])

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

  function navigateToLogin() {
    const returnTo = `${location.pathname}${location.search}${location.hash}`
    window.sessionStorage.setItem('project-cyan:login-return-to', returnTo)
    navigate('/login', { state: { from: returnTo } })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isSignedIn) {
      navigateToLogin()
      return
    }

    const trimmedContent = content.trim()
    if (!trimmedContent) {
      setFormMessage('리뷰 내용을 입력해 주세요.')
      return
    }

    setIsSaving(true)
    setFormMessage('')
    try {
      const payload = {
        rating,
        content: trimmedContent,
        optionLabel: optionLabel.trim() || null,
      }
      const savedReview = myReview
        ? await updateGoodsReview(goodsId, myReview.reviewId, payload)
        : await createGoodsReview(goodsId, payload)
      setMyReview(savedReview)
      setFormMessage(myReview ? '리뷰를 수정했습니다.' : '리뷰를 등록했습니다.')
      setIsFormOpen(false)
      await loadReviews()
    } catch (reviewError) {
      setFormMessage(reviewError instanceof Error ? reviewError.message : '리뷰를 저장하지 못했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!myReview || !window.confirm('내 리뷰를 삭제할까요?')) {
      return
    }

    setIsSaving(true)
    setFormMessage('')
    try {
      await deleteGoodsReview(goodsId, myReview.reviewId)
      setMyReview(null)
      setRating(5)
      setContent('')
      setOptionLabel('')
      setFormMessage('리뷰를 삭제했습니다.')
      setIsFormOpen(false)
      await loadReviews()
    } catch (reviewError) {
      setFormMessage(reviewError instanceof Error ? reviewError.message : '리뷰를 삭제하지 못했습니다.')
    } finally {
      setIsSaving(false)
    }
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
            <button disabled={isSaving} type="button" onClick={() => void handleDelete()}>
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
