import { type MouseEvent, useCallback, useLayoutEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

function takePendingScrollRestore() {
  const rawScrollY = new URLSearchParams(window.location.search).get('_scroll')
  if (rawScrollY === null) return null
  const scrollY = Number(rawScrollY)
  return Number.isFinite(scrollY) && scrollY >= 0 ? scrollY : null
}

function storePendingScrollRestore() {
  const url = new URL(window.location.href)
  url.searchParams.set('_scroll', String(Math.round(window.scrollY)))
  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}`)
}

export function useGoodsScrollRestoration(status: string) {
  const navigate = useNavigate()
  const pendingScrollRef = useRef<number | null>(takePendingScrollRestore())
  const restoreTimerRef = useRef<number | null>(null)

  useLayoutEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    if (pendingScrollRef.current === null) window.scrollTo({ top: 0, left: 0 })

    return () => {
      window.history.scrollRestoration = previousScrollRestoration
    }
  }, [])

  useLayoutEffect(() => {
    if (pendingScrollRef.current === null || status === 'loading' || status === 'refreshing') return

    const scrollY = pendingScrollRef.current
    pendingScrollRef.current = null
    restoreTimerRef.current = window.setTimeout(() => {
      window.scrollTo({ top: scrollY, left: 0, behavior: 'auto' })
      restoreTimerRef.current = null
    }, 200)

    return () => {
      if (restoreTimerRef.current !== null) window.clearTimeout(restoreTimerRef.current)
    }
  }, [status])

  return useCallback((event: MouseEvent<HTMLAnchorElement>, goodsId: number) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

    event.preventDefault()
    storePendingScrollRestore()
    navigate(`/goods/${goodsId}`, { state: { fromGoods: true } })
  }, [navigate])
}
