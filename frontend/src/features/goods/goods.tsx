import { type ChangeEvent, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import GoodsCartSidePanel from '../cart/GoodsCartSidePanel'
import GoodsCards from './GoodsCards'
import GoodsFilterUi, { GoodsActiveFilterChips, type GoodsSelectedFilters } from './GoodsFilterUi'
import GoodsListState, { GoodsCardSkeleton } from './GoodsListState'
import GoodsPagination from './GoodsPagination'
import GoodsSearchAutocomplete from './GoodsSearchAutocomplete'
import GoodsViewToggle from './GoodsViewToggle'
import { useGoodsFilters } from './useGoodsFilters'
import { useGoodsLikeState } from './useGoodsLikeState'
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

  useLayoutEffect(() => {
    if (status !== 'empty' || searchScrollPositionRef.current === null) {
      return
    }

    window.scrollTo({ top: searchScrollPositionRef.current })
    searchScrollPositionRef.current = null
  }, [status])

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
    const resetToken = (location.state as { resetGoodsList?: number } | null)?.resetGoodsList
    if (!resetToken) return

    reset()
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    })
    navigate('/goods', { replace: true, state: null })
  }, [location.state, navigate, reset])

  const scrollToResults = useCallback((behavior: ScrollBehavior = 'smooth') => {
    window.requestAnimationFrame(() => {
      resultsStartRef.current?.scrollIntoView({ behavior, block: 'start' })
    })
  }, [])

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

  function handleQueryChange(value: string) {
    searchScrollPositionRef.current = window.scrollY
    if (goods.length > 0 && goodsResultsRef.current) {
      setEmptyResultsMinHeight(goodsResultsRef.current.offsetHeight)
    }
    setPage(0)
    setQuery(value)
  }

  function handleSortChange(event: ChangeEvent<HTMLSelectElement>) {
    setPage(0)
    setSort(event.target.value)
  }

  function handleViewPeriodChange(event: ChangeEvent<HTMLSelectElement>) {
    setPage(0)
    setViewPeriod(event.target.value)
  }

  function handlePageChange(nextPage: number) {
    goToPage(nextPage)
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    })
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

      <section className="store-toolbar" ref={searchToolbarRef} aria-label="굿즈 검색 및 정렬">
        <GoodsSearchAutocomplete
          query={query}
          suggestions={searchSuggestions}
          onQueryChange={handleQueryChange}
          onSearchCommit={commitSearch}
        />
        <label className="sort-field">
          <span>정렬</span>
          <select value={sort} onChange={handleSortChange}>
            <option value="createdAt,desc">최신순</option>
            <option value="viewCount,desc">조회순</option>
            <option value="likeCount,desc">좋아요순</option>
            <option value="price,asc">낮은 가격순</option>
            <option value="price,desc">높은 가격순</option>
            <option value="goodsName,asc">이름순</option>
          </select>
        </label>
      </section>

      <section className="store-layout" id="goods">
        <GoodsFilterUi
          groups={filters}
          filterStatus={filterStatus}
          selectedFilters={selectedFilters}
          isMobileOpen={isMobileFilterOpen}
          onCloseMobile={closeMobileFilters}
          onOpenMobile={() => setIsMobileFilterOpen(true)}
          onApplyMobile={applyMobileFilters}
          onReset={resetFilters}
          onToggle={toggleFilter}
        />

        <div className="goods-content">
          {recommendedGoodsIds.length >= 2 && (
            <div className="active-filter-bar" role="status">
              <span className="active-filter-label">
                AI 추천 상품 {recommendedGoodsIds.length}개
              </span>
              <button type="button" onClick={clearRecommendations}>전체 상품 보기</button>
            </div>
          )}
          <GoodsActiveFilterChips
            groups={filters}
            selectedFilters={selectedFilters}
            onRemoveFilter={toggleFilter}
          />
          <div className="result-summary" ref={resultsStartRef}>
            <div>
              <p>
                {status === 'loading'
                  ? '굿즈를 불러오는 중'
                  : status === 'refreshing'
                    ? `총 ${totalElements}개의 상품`
                  : `총 ${totalElements}개의 상품`}
              </p>
            </div>
            <div className="result-controls">
              <label className="view-period-field" aria-hidden={!isViewCountSort} data-visible={isViewCountSort}>
                <span>조회 기간</span>
                <select
                  value={viewPeriod}
                  tabIndex={isViewCountSort ? undefined : -1}
                  onChange={handleViewPeriodChange}
                >
                  <option value="all">전체</option>
                  <option value="day">최근 24시간</option>
                  <option value="7d">최근 7일</option>
                  <option value="30d">최근 30일</option>
                </select>
              </label>
              <GoodsViewToggle
                label="보기 방식"
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>
          </div>

          <div
            className="goods-results"
            ref={goodsResultsRef}
            style={status === 'empty' ? { minHeight: emptyResultsMinHeight } : undefined}
          >
            {status === 'loading' && !hasGoods && <GoodsCardSkeleton />}

            {status === 'error' && (
              <GoodsListState kind="error" message={error} onAction={retryGoods} />
            )}

            {status === 'empty' && !hasGoods && <GoodsListState kind="empty" onAction={resetFilters} />}

            {hasGoods && (
              <div data-refreshing={status === 'refreshing'}>
                <GoodsCards
                  items={visibleGoods}
                  viewMode={viewMode}
                  isLiked={isLiked}
                  isLikePending={isLikePending}
                  toggleLike={handleLikeToggle}
                  onOpenDetail={openGoodsDetail}
                />
              </div>
            )}
          </div>

          <GoodsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </section>
      <GoodsCartSidePanel />
    </main>
  )
}

export default GoodsPage
