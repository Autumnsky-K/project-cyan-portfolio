import { useEffect, useState } from 'react'
import { fetchGoods, type GoodsSummary } from '../../api/goods'

export type FavoriteGoodsStatus = 'idle' | 'loading' | 'data' | 'error'

export function useFavoriteGoods(
  active: boolean,
  favoriteIds: number[],
  retainFavorites: (existingGoodsIds: number[]) => void,
) {
  const [goods, setGoods] = useState<GoodsSummary[]>([])
  const [status, setStatus] = useState<FavoriteGoodsStatus>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!active) return undefined
    if (favoriteIds.length === 0) {
      return undefined
    }

    const controller = new AbortController()
    async function loadFavorites() {
      setStatus('loading')
      setError('')

      try {
        const response = await fetchGoods(
          {
            goodsIds: favoriteIds.join(','),
            page: 0,
            size: Math.min(favoriteIds.length, 100),
          },
          { signal: controller.signal },
        )
        if (controller.signal.aborted) return

        const goodsById = new Map(response.content.map((item) => [item.goodsId, item]))
        const orderedGoods = favoriteIds.flatMap((goodsId) => {
          const item = goodsById.get(goodsId)
          return item ? [item] : []
        })
        setGoods(orderedGoods)
        retainFavorites(orderedGoods.map((item) => item.goodsId))
        setStatus('data')
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === 'AbortError') return
        setError(loadError instanceof Error ? loadError.message : 'Failed to load favorite goods.')
        setStatus('error')
      }
    }

    loadFavorites()

    return () => controller.abort()
  }, [active, favoriteIds, retainFavorites])

  return favoriteIds.length === 0
    ? { goods: [], status: 'idle' as const, error: '' }
    : { goods, status, error }
}
