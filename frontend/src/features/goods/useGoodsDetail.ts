import { useEffect, useState } from 'react'
import {
  fetchGoodsDetail,
  recordGoodsView,
  type GoodsDetail,
} from '../../api/goods'

export type DetailStatus = 'loading' | 'data' | 'error'

export function useGoodsDetail(goodsId: string | undefined) {
  const [goods, setGoods] = useState<GoodsDetail | null>(null)
  const [status, setStatus] = useState<DetailStatus>('loading')
  const [error, setError] = useState('')

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
        void recordGoodsView(detail.goodsId).catch(() => undefined)
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === 'AbortError') return
        setError(loadError instanceof Error ? loadError.message : '상품 정보를 불러오지 못했습니다.')
        setStatus('error')
      }
    }

    loadGoodsDetail()
    return () => controller.abort()
  }, [goodsId])

  return { goods, setGoods, status, error }
}
