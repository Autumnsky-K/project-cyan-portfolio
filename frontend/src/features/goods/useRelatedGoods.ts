import { useEffect, useState } from 'react'
import { fetchRelatedGoods, type GoodsSummary } from '../../api/goods'

export function useRelatedGoods(goodsId: string | undefined) {
  const [relatedGoods, setRelatedGoods] = useState<GoodsSummary[]>([])

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

  return relatedGoods
}
