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
import { formatGoodsPrice } from './goodsFormatters'
import { publishGoodsLikeSyncUpdate } from './goodsLikeSync'
import './goods.css'
import './goods-detail.css'
import Header from '../../shared/components/Header'

type DetailStatus = 'loading' | 'data' | 'error'
type DetailTab = 'intro' | 'reviews'

const PURCHASE_STATE_LABELS: Record<string, string> = {
  AVAILABLE: 'On sale',
  UPCOMING: 'Coming soon',
  ENDED: 'Sale ended',
  SOLD_OUT: 'Sold out',
  UNAVAILABLE: 'Unavailable',
}

function readGoodsListUrl(state: unknown) {
  if (typeof state !== 'object' || state === null) return '/goods'
  const goodsListUrl = (state as { goodsListUrl?: unknown }).goodsListUrl
  return typeof goodsListUrl === 'string' && goodsListUrl.startsWith('/goods')
    ? goodsListUrl
    : '/goods'
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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const shareFeedbackTimerRef = useRef<number | null>(null)
  const likeFeedbackTimerRef = useRef<number | null>(null)
  const pendingScrollRestoreRef = useRef<number | null>(null)
  const scrollRestoreTimerRef = useRef<number | null>(null)
  const detailTabsRef = useRef<HTMLElement | null>(null)
  const loginReturnTo = `${location.pathname}${location.search}${location.hash}`
  const goodsListUrl = readGoodsListUrl(location.state)

  const navigateToLogin = useCallback(() => {
    window.sessionStorage.setItem('project-cyan:login-return-to', loginReturnTo)
    navigate('/login', { state: { from: loginReturnTo } })
  }, [loginReturnTo, navigate])

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
      publishGoodsLikeSyncUpdate({
        goodsId: goods.goodsId,
        liked: result.liked,
        likeCount: result.likeCount,
      })
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
        setSelectedImageIndex(0)
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
  const galleryImages = goods
    ? [
        ...(goods.imageUrl
          ? [{
              imageId: 0,
              imageUrl: goods.imageUrl,
              altText: goods.name,
              sortOrder: 0,
            }]
          : []),
        ...(goods.extraImages ?? []).filter((image) => Boolean(image.imageUrl)),
      ]
    : []
  const selectedGalleryImage = galleryImages[selectedImageIndex] ?? galleryImages[0] ?? null
  const hasGalleryNavigation = galleryImages.length > 1
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

  function handleReviewJump() {
    setActiveTab('reviews')
    window.requestAnimationFrame(() => {
      detailTabsRef.current?.scrollIntoView({ block: 'start', behavior: 'auto' })
    })
  }

  return (
    <main className="goods-page goods-detail-page">
      <Header />

      <section className="detail-toolbar">
        <Link className="detail-action" to={goodsListUrl}>← 상품 목록</Link>
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
            <Link className="detail-action" to={goodsListUrl}>상품 목록으로 이동</Link>
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
                  src={selectedGalleryImage?.imageUrl ?? goods.imageUrl}
                  alt={selectedGalleryImage?.altText || goods.name}
                  fallbackLabel={goods.categoryName}
                />
                {hasGalleryNavigation && (
                  <button
                    className="detail-gallery-nav detail-gallery-nav-prev"
                    type="button"
                    aria-label="이전 이미지"
                    onClick={() => setSelectedImageIndex((index) => (
                      index <= 0 ? galleryImages.length - 1 : index - 1
                    ))}
                  >
                    ‹
                  </button>
                )}
                {hasGalleryNavigation && (
                  <button
                    className="detail-gallery-nav detail-gallery-nav-next"
                    type="button"
                    aria-label="다음 이미지"
                    onClick={() => setSelectedImageIndex((index) => (
                      index >= galleryImages.length - 1 ? 0 : index + 1
                    ))}
                  >
                    ›
                  </button>
                )}
              </div>
              {galleryImages.length > 1 && (
                <div className="detail-gallery-thumbnails" aria-label="상품 이미지 사진첩">
                  {galleryImages.map((image, index) => (
                    <button
                      key={`${image.imageId}-${image.imageUrl}`}
                      type="button"
                      aria-label={`${goods.name} 이미지 ${index + 1}`}
                      aria-current={selectedImageIndex === index ? 'true' : undefined}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <GoodsImage
                        src={image.imageUrl}
                        alt=""
                        fallbackLabel={goods.categoryName}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <GoodsPurchasePanel
              key={goods.goodsId}
              goods={goods}
              onReviewClick={handleReviewJump}
              isLiked={isLiked}
              isLikePending={isLikePending}
              likeFeedback={likeFeedback}
              onLikeToggle={() => void handleLikeToggle()}
              shareFeedback={shareFeedback}
              onShare={handleShare}
            />
          </section>

          <section className="detail-tabs" ref={detailTabsRef}>
            <div className="detail-tab-list" role="tablist" aria-label="상품 상세 정보">
              <button aria-selected={activeTab === 'intro'} role="tab" type="button" onClick={() => setActiveTab('intro')}>
                상품 소개
              </button>
              <button aria-selected={activeTab === 'reviews'} role="tab" type="button" onClick={() => setActiveTab('reviews')}>
                리뷰 ({Number(goods.reviewCount ?? 0).toLocaleString()})
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
