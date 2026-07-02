import { useCallback, useEffect, useLayoutEffect, type RefObject } from 'react'
import type { LoadStatus } from './useGoodsListData'

type UseGoodsListEffectsArgs = {
  clearPendingHistoryScroll: () => void
  goodsIdCount: number
  goodsResultsRef: RefObject<HTMLDivElement | null>
  locationState: unknown
  navigateToCleanGoodsList: () => void
  pendingHistoryScrollY: number | null
  recommendedGoodsIds: string[]
  resetGoodsList: () => void
  resultsStartRef: RefObject<HTMLDivElement | null>
  searchScrollPositionRef: RefObject<number | null>
  setEmptyResultsMinHeight: (height: number) => void
  status: LoadStatus
}

export function useGoodsListEffects({
  clearPendingHistoryScroll,
  goodsIdCount,
  goodsResultsRef,
  locationState,
  navigateToCleanGoodsList,
  pendingHistoryScrollY,
  recommendedGoodsIds,
  resetGoodsList,
  resultsStartRef,
  searchScrollPositionRef,
  setEmptyResultsMinHeight,
  status,
}: UseGoodsListEffectsArgs) {
  useLayoutEffect(() => {
    if (status !== 'empty' || searchScrollPositionRef.current === null) {
      return
    }

    window.scrollTo({ top: searchScrollPositionRef.current })
    searchScrollPositionRef.current = null
  }, [searchScrollPositionRef, status])

  useLayoutEffect(() => {
    if (pendingHistoryScrollY === null || status === 'loading' || status === 'refreshing') {
      return
    }

    const animationFrameId = window.requestAnimationFrame(() => {
      window.scrollTo({ top: pendingHistoryScrollY, left: 0, behavior: 'auto' })
      clearPendingHistoryScroll()
    })

    return () => window.cancelAnimationFrame(animationFrameId)
  }, [clearPendingHistoryScroll, pendingHistoryScrollY, status])

  useEffect(() => {
    const resetToken = (locationState as { resetGoodsList?: number } | null)?.resetGoodsList
    if (!resetToken) return

    resetGoodsList()
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    })
    navigateToCleanGoodsList()
  }, [locationState, navigateToCleanGoodsList, resetGoodsList])

  useEffect(() => {
    if (status !== 'data' || recommendedGoodsIds.length < 2) return undefined

    const highlightedElements: HTMLElement[] = []
    const frameId = window.requestAnimationFrame(() => {
      recommendedGoodsIds.forEach((goodsId) => {
        const element = document.querySelector<HTMLElement>(`[data-goods-id="${goodsId}"]`)
        if (!element) return
        element.classList.add('vtuber-action-highlight')
        highlightedElements.push(element)
      })
      highlightedElements[0]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      })
    })
    const timerId = window.setTimeout(() => {
      highlightedElements.forEach((element) => {
        element.classList.remove('vtuber-action-highlight')
      })
    }, 2200)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.clearTimeout(timerId)
      highlightedElements.forEach((element) => {
        element.classList.remove('vtuber-action-highlight')
      })
    }
  }, [recommendedGoodsIds, status])

  const scrollToResults = useCallback((behavior: ScrollBehavior = 'smooth') => {
    window.requestAnimationFrame(() => {
      resultsStartRef.current?.scrollIntoView({ behavior, block: 'start' })
    })
  }, [resultsStartRef])

  const rememberSearchScrollPosition = useCallback(() => {
    searchScrollPositionRef.current = window.scrollY
    if (goodsIdCount > 0 && goodsResultsRef.current) {
      setEmptyResultsMinHeight(goodsResultsRef.current.offsetHeight)
    }
  }, [goodsIdCount, goodsResultsRef, searchScrollPositionRef, setEmptyResultsMinHeight])

  const scrollToPageTop = useCallback(() => {
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    })
  }, [])

  return {
    rememberSearchScrollPosition,
    scrollToPageTop,
    scrollToResults,
  }
}
