import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  addGoodsLike,
  fetchGoodsDetail,
  fetchMyGoodsLike,
  fetchRelatedGoods,
  recordGoodsView,
  removeGoodsLike,
  type GoodsDetail,
  type GoodsSummary,
} from '../../api/goods'
import { hasSpringApiSession } from '../../shared/api/springApiClient'
import GoodsCartSidePanel from '../cart/GoodsCartSidePanel'
import GoodsImage from './GoodsImage'
import GoodsPurchasePanel from './GoodsPurchasePanel'
import GoodsReviewsPanel from './GoodsReviewsPanel'
import RelatedGoodsSection from './RelatedGoodsSection'
import { useGoodsFavorites } from './useGoodsFavorites'
import { formatGoodsPrice } from './goodsFormatters'
import './goods.css'
import './goods-detail.css'
import Header from '../../shared/components/Header'

type DetailStatus = 'loading' | 'data' | 'error'
type DetailTab = 'intro' | 'reviews'

const PURCHASE_STATE_LABELS: Record<string, string> = {
  AVAILABLE: '판매 중',
  UPCOMING: '판매 예정',
  ENDED: '판매 종료',
  SOLD_OUT: '품절',
  UNAVAILABLE: '구매 불가',
}

function GoodsDetailPage() {
  const { goodsId } = useParams<{ goodsId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const [goods, setGoods] = useState<GoodsDetail | null>(null)
  const [relatedGoods, setRelatedGoods] = useState<GoodsSummary[]>([])
  const [status, setStatus] = useState<DetailStatus>('loading')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<DetailTab>('intro')
  const [shareFeedback, setShareFeedback] = useState('')
  const [isLiked, setIsLiked] = useState(false)
  const [isLikePending, setIsLikePending] = useState(false)
  const [likeFeedback, setLikeFeedback] = useState('')
  const shareFeedbackTimerRef = useRef<number | null>(null)
  const likeFeedbackTimerRef = useRef<number | null>(null)
  const pendingScrollRestoreRef = useRef<number | null>(null)
  const scrollRestoreTimerRef = useRef<number | null>(null)
  const {
    isFavorite,
    toggleFavorite,
  } = useGoodsFavorites()
  const loginReturnTo = `${location.pathname}${location.search}${location.hash}`

  const navigateToLogin = useCallback(() => {
    window.sessionStorage.setItem('project-cyan:login-return-to', loginReturnTo)
    navigate('/login', { state: { from: loginReturnTo } })
  }, [loginReturnTo, navigate])

  const handleFavoriteToggle = useCallback(async (targetGoodsId: number) => {
    if (!(await hasSpringApiSession())) {
      navigateToLogin()
      return
    }
    await toggleFavorite(targetGoodsId)
  }, [navigateToLogin, toggleFavorite])

  const handleLikeToggle = useCallback(async () => {
    if (!goods) return

    if (!(await hasSpringApiSession())) {
      navigateToLogin()
      return
    }

    setIsLikePending(true)
    setLikeFeedback('')
    try {
      const result = isLiked
        ? await removeGoodsLike(goods.goodsId)
        : await addGoodsLike(goods.goodsId)
      setIsLiked(result.liked)
      setGoods((current) => (
        current && current.goodsId === goods.goodsId
          ? { ...current, likeCount: result.likeCount }
          : current
      ))
    } catch (likeError) {
      setLikeFeedback(likeError instanceof Error ? likeError.message : '좋아요를 처리하지 못했습니다.')
      if (likeFeedbackTimerRef.current !== null) {
        window.clearTimeout(likeFeedbackTimerRef.current)
      }
      likeFeedbackTimerRef.current = window.setTimeout(() => setLikeFeedback(''), 2200)
    } finally {
      setIsLikePending(false)
    }
  }, [goods, isLiked, navigateToLogin])

  useLayoutEffect(() => {
    const rawScrollY = new URLSearchParams(location.search).get('_detailScroll')
    const scrollY = rawScrollY === null ? null : Number(rawScrollY)
    pendingScrollRestoreRef.current = Number.isFinite(scrollY) && scrollY !== null
      ? Math.max(scrollY, 0)
      : null

    if (pendingScrollRestoreRef.current === null) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }
  }, [goodsId, location.search])

  useLayoutEffect(() => {
    if (
      status !== 'data'
      || String(goods?.goodsId) !== goodsId
      || pendingScrollRestoreRef.current === null
    ) {
      return
    }

    const scrollY = pendingScrollRestoreRef.current
    pendingScrollRestoreRef.current = null
    scrollRestoreTimerRef.current = window.setTimeout(() => {
      window.scrollTo({ top: scrollY, left: 0, behavior: 'auto' })
      const cleanUrl = new URL(window.location.href)
      cleanUrl.searchParams.delete('_detailScroll')
      window.history.replaceState(
        window.history.state,
        '',
        `${cleanUrl.pathname}${cleanUrl.search}`,
      )
      scrollRestoreTimerRef.current = null
    }, 200)

    return () => {
      if (scrollRestoreTimerRef.current !== null) {
        window.clearTimeout(scrollRestoreTimerRef.current)
        scrollRestoreTimerRef.current = null
      }
    }
  }, [goods?.goodsId, goodsId, status])

  useEffect(() => {
    const controller = new AbortController()

    async function loadGoodsDetail() {
      if (!goodsId) {
        setError('상품 ID가 없습니다.')
        setStatus('error')
        return
      }

      setStatus('loading')
      setError('')
      try {
        const detail = await fetchGoodsDetail(goodsId, { signal: controller.signal })
        setGoods(detail)
        setStatus('data')
        void recordGoodsView(detail.goodsId).catch(() => undefined)
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === 'AbortError') return
        setError(loadError instanceof Error ? loadError.message : '상품 정보를 불러오지 못했습니다.')
        setStatus('error')
      }
    }

    loadGoodsDetail()
    return () => controller.abort()
  }, [goodsId])

  useEffect(() => {
    let ignore = false

    async function loadMyLike() {
      if (!goodsId) {
        setIsLiked(false)
        return
      }

      try {
        const like = await fetchMyGoodsLike(goodsId)
        if (ignore) return
        setIsLiked(Boolean(like?.liked))
        if (like?.likeCount !== undefined) {
          setGoods((current) => (
            current && String(current.goodsId) === String(goodsId)
              ? { ...current, likeCount: like.likeCount }
              : current
          ))
        }
      } catch {
        if (!ignore) setIsLiked(false)
      }
    }

    void loadMyLike()
    return () => {
      ignore = true
    }
  }, [goodsId])

  useEffect(() => {
    const controller = new AbortController()

    async function loadRelatedGoods() {
      if (!goodsId) {
        setRelatedGoods([])
        return
      }

      setRelatedGoods([])
      try {
        setRelatedGoods(await fetchRelatedGoods(goodsId, 8, { signal: controller.signal }))
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === 'AbortError') return
        setRelatedGoods([])
      }
    }

    loadRelatedGoods()
    return () => controller.abort()
  }, [goodsId])

  useEffect(
    () => () => {
      if (shareFeedbackTimerRef.current !== null) {
        window.clearTimeout(shareFeedbackTimerRef.current)
      }
      if (likeFeedbackTimerRef.current !== null) {
        window.clearTimeout(likeFeedbackTimerRef.current)
      }
    },
    [],
  )

  const isNotFound = error.toLocaleLowerCase().includes('not found')
  const descriptionHtml = goods?.description?.trim()
  const detailSpecs = goods
    ? [
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
    : []

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShareFeedback('복사됨')
    } catch {
      setShareFeedback('복사 실패')
    }
    if (shareFeedbackTimerRef.current !== null) {
      window.clearTimeout(shareFeedbackTimerRef.current)
    }
    shareFeedbackTimerRef.current = window.setTimeout(() => setShareFeedback(''), 1800)
  }

  return (
    <main className="goods-page goods-detail-page">
      <Header />

      <section className="detail-toolbar">
        <Link className="detail-action" to="/goods">← 상품 목록</Link>
        <button className="detail-share" type="button" onClick={handleShare}>
          {shareFeedback || '공유'}
        </button>
      </section>

      {status === 'loading' && <div className="goods-state detail-state">상품 정보를 불러오는 중입니다...</div>}
      {status === 'error' && (
        <div className="goods-state detail-state error-state detail-error-state">
          <strong>{isNotFound ? '상품을 찾을 수 없습니다.' : '상품 정보를 불러오지 못했습니다.'}</strong>
          <span>
            {isNotFound
              ? '삭제되었거나 주소가 변경된 상품입니다. 상품 목록에서 다른 굿즈를 확인해 주세요.'
              : error}
          </span>
          <div>
            <Link className="detail-action" to="/goods">상품 목록으로 이동</Link>
            <button type="button" onClick={() => window.history.back()}>이전 페이지</button>
          </div>
        </div>
      )}

      {status === 'data' && goods && (
        <>
          <section className="detail-layout">
            <div className="detail-content">
              <div className="detail-image" aria-label={`${goods.name} 이미지`}>
                <GoodsImage
                  src={goods.imageUrl}
                  alt={goods.name}
                  fallbackLabel={goods.categoryName}
                />
              </div>
            </div>

            <GoodsPurchasePanel
              key={goods.goodsId}
              goods={goods}
              onReviewClick={() => setActiveTab('reviews')}
              isFavorite={isFavorite(goods.goodsId)}
              onFavoriteToggle={() => void handleFavoriteToggle(goods.goodsId)}
              isLiked={isLiked}
              isLikePending={isLikePending}
              likeFeedback={likeFeedback}
              onLikeToggle={() => void handleLikeToggle()}
            />
          </section>

          <section className="detail-tabs">
            <div className="detail-tab-list" role="tablist" aria-label="상품 상세 정보">
              <button aria-selected={activeTab === 'intro'} role="tab" type="button" onClick={() => setActiveTab('intro')}>
                상품 소개
              </button>
              <button aria-selected={activeTab === 'reviews'} role="tab" type="button" onClick={() => setActiveTab('reviews')}>
                리뷰 {Number(goods.reviewCount ?? 0) > 0 ? `(${goods.reviewCount})` : ''}
              </button>
            </div>
            {activeTab === 'intro' ? (
              <div className="detail-tab-panel" role="tabpanel">
                <div className="detail-overview">
                  <dl className="detail-spec-list">
                    {detailSpecs.map((item) => (
                      <div key={item.label}>
                        <dt>{item.label}</dt>
                        <dd>{item.value}</dd>
                      </div>
                    ))}
                  </dl>

                  <section className="detail-description-summary" aria-labelledby="detail-description-heading">
                    <h2 id="detail-description-heading">상품 소개</h2>
                    {descriptionHtml ? (
                      <div
                        className="detail-description"
                        dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                      />
                    ) : (
                      <p>상품 소개가 준비 중입니다.</p>
                    )}
                  </section>
                </div>
              </div>
            ) : (
              <div className="detail-tab-panel" role="tabpanel">
                <GoodsReviewsPanel goodsId={goods.goodsId} />
              </div>
            )}
          </section>

          <RelatedGoodsSection goods={relatedGoods} />
          <GoodsCartSidePanel />
        </>
      )}
    </main>
  )
}

export default GoodsDetailPage
