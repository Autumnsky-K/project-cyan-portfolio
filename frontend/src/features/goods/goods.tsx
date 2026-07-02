import { type ChangeEvent, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  addGoodsLike,
  fetchGoods,
  fetchGoodsFilters,
  fetchMyGoodsLike,
  removeGoodsLike,
  type GoodsFilterOption,
  type GoodsSummary,
  type PageResponse,
} from '../../api/goods'
import { hasSpringApiSession } from '../../shared/api/springApiClient'
import GoodsCartSidePanel from '../cart/GoodsCartSidePanel'
import GoodsCards from './GoodsCards'
import GoodsFilterUi, { GoodsActiveFilterChips, type GoodsFilterGroup, type GoodsSelectedFilters } from './GoodsFilterUi'
import GoodsListState, { GoodsCardSkeleton } from './GoodsListState'
import GoodsPagination from './GoodsPagination'
import GoodsSearchAutocomplete from './GoodsSearchAutocomplete'
import { useGoodsFavorites } from './useGoodsFavorites'
import { useGoodsListQueryState } from './useGoodsListQueryState'
import { useGoodsScrollRestoration } from './useGoodsScrollRestoration'
import './goods.css'
import './goods-list-ui.css'
import Header from '../../shared/components/Header'

type LoadStatus = 'loading' | 'refreshing' | 'data' | 'empty' | 'error'
type FilterStatus = 'loading' | 'data' | 'error'
function uniqueFilterOptions(options: GoodsFilterOption[] = []) {
  return [...new Map(
    options.map((option) => [option.label.trim().toLocaleLowerCase(), option]),
  ).values()]
}

function GoodsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const {
    favoriteIds,
    favoriteGoods,
    favoritesStatus,
    favoritesError,
    refreshFavorites,
  } = useGoodsFavorites()
  const {
    query,
    setQuery,
    sort,
    setSort,
    viewPeriod,
    setViewPeriod,
    page,
    setPage,
    section: activeSection,
    setSection: setActiveSection,
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
  const [filters, setFilters] = useState<GoodsFilterGroup[]>([])
  const [goodsPage, setGoodsPage] = useState<PageResponse<GoodsSummary> | null>(null)
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('loading')
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const [emptyResultsMinHeight, setEmptyResultsMinHeight] = useState(0)
  const [likedGoodsIds, setLikedGoodsIds] = useState<Set<number>>(() => new Set())
  const [pendingLikeIds, setPendingLikeIds] = useState<Set<number>>(() => new Set())
  const [likeCountOverrides, setLikeCountOverrides] = useState<Record<number, number>>({})
  const hasLoadedGoodsRef = useRef(false)
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

  const updateGoodsLikeCount = useCallback((goodsId: number, likeCount: number) => {
    setLikeCountOverrides((currentCounts) => ({ ...currentCounts, [goodsId]: likeCount }))
    setGoodsPage((currentPageData) => (
      currentPageData
        ? {
            ...currentPageData,
            content: currentPageData.content.map((item) =>
              item.goodsId === goodsId ? { ...item, likeCount } : item,
            ),
          }
        : currentPageData
    ))
  }, [])

  const handleLikeToggle = useCallback(async (item: GoodsSummary) => {
    if (!(await hasSpringApiSession())) {
      navigateToLogin()
      return
    }

    const goodsId = item.goodsId
    setPendingLikeIds((currentIds) => new Set(currentIds).add(goodsId))

    try {
      const knownLiked = likedGoodsIds.has(goodsId)
      const currentLike = knownLiked ? { liked: true, likeCount: Number(item.likeCount ?? 0) } : await fetchMyGoodsLike(goodsId)
      const result = currentLike?.liked
        ? await removeGoodsLike(goodsId)
        : await addGoodsLike(goodsId)

      setLikedGoodsIds((currentIds) => {
        const nextIds = new Set(currentIds)
        if (result.liked) {
          nextIds.add(goodsId)
        } else {
          nextIds.delete(goodsId)
        }
        return nextIds
      })
      updateGoodsLikeCount(goodsId, result.likeCount)
    } finally {
      setPendingLikeIds((currentIds) => {
        const nextIds = new Set(currentIds)
        nextIds.delete(goodsId)
        return nextIds
      })
    }
  }, [likedGoodsIds, navigateToLogin, updateGoodsLikeCount])

  useEffect(() => {
    if (activeSection !== 'favorites') return

    let ignore = false
    async function redirectSignedOutFavoriteSection() {
      if (!(await hasSpringApiSession()) && !ignore) {
        navigateToLogin()
      }
    }

    void redirectSignedOutFavoriteSection()

    return () => {
      ignore = true
    }
  }, [activeSection, navigateToLogin])

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

  useEffect(() => {
    const controller = new AbortController()

    async function loadFilters() {
      setFilterStatus('loading')

      try {
        const data = await fetchGoodsFilters({ signal: controller.signal })
        setFilters([
          { title: '카테고리', param: 'categoryIds', options: uniqueFilterOptions(data.categories) },
          { title: '아티스트', param: 'artistIds', options: uniqueFilterOptions(data.artists) },
          { title: '태그', param: 'tags', options: uniqueFilterOptions(data.tags) },
        ])
        setFilterStatus('data')
      } catch (loadError) {
        if (loadError instanceof Error && loadError.name === 'AbortError') {
          return
        }
        setFilters([])
        setFilterStatus('error')
      }
    }

    loadFilters()

    return () => {
      controller.abort()
    }
  }, [])

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

  function resetFilters() {
    reset()
  }

  function applyMobileFilters(nextFilters: GoodsSelectedFilters) {
    setPage(0)
    setSelectedFilters(nextFilters)
    scrollToResults()
  }

  const goods = useMemo(() => goodsPage?.content ?? [], [goodsPage])
  const visibleGoods = useMemo(
    () => goods.map((item) => (
      likeCountOverrides[item.goodsId] === undefined
        ? item
        : { ...item, likeCount: likeCountOverrides[item.goodsId] }
    )),
    [goods, likeCountOverrides],
  )
  const visibleFavoriteGoods = useMemo(
    () => favoriteGoods.map((item) => (
      likeCountOverrides[item.goodsId] === undefined
        ? item
        : { ...item, likeCount: likeCountOverrides[item.goodsId] }
    )),
    [favoriteGoods, likeCountOverrides],
  )
  const totalElements = goodsPage?.totalElements ?? 0
  const totalPages = goodsPage?.totalPages ?? 0
  const currentPage = goodsPage?.page ?? goodsPage?.number ?? page
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

      {activeSection === 'all' && (
        <>
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
              <div className="view-toggle" aria-label="보기 방식">
                <button type="button" aria-label="그리드 보기" aria-pressed={viewMode === 'grid'} onClick={() => setViewMode('grid')}>
                  <span className="view-icon view-icon-grid" aria-hidden="true" />
                </button>
                <button type="button" aria-label="리스트 보기" aria-pressed={viewMode === 'list'} onClick={() => setViewMode('list')}>
                  <span className="view-icon view-icon-list" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          <div
            className="goods-results"
            ref={goodsResultsRef}
            style={status === 'empty' ? { minHeight: emptyResultsMinHeight } : undefined}
          >
            {status === 'loading' && !hasGoods && <GoodsCardSkeleton />}

            {status === 'error' && (
              <GoodsListState kind="error" message={error} onAction={() => setRetryKey((value) => value + 1)} />
            )}

            {status === 'empty' && !hasGoods && <GoodsListState kind="empty" onAction={resetFilters} />}

            {hasGoods && (
              <div data-refreshing={status === 'refreshing'}>
                <GoodsCards
                  items={visibleGoods}
                  viewMode={viewMode}
                  isLiked={(goodsId) => likedGoodsIds.has(goodsId)}
                  isLikePending={(goodsId) => pendingLikeIds.has(goodsId)}
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
        </>
      )}

      {activeSection === 'favorites' && (
        <section className="favorites-content" aria-labelledby="favorites-heading">
          <div className="result-summary">
            <div>
              <h2 id="favorites-heading">관심 굿즈</h2>
              <p>{favoriteIds.length}개 저장됨</p>
            </div>
            <div className="view-toggle" aria-label="관심 굿즈 보기 방식">
              <button type="button" aria-label="그리드 보기" aria-pressed={viewMode === 'grid'} onClick={() => setViewMode('grid')}>
                <span className="view-icon view-icon-grid" aria-hidden="true" />
              </button>
              <button type="button" aria-label="리스트 보기" aria-pressed={viewMode === 'list'} onClick={() => setViewMode('list')}>
                <span className="view-icon view-icon-list" aria-hidden="true" />
              </button>
            </div>
          </div>

          {favoritesStatus === 'loading' && <GoodsCardSkeleton count={Math.max(3, Math.min(favoriteIds.length, 6))} />}
          {favoritesStatus === 'error' && (
            <GoodsListState kind="error" message={favoritesError} onAction={() => void refreshFavorites()} />
          )}
          {favoritesStatus === 'signedOut' && (
            <div className="goods-state favorites-empty" role="status">
              <span className="goods-state-mark" aria-hidden="true">♡</span>
              <strong>Login required</strong>
              <span>로그인 후 계정별 즐겨찾기를 사용할 수 있습니다.</span>
              <button type="button" onClick={() => setActiveSection('all')}>Browse goods</button>
            </div>
          )}
          {favoritesStatus !== 'signedOut' && favoriteIds.length === 0 && (
            <div className="goods-state favorites-empty" role="status">
              <span className="goods-state-mark" aria-hidden="true">♡</span>
              <strong>No favorite goods yet</strong>
              <span>Tap the heart on a goods card to save it here.</span>
              <button type="button" onClick={() => setActiveSection('all')}>Browse goods</button>
            </div>
          )}
          {favoritesStatus === 'data' && favoriteGoods.length > 0 && (
            <GoodsCards
              items={visibleFavoriteGoods}
              viewMode={viewMode}
              isLiked={(goodsId) => likedGoodsIds.has(goodsId)}
              isLikePending={(goodsId) => pendingLikeIds.has(goodsId)}
              toggleLike={handleLikeToggle}
              onOpenDetail={openGoodsDetail}
            />
          )}
        </section>
      )}
      <GoodsCartSidePanel />
    </main>
  )
}

export default GoodsPage
