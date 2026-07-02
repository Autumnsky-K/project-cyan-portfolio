import { useLayoutEffect, useRef } from 'react'
import type { DetailStatus } from './useGoodsDetail'

export function useDetailScrollRestore(
  goodsId: string | undefined,
  search: string,
  status: DetailStatus,
  loadedGoodsId: number | undefined,
) {
  const pendingScrollRestoreRef = useRef<number | null>(null)
  const scrollRestoreTimerRef = useRef<number | null>(null)

  useLayoutEffect(() => {
    const rawScrollY = new URLSearchParams(search).get('_detailScroll')
    const scrollY = rawScrollY === null ? null : Number(rawScrollY)
    pendingScrollRestoreRef.current = Number.isFinite(scrollY) && scrollY !== null
      ? Math.max(scrollY, 0)
      : null

    if (pendingScrollRestoreRef.current === null) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }
  }, [goodsId, search])

  useLayoutEffect(() => {
    if (
      status !== 'data'
      || String(loadedGoodsId) !== goodsId
      || pendingScrollRestoreRef.current === null
    ) {
      return
    }

    const scrollY = pendingScrollRestoreRef.current
    pendingScrollRestoreRef.current = null
    scrollRestoreTimerRef.current = window.setTimeout(() => {
      window.scrollTo({ top: scrollY, left: 0, behavior: 'auto' })
      const cleanUrl = new URL(window.location.href)
      cleanUrl.searchParams.delete('_detailScroll')
      window.history.replaceState(
        window.history.state,
        '',
        `${cleanUrl.pathname}${cleanUrl.search}`,
      )
      scrollRestoreTimerRef.current = null
    }, 200)

    return () => {
      if (scrollRestoreTimerRef.current !== null) {
        window.clearTimeout(scrollRestoreTimerRef.current)
        scrollRestoreTimerRef.current = null
      }
    }
  }, [goodsId, loadedGoodsId, status])
}
