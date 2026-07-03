import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import AsyncState from '../../shared/components/AsyncState'
import type { DigitalLibraryItem } from '../../api/digitalLibrary'
import { fetchMyDigitalGoodsPurchase, purchaseDigitalGoods } from '../../api/goods'
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
  return typeof goodsListUrl === 'string' && (
    goodsListUrl.startsWith('/goods') ||
    goodsListUrl.startsWith('/likes/goods')
  )
    ? goodsListUrl
    : '/goods'
}

function readRequestedDetailTab(search: string, hash: string): DetailTab {
  const normalizedHash = hash.toLowerCase()
  if (normalizedHash === '#reviews') {
    return 'reviews'
  }

  const tab = new URLSearchParams(search).get('tab')?.toLowerCase()
  return tab === 'reviews' ? 'reviews' : 'intro'
}

function digitalPurchaseErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : ''
  if (!message || /not found/i.test(message)) {
    return '상품 정보와 구매 대상이 일치하지 않습니다. 새로고침 후 다시 시도해주세요.'
  }
  return message
}

function GoodsDetailPage() {
  const { goodsId } = useParams<{ goodsId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { goods, setGoods, status, error } = useGoodsDetail(goodsId)
  const relatedGoods = useRelatedGoods(goodsId)
  const [activeTab, setActiveTab] = useState<DetailTab>(() => readRequestedDetailTab(location.search, location.hash))
  const [shareFeedback, setShareFeedback] = useState('')
  const [digitalEntitlement, setDigitalEntitlement] = useState<DigitalLibraryItem | null>(null)
  const [digitalClaimFeedback, setDigitalClaimFeedback] = useState('')
  const [isClaimingFreeDigitalGoods, setIsClaimingFreeDigitalGoods] = useState(false)
  const shareFeedbackTimerRef = useRef<number | null>(null)
  const digitalClaimFeedbackTimerRef = useRef<number | null>(null)
  const detailTabsRef = useRef<HTMLElement | null>(null)
  const lastReviewDeepLinkRef = useRef('')
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

  useEffect(() => {
    let isMounted = true

    async function loadDigitalEntitlement() {
      if (status !== 'data' || !goods || goods.fulfillmentType !== 'DIGITAL') {
        setDigitalEntitlement(null)
        return
      }

      try {
        const item = await fetchMyDigitalGoodsPurchase(goods.goodsId)
        if (isMounted) {
          setDigitalEntitlement(item)
        }
      } catch (loadError) {
        console.warn(loadError)
        if (isMounted) {
          setDigitalEntitlement(null)
        }
      }
    }

    void loadDigitalEntitlement()

    return () => {
      isMounted = false
    }
  }, [goods, status])

  useEffect(() => {
    const nextTab = readRequestedDetailTab(location.search, location.hash)
    const timerId = window.setTimeout(() => setActiveTab(nextTab), 0)
    return () => window.clearTimeout(timerId)
  }, [location.hash, location.search])

  useEffect(() => {
    if (status !== 'data' || activeTab !== 'reviews' || location.hash.toLowerCase() !== '#reviews') {
      return
    }

    const reviewDeepLinkKey = `${location.pathname}${location.search}${location.hash}`
    if (lastReviewDeepLinkRef.current === reviewDeepLinkKey) {
      return
    }

    lastReviewDeepLinkRef.current = reviewDeepLinkKey
    window.requestAnimationFrame(() => {
      detailTabsRef.current?.scrollIntoView({ block: 'start', behavior: 'auto' })
    })
  }, [activeTab, location.hash, location.pathname, location.search, status])

  useEffect(
    () => () => {
      if (shareFeedbackTimerRef.current !== null) {
        window.clearTimeout(shareFeedbackTimerRef.current)
      }
      if (digitalClaimFeedbackTimerRef.current !== null) {
        window.clearTimeout(digitalClaimFeedbackTimerRef.current)
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

  function showDigitalClaimFeedback(message: string) {
    setDigitalClaimFeedback(message)
    if (digitalClaimFeedbackTimerRef.current !== null) {
      window.clearTimeout(digitalClaimFeedbackTimerRef.current)
    }
    digitalClaimFeedbackTimerRef.current = window.setTimeout(() => setDigitalClaimFeedback(''), 2200)
  }

  async function handleFreeDigitalClaim() {
    if (!goods || isClaimingFreeDigitalGoods) {
      return
    }
    setIsClaimingFreeDigitalGoods(true)
    try {
      const entitlement = await purchaseDigitalGoods(goods.goodsId)
      setDigitalEntitlement(entitlement)
      showDigitalClaimFeedback('구매 완료 처리했습니다.')
    } catch (claimError) {
      const message = digitalPurchaseErrorMessage(claimError)
      if (message.includes('로그인')) {
        navigateToLogin()
        return
      }
      showDigitalClaimFeedback(message)
    } finally {
      setIsClaimingFreeDigitalGoods(false)
    }
  }

  return (
    <>
      <section className="detail-toolbar">
        <Link className="detail-action" to={goodsListUrl}>← 상품 목록</Link>
      </section>

      {status === 'loading' && (
        <AsyncState className="detail-state" kind="loading" title="상품 정보를 불러오는 중입니다..." />
      )}
      {status === 'error' && (
        <AsyncState
          actions={<>
            <Link className="detail-action" to={goodsListUrl}>상품 목록으로 이동</Link>
            <button type="button" onClick={() => window.history.back()}>이전 페이지</button>
          </>}
          className="detail-state detail-error-state"
          kind="error"
          message={isNotFound
            ? '삭제되었거나 주소가 변경된 상품입니다. 상품 목록에서 다른 굿즈를 확인해 주세요.'
            : error}
          title={isNotFound ? '상품을 찾을 수 없습니다.' : '상품 정보를 불러오지 못했습니다.'}
        />
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
              digitalEntitlement={digitalEntitlement}
              digitalClaimFeedback={digitalClaimFeedback}
              isClaimingFreeDigitalGoods={isClaimingFreeDigitalGoods}
              onFreeDigitalClaim={() => void handleFreeDigitalClaim()}
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
