import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createGoodsReview,
  deleteGoodsReview,
  fetchGoodsReviews,
  fetchGoodsReviewSummary,
  fetchMyGoodsReview,
  updateGoodsReview,
  type GoodsReview,
  type GoodsReviewSummary,
  type PageResponse,
} from '../../api/goods'
import { hasSpringApiSession } from '../../shared/api/springApiClient'

export type ReviewSort = 'newest' | 'rating'
export type ReviewStatus = 'loading' | 'data' | 'error'

const EMPTY_SUMMARY: GoodsReviewSummary = {
  averageRating: 0,
  reviewCount: 0,
  ratingFiveCount: 0,
  ratingFourCount: 0,
  ratingThreeCount: 0,
  ratingTwoCount: 0,
  ratingOneCount: 0,
}

export function useGoodsReviews(goodsId: number, onRequireSignIn: () => void) {
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

  async function submitReview() {
    if (!isSignedIn) {
      onRequireSignIn()
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

  async function deleteMyReview() {
    if (!myReview || !window.confirm('이 리뷰를 삭제할까요?')) {
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

  return {
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
  }
}
