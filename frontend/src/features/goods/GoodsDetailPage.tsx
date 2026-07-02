import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import GoodsCartSidePanel from '../cart/GoodsCartSidePanel'
import GoodsDetailTabs, { type DetailTab } from './GoodsDetailTabs'
import GoodsGallery from './GoodsGallery'
import GoodsPurchasePanel from './GoodsPurchasePanel'
import RelatedGoodsSection from './RelatedGoodsSection'
import { useDetailScrollRestore } from './useDetailScrollRestore'
import { useGoodsDetail } from './useGoodsDetail'
import { useGoodsDetailLike } from './useGoodsDetailLike'
import { useRelatedGoods } from './useRelatedGoods'
import './goods.css'
import './goods-detail.css'

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
  const { goods, setGoods, status, error } = useGoodsDetail(goodsId)
  const relatedGoods = useRelatedGoods(goodsId)
  const [activeTab, setActiveTab] = useState<DetailTab>('intro')
  const [shareFeedback, setShareFeedback] = useState('')
  const shareFeedbackTimerRef = useRef<number | null>(null)
  const detailTabsRef = useRef<HTMLElement | null>(null)
  const loginReturnTo = `${location.pathname}${location.search}${location.hash}`
  const goodsListUrl = readGoodsListUrl(location.state)

  const navigateToLogin = useCallback(() => {
    window.sessionStorage.setItem('project-cyan:login-return-to', loginReturnTo)
    navigate('/login', { state: { from: loginReturnTo } })
  }, [loginReturnTo, navigate])
  const {
    isLiked,
    isLikePending,
    likeFeedback,
    handleLikeToggle,
  } = useGoodsDetailLike(goods, goodsId, setGoods, navigateToLogin)
  useDetailScrollRestore(goodsId, location.search, status, goods?.goodsId)

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

  function handleReviewJump() {
    setActiveTab('reviews')
    window.requestAnimationFrame(() => {
      detailTabsRef.current?.scrollIntoView({ block: 'start', behavior: 'auto' })
    })
  }

  return (
    <>
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
            <GoodsGallery goods={goods} />

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

          <GoodsDetailTabs
            ref={detailTabsRef}
            activeTab={activeTab}
            goods={goods}
            onTabChange={setActiveTab}
          />

          <RelatedGoodsSection goods={relatedGoods} />
          <GoodsCartSidePanel />
        </>
      )}
    </>
  )
}

export default GoodsDetailPage
