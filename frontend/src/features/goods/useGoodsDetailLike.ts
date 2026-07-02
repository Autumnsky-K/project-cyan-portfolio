import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import {
  addGoodsLike,
  fetchMyGoodsLike,
  removeGoodsLike,
  type GoodsDetail,
} from '../../api/goods'
import { hasSpringApiSession } from '../../shared/api/springApiClient'
import { publishGoodsLikeSyncUpdate } from './goodsLikeSync'

export function useGoodsDetailLike(
  goods: GoodsDetail | null,
  goodsId: string | undefined,
  setGoods: Dispatch<SetStateAction<GoodsDetail | null>>,
  navigateToLogin: () => void,
) {
  const [isLiked, setIsLiked] = useState(false)
  const [isLikePending, setIsLikePending] = useState(false)
  const [likeFeedback, setLikeFeedback] = useState('')
  const likeFeedbackTimerRef = useRef<number | null>(null)

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
  }, [goods, isLiked, navigateToLogin, setGoods])

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
  }, [goodsId, setGoods])

  useEffect(
    () => () => {
      if (likeFeedbackTimerRef.current !== null) {
        window.clearTimeout(likeFeedbackTimerRef.current)
      }
    },
    [],
  )

  return {
    isLiked,
    isLikePending,
    likeFeedback,
    handleLikeToggle,
  }
}
