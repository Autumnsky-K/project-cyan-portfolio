import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  addGoodsFavorite,
  fetchFavoriteGoods,
  removeGoodsFavorite,
  type GoodsSummary,
} from '../../api/goods'
import { hasSpringApiSession } from '../../shared/api/springApiClient'

export type FavoriteGoodsStatus = 'idle' | 'loading' | 'data' | 'error' | 'signedOut'

export function useGoodsFavorites() {
  const [favoriteGoods, setFavoriteGoods] = useState<GoodsSummary[]>([])
  const [status, setStatus] = useState<FavoriteGoodsStatus>('idle')
  const [error, setError] = useState('')
  const favoriteIds = useMemo(() => favoriteGoods.map((item) => item.goodsId), [favoriteGoods])
  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds])

  const loadFavorites = useCallback(async (ignoreAbort = false) => {
    setError('')
    if (!(await hasSpringApiSession())) {
      setFavoriteGoods([])
      setStatus('idle')
      return
    }

    setStatus('loading')
    try {
      const goods = await fetchFavoriteGoods()
      if (ignoreAbort) return
      setFavoriteGoods(goods)
      setStatus('data')
    } catch (loadError) {
      if (ignoreAbort) return
      setError(loadError instanceof Error ? loadError.message : 'Failed to load favorite goods.')
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    let ignore = false
    void loadFavorites(ignore)

    return () => {
      ignore = true
    }
  }, [loadFavorites])

  const toggleFavorite = useCallback(async (goodsId: number) => {
    if (!(await hasSpringApiSession())) {
      return false
    }

    const wasFavorite = favoriteIdSet.has(goodsId)
    const previousGoods = favoriteGoods
    setError('')

    setFavoriteGoods((current) =>
      wasFavorite
        ? current.filter((item) => item.goodsId !== goodsId)
        : current,
    )

    try {
      if (wasFavorite) {
        await removeGoodsFavorite(goodsId)
        return true
      }

      await addGoodsFavorite(goodsId)
      await loadFavorites()
      return true
    } catch (favoriteError) {
      setFavoriteGoods(previousGoods)
      setError(favoriteError instanceof Error ? favoriteError.message : 'Failed to update favorite goods.')
      setStatus('error')
      return true
    }
  }, [favoriteGoods, favoriteIdSet, loadFavorites])

  return {
    favoriteIds,
    favoriteGoods,
    favoritesStatus: status,
    favoritesError: error,
    isFavorite: (goodsId: number) => favoriteIdSet.has(goodsId),
    toggleFavorite,
    refreshFavorites: loadFavorites,
  }
}
