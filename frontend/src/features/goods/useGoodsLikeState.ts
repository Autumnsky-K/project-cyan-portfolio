import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  addGoodsLike,
  fetchMyGoodsLike,
  removeGoodsLike,
  type GoodsSummary,
} from '../../api/goods'
import { hasSpringApiSession } from '../../shared/api/springApiClient'
import {
  clearGoodsLikeSyncUpdates,
  publishGoodsLikeSyncUpdate,
  readGoodsLikeSyncUpdates,
  subscribeGoodsLikeSyncUpdates,
  type GoodsLikeSyncUpdate,
} from './goodsLikeSync'

export function useGoodsLikeState(
  goods: GoodsSummary[],
  favoriteGoods: GoodsSummary[],
  navigateToLogin: () => void,
) {
  const [likedGoodsIds, setLikedGoodsIds] = useState<Set<number>>(() => new Set())
  const [pendingLikeIds, setPendingLikeIds] = useState<Set<number>>(() => new Set())
  const [likeCountOverrides, setLikeCountOverrides] = useState<Record<number, number>>({})

  const updateGoodsLikeCount = useCallback((goodsId: number, likeCount: number) => {
    setLikeCountOverrides((currentCounts) => ({ ...currentCounts, [goodsId]: likeCount }))
  }, [])

  const applyGoodsLikeUpdate = useCallback((update: GoodsLikeSyncUpdate) => {
    setLikedGoodsIds((currentIds) => {
      const nextIds = new Set(currentIds)
      if (update.liked) {
        nextIds.add(update.goodsId)
      } else {
        nextIds.delete(update.goodsId)
      }
      return nextIds
    })
    updateGoodsLikeCount(update.goodsId, update.likeCount)
  }, [updateGoodsLikeCount])

  const handleLikeToggle = useCallback(async (item: GoodsSummary) => {
    if (!(await hasSpringApiSession())) {
      navigateToLogin()
      return
    }

    const goodsId = item.goodsId
    setPendingLikeIds((currentIds) => new Set(currentIds).add(goodsId))

    try {
      const knownLiked = likedGoodsIds.has(goodsId)
      const currentLike = knownLiked ? { liked: true, likeCount: Number(item.likeCount ?? 0) } : await fetchMyGoodsLike(goodsId)
      const result = currentLike?.liked
        ? await removeGoodsLike(goodsId)
        : await addGoodsLike(goodsId)

      setLikedGoodsIds((currentIds) => {
        const nextIds = new Set(currentIds)
        if (result.liked) {
          nextIds.add(goodsId)
        } else {
          nextIds.delete(goodsId)
        }
        return nextIds
      })
      updateGoodsLikeCount(goodsId, result.likeCount)
      publishGoodsLikeSyncUpdate({
        goodsId,
        liked: result.liked,
        likeCount: result.likeCount,
      })
    } finally {
      setPendingLikeIds((currentIds) => {
        const nextIds = new Set(currentIds)
        nextIds.delete(goodsId)
        return nextIds
      })
    }
  }, [likedGoodsIds, navigateToLogin, updateGoodsLikeCount])

  useEffect(() => {
    readGoodsLikeSyncUpdates().forEach(applyGoodsLikeUpdate)
    return subscribeGoodsLikeSyncUpdates(applyGoodsLikeUpdate)
  }, [applyGoodsLikeUpdate])

  const goodsIdsKey = useMemo(() => goods.map((item) => item.goodsId).join(','), [goods])

  useEffect(() => {
    let ignore = false

    async function loadVisibleGoodsLikes() {
      try {
        if (goods.length === 0) return
        if (!(await hasSpringApiSession())) {
          if (!ignore) {
            setLikedGoodsIds(new Set())
            clearGoodsLikeSyncUpdates()
          }
          return
        }

        const likeResults = await Promise.all(
          goods.map((item) => fetchMyGoodsLike(item.goodsId).catch(() => null)),
        )
        if (ignore) return

        setLikedGoodsIds((currentIds) => {
          const nextIds = new Set(currentIds)
          likeResults.forEach((like, index) => {
            const goodsId = goods[index]?.goodsId
            if (!goodsId) return
            if (like?.liked) {
              nextIds.add(goodsId)
            } else {
              nextIds.delete(goodsId)
            }
          })
          return nextIds
        })
        setLikeCountOverrides((currentCounts) => {
          const nextCounts = { ...currentCounts }
          likeResults.forEach((like, index) => {
            const goodsId = goods[index]?.goodsId
            if (!goodsId || like?.likeCount === undefined) return
            nextCounts[goodsId] = like.likeCount
          })
          return nextCounts
        })
      } catch {
        // 좋아요 상태 조회 실패는 목록 렌더링을 막지 않는다.
      }
    }

    void loadVisibleGoodsLikes()

    return () => {
      ignore = true
    }
  }, [goods, goodsIdsKey])

  const visibleGoods = useMemo(
    () => goods.map((item) => (
      likeCountOverrides[item.goodsId] === undefined
        ? item
        : { ...item, likeCount: likeCountOverrides[item.goodsId] }
    )),
    [goods, likeCountOverrides],
  )
  const visibleFavoriteGoods = useMemo(
    () => favoriteGoods.map((item) => (
      likeCountOverrides[item.goodsId] === undefined
        ? item
        : { ...item, likeCount: likeCountOverrides[item.goodsId] }
    )),
    [favoriteGoods, likeCountOverrides],
  )

  return {
    visibleGoods,
    visibleFavoriteGoods,
    isLiked: (goodsId: number) => likedGoodsIds.has(goodsId),
    isLikePending: (goodsId: number) => pendingLikeIds.has(goodsId),
    handleLikeToggle,
  }
}
