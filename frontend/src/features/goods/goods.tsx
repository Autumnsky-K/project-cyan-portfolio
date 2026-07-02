import { useCallback, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import GoodsCartSidePanel from '../cart/GoodsCartSidePanel'
import GoodsAllSection from './GoodsAllSection'
import type { GoodsSelectedFilters } from './GoodsFilterUi'
import { useGoodsFilters } from './useGoodsFilters'
import { useGoodsLikeState } from './useGoodsLikeState'
import { useGoodsListEffects } from './useGoodsListEffects'
import { useGoodsListData } from './useGoodsListData'
import { useGoodsListQueryState } from './useGoodsListQueryState'
import { useGoodsScrollRestoration } from './useGoodsScrollRestoration'
import './goods.css'
import './goods-list-ui.css'
import Header from '../../shared/components/Header'

function GoodsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const {
    query,
    setQuery,
    sort,
    setSort,
    viewPeriod,
    setViewPeriod,
    page,
    setPage,
    viewMode,
    setViewMode,
    selectedFilters,
    setSelectedFilters,
    recommendedGoodsIds,
    clearRecommendations,
    requestParams,
    pendingHistoryScrollY,
    clearPendingHistoryScroll,
    toggleFilter,
    reset,
    commitSearch,
    goToPage,
  } = useGoodsListQueryState()
  const { filters, filterStatus } = useGoodsFilters()
  const {
    goods,
    status,
    error,
    totalElements,
    totalPages,
    currentPage,
    retry: retryGoods,
  } = useGoodsListData(requestParams, page)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [emptyResultsMinHeight, setEmptyResultsMinHeight] = useState(0)
  const resultsStartRef = useRef<HTMLDivElement | null>(null)
  const searchToolbarRef = useRef<HTMLElement | null>(null)
  const goodsResultsRef = useRef<HTMLDivElement | null>(null)
  const searchScrollPositionRef = useRef<number | null>(null)
  const openGoodsDetail = useGoodsScrollRestoration(status)
  const loginReturnTo = `${location.pathname}${location.search}${location.hash}`

  const navigateToLogin = useCallback(() => {
    window.sessionStorage.setItem('project-cyan:login-return-to', loginReturnTo)
    navigate('/login', { state: { from: loginReturnTo } })
  }, [loginReturnTo, navigate])
  const {
    visibleGoods,
    isLiked,
    isLikePending,
    handleLikeToggle,
  } = useGoodsLikeState(goods, navigateToLogin)

  function resetFilters() {
    reset()
  }

  function applyMobileFilters(nextFilters: GoodsSelectedFilters) {
    setPage(0)
    setSelectedFilters(nextFilters)
    scrollToResults()
  }

  const hasGoods = goods.length > 0
  const isViewCountSort = sort === 'viewCount,desc'
  const navigateToCleanGoodsList = useCallback(() => {
    navigate('/goods', { replace: true, state: null })
  }, [navigate])
  const {
    rememberSearchScrollPosition,
    scrollToPageTop,
    scrollToResults,
  } = useGoodsListEffects({
    clearPendingHistoryScroll,
    goodsIdCount: goods.length,
    goodsResultsRef,
    locationState: location.state,
    navigateToCleanGoodsList,
    pendingHistoryScrollY,
    recommendedGoodsIds,
    resetGoodsList: reset,
    resultsStartRef,
    searchScrollPositionRef,
    setEmptyResultsMinHeight,
    status,
  })

  function handleQueryChange(value: string) {
    rememberSearchScrollPosition()
    setPage(0)
    setQuery(value)
  }

  function handleSortChange(nextSort: string) {
    setPage(0)
    setSort(nextSort)
  }

  function handleViewPeriodChange(nextViewPeriod: string) {
    setPage(0)
    setViewPeriod(nextViewPeriod)
  }

  function handlePageChange(nextPage: number) {
    goToPage(nextPage)
    scrollToPageTop()
  }

  const searchSuggestions = useMemo(() => {
    const values = [
      ...goods.flatMap((item) => [item.name, item.artistName, item.categoryName, ...(item.tags ?? [])]),
      ...filters.flatMap((group) => group.options.map((option) => option.label)),
    ].filter((value): value is string => Boolean(value?.trim()))

    return [...new Map(values.map((value) => [value.toLocaleLowerCase(), value])).values()]
  }, [filters, goods])

  const closeMobileFilters = useCallback(() => setIsMobileFilterOpen(false), [])

  return (
    <main className="goods-page">
      <Header />

      <GoodsAllSection
        clearRecommendations={clearRecommendations}
        currentPage={currentPage}
        emptyResultsMinHeight={emptyResultsMinHeight}
        error={error}
        filterStatus={filterStatus}
        filters={filters}
        goodsResultsRef={goodsResultsRef}
        hasGoods={hasGoods}
        isLiked={isLiked}
        isLikePending={isLikePending}
        isMobileFilterOpen={isMobileFilterOpen}
        isViewCountSort={isViewCountSort}
        onApplyMobileFilters={applyMobileFilters}
        onCloseMobileFilters={closeMobileFilters}
        onOpenDetail={openGoodsDetail}
        onOpenMobileFilters={() => setIsMobileFilterOpen(true)}
        onPageChange={handlePageChange}
        onQueryChange={handleQueryChange}
        onResetFilters={resetFilters}
        onRetryGoods={retryGoods}
        onSearchCommit={commitSearch}
        onSortChange={handleSortChange}
        onToggleFilter={toggleFilter}
        onToggleLike={handleLikeToggle}
        onViewModeChange={setViewMode}
        onViewPeriodChange={handleViewPeriodChange}
        query={query}
        recommendedGoodsIds={recommendedGoodsIds}
        resultsStartRef={resultsStartRef}
        searchSuggestions={searchSuggestions}
        searchToolbarRef={searchToolbarRef}
        selectedFilters={selectedFilters}
        sort={sort}
        status={status}
        totalElements={totalElements}
        totalPages={totalPages}
        viewMode={viewMode}
        viewPeriod={viewPeriod}
        visibleGoods={visibleGoods}
      />
      <GoodsCartSidePanel />
    </main>
  )
}

export default GoodsPage
