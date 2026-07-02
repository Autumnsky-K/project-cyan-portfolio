import { useEffect, useMemo, useRef, useState } from 'react'
import {
  fetchGoods,
  type GoodsQueryParams,
  type GoodsSummary,
  type PageResponse,
} from '../../api/goods'

export type LoadStatus = 'loading' | 'refreshing' | 'data' | 'empty' | 'error'

export function useGoodsListData(requestParams: GoodsQueryParams, page: number) {
  const [goodsPage, setGoodsPage] = useState<PageResponse<GoodsSummary> | null>(null)
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [error, setError] = useState('')
  const [retryKey, setRetryKey] = useState(0)
  const hasLoadedGoodsRef = useRef(false)

  useEffect(() => {
    const controller = new AbortController()

    async function loadGoods() {
      setStatus((currentStatus) =>
        hasLoadedGoodsRef.current && currentStatus !== 'empty' ? 'refreshing' : 'loading',
      )
      setError('')

      try {
        const data = await fetchGoods(requestParams, { signal: controller.signal })
        hasLoadedGoodsRef.current = true
        setGoodsPage(data)
        setStatus(data.content?.length ? 'data' : 'empty')
      } catch (loadError) {
        if (loadError instanceof Error && loadError.name === 'AbortError') {
          return
        }
        setError(loadError instanceof Error ? loadError.message : '굿즈를 불러오지 못했습니다.')
        setStatus('error')
      }
    }

    loadGoods()

    return () => {
      controller.abort()
    }
  }, [requestParams, retryKey])

  const goods = useMemo(() => goodsPage?.content ?? [], [goodsPage])
  const totalElements = goodsPage?.totalElements ?? 0
  const totalPages = goodsPage?.totalPages ?? 0
  const currentPage = goodsPage?.page ?? goodsPage?.number ?? page

  return {
    goods,
    goodsPage,
    status,
    error,
    totalElements,
    totalPages,
    currentPage,
    retry: () => setRetryKey((value) => value + 1),
  }
}
