import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import {
  fetchGoodsDetail,
  fetchRelatedGoods,
  type GoodsDetail,
  type GoodsSummary,
} from '../../api/goods'
import GoodsImage from './GoodsImage'
import GoodsPurchasePanel from './GoodsPurchasePanel'
import GoodsReviewsPanel from './GoodsReviewsPanel'
import RelatedGoodsSection from './RelatedGoodsSection'
import './goods.css'
import './goods-detail.css'
import Header from '../../shared/components/Header'

type DetailStatus = 'loading' | 'data' | 'error'
type DetailTab = 'intro' | 'notice' | 'reviews'

function GoodsDetailPage() {
  const { goodsId } = useParams<{ goodsId: string }>()
  const location = useLocation()
  const [goods, setGoods] = useState<GoodsDetail | null>(null)
  const [relatedGoods, setRelatedGoods] = useState<GoodsSummary[]>([])
  const [status, setStatus] = useState<DetailStatus>('loading')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<DetailTab>('intro')
  const [shareFeedback, setShareFeedback] = useState('')
  const shareFeedbackTimerRef = useRef<number | null>(null)
  const pendingScrollRestoreRef = useRef<number | null>(null)
  const scrollRestoreTimerRef = useRef<number | null>(null)

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
    },
    [],
  )

  const isNotFound = error.toLocaleLowerCase().includes('not found')

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

              <div className="detail-tabs">
                <div className="detail-tab-list" role="tablist" aria-label="상품 상세 정보">
                  <button aria-selected={activeTab === 'intro'} role="tab" type="button" onClick={() => setActiveTab('intro')}>
                    상품 소개
                  </button>
                  <button aria-selected={activeTab === 'notice'} role="tab" type="button" onClick={() => setActiveTab('notice')}>
                    안내 사항
                  </button>
                  <button aria-selected={activeTab === 'reviews'} role="tab" type="button" onClick={() => setActiveTab('reviews')}>
                    리뷰 {Number(goods.reviewCount ?? 0) > 0 ? `(${goods.reviewCount})` : ''}
                  </button>
                </div>
                {activeTab === 'intro' ? (
                  <div className="detail-tab-panel" role="tabpanel">
                    <h2>{goods.name}</h2>
                    <p>{goods.description || goods.notices?.intro || '상품 소개가 준비 중입니다.'}</p>
                    <div className="detail-long-image">
                      {goods.imageUrl && (
                        <GoodsImage
                          src={goods.imageUrl}
                          alt={`${goods.name} 상세`}
                          fallbackLabel={goods.categoryName}
                        />
                      )}
                    </div>
                  </div>
                ) : activeTab === 'notice' ? (
                  <div className="detail-tab-panel notice-list" role="tabpanel">
                    <article><h2>배송 안내</h2><p>{goods.notices?.delivery}</p></article>
                    <article><h2>취소·변경 안내</h2><p>{goods.notices?.cancel}</p></article>
                    <article><h2>배송 범위</h2><p>{goods.shipping?.note}</p></article>
                  </div>
                ) : (
                  <div className="detail-tab-panel" role="tabpanel">
                    <GoodsReviewsPanel goodsId={goods.goodsId} />
                  </div>
                )}
              </div>
            </div>

            <GoodsPurchasePanel
              key={goods.goodsId}
              goods={goods}
              onReviewClick={() => setActiveTab('reviews')}
            />
          </section>

          <RelatedGoodsSection goods={relatedGoods} />
        </>
      )}
    </main>
  )
}

export default GoodsDetailPage
