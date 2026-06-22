import { useEffect, useState } from 'react'
import { fetchGoodsDetail, type GoodsSummary } from '../../api/goods'

export type FavoriteGoodsStatus = 'idle' | 'loading' | 'data' | 'error'

export function useFavoriteGoods(active: boolean, favoriteIds: number[]) {
  const [goods, setGoods] = useState<GoodsSummary[]>([])
  const [status, setStatus] = useState<FavoriteGoodsStatus>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!active || favoriteIds.length === 0) return undefined

    const controller = new AbortController()
    Promise.resolve()
      .then(() => {
        if (controller.signal.aborted) return []
        setStatus('loading')
        setError('')
        return Promise.all(
          favoriteIds.map((goodsId) => fetchGoodsDetail(goodsId, { signal: controller.signal })),
        )
      })
      .then((items) => {
        if (controller.signal.aborted) return
        setGoods(items)
        setStatus('data')
      })
      .catch((loadError) => {
        if (loadError instanceof DOMException && loadError.name === 'AbortError') return
        setError(loadError instanceof Error ? loadError.message : 'Failed to load favorite goods.')
        setStatus('error')
      })

    return () => controller.abort()
  }, [active, favoriteIds])

  return { goods, status, error }
}
