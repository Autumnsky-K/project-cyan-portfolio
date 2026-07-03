import { useCallback, useEffect, useState, type MouseEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  fetchLikedGoods,
  removeGoodsLike,
  type GoodsSummary,
} from '../../api/goods'
import Header from '../../shared/components/Header'
import { hasSpringApiSession } from '../../shared/api/springApiClient'
import GoodsCards from '../goods/GoodsCards'
import GoodsCartSidePanel from '../cart/GoodsCartSidePanel'
import { publishGoodsLikeSyncUpdate } from '../goods/goodsLikeSync'
import '../goods/goods.css'
import '../goods/goods-list-ui.css'

function GoodsLikesPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [goods, setGoods] = useState<GoodsSummary[]>([])
  const [status, setStatus] = useState<'loading' | 'data' | 'error'>('loading')
  const [error, setError] = useState('')
  const [pendingLikeIds, setPendingLikeIds] = useState<Set<number>>(() => new Set())
  const loginReturnTo = `${location.pathname}${location.search}${location.hash}`

  const navigateToLogin = useCallback(() => {
    window.sessionStorage.setItem('project-cyan:login-return-to', loginReturnTo)
    navigate('/login', { state: { from: loginReturnTo } })
  }, [loginReturnTo, navigate])

  const loadLikedGoods = useCallback(async () => {
    setStatus('loading')
    setError('')

    try {
      if (!(await hasSpringApiSession())) {
        navigateToLogin()
        return
      }

      setGoods(await fetchLikedGoods())
      setStatus('data')
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '찜한 굿즈를 불러오지 못했습니다.')
      setStatus('error')
    }
  }, [navigateToLogin])

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadLikedGoods()
    }, 0)

    return () => window.clearTimeout(timerId)
  }, [loadLikedGoods])

  const openGoodsDetail = useCallback((event: MouseEvent<HTMLAnchorElement>, goodsId: number) => {
    event.preventDefault()
    navigate(`/goods/${goodsId}`, { state: { goodsListUrl: '/likes/goods' } })
  }, [navigate])

  async function handleLikeToggle(item: GoodsSummary) {
    const goodsId = item.goodsId
    setPendingLikeIds((currentIds) => new Set(currentIds).add(goodsId))
    setError('')

    try {
      const result = await removeGoodsLike(goodsId)
      publishGoodsLikeSyncUpdate({
        goodsId,
        liked: result.liked,
        likeCount: result.likeCount,
      })
      setGoods((currentGoods) => (
        result.liked
          ? currentGoods.map((goodsItem) => (
            goodsItem.goodsId === goodsId
              ? { ...goodsItem, likeCount: result.likeCount }
              : goodsItem
          ))
          : currentGoods.filter((goodsItem) => goodsItem.goodsId !== goodsId)
      ))
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : '찜 해제를 처리하지 못했습니다.')
    } finally {
      setPendingLikeIds((currentIds) => {
        const nextIds = new Set(currentIds)
        nextIds.delete(goodsId)
        return nextIds
      })
    }
  }

  return (
    <main className="goods-page goods-likes-page">
      <Header />

      <section className="goods-content goods-likes-content">
        <div className="result-summary">
          <div>
            <h2>찜한 굿즈</h2>
            <p>하트로 저장한 굿즈를 최신순으로 모아봅니다.</p>
          </div>
          <div className="result-controls">
            <Link className="detail-action" to="/goods">굿즈 계속 보기</Link>
          </div>
        </div>

        {error && (
          <div className="goods-state error-state" role="alert">
            <strong>찜한 굿즈를 확인하지 못했습니다.</strong>
            <span>{error}</span>
            <button type="button" onClick={() => void loadLikedGoods()}>다시 불러오기</button>
          </div>
        )}

        {!error && status === 'loading' && (
          <div className="goods-state">찜한 굿즈를 불러오는 중입니다...</div>
        )}

        {!error && status === 'data' && goods.length === 0 && (
          <div className="goods-state">
            <strong>아직 찜한 굿즈가 없습니다.</strong>
            <span>상품 카드의 하트를 누르면 이곳에 저장됩니다.</span>
            <Link className="detail-action" to="/goods">굿즈 보러가기</Link>
          </div>
        )}

        {!error && status === 'data' && goods.length > 0 && (
          <GoodsCards
            items={goods}
            viewMode="grid"
            isLiked={() => true}
            isLikePending={(goodsId) => pendingLikeIds.has(goodsId)}
            toggleLike={handleLikeToggle}
            onOpenDetail={openGoodsDetail}
          />
        )}
      </section>

      <GoodsCartSidePanel />
    </main>
  )
}

export default GoodsLikesPage
