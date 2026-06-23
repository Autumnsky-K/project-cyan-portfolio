import { type ChangeEvent, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  fetchGoods,
  fetchGoodsFilters,
  type GoodsFilterOption,
  type GoodsSummary,
  type PageResponse,
} from '../../api/goods'
import GoodsCards, { type GoodsViewMode } from './GoodsCards'
import GoodsFilterUi, {
  GoodsActiveFilterChips,
  type GoodsFilterGroup,
  type GoodsSelectedFilters,
} from './GoodsFilterUi'
import GoodsListState, { GoodsCardSkeleton } from './GoodsListState'
import GoodsPagination from './GoodsPagination'
import GoodsSearchAutocomplete from './GoodsSearchAutocomplete'
import { useFavoriteGoods } from './useFavoriteGoods'
import { useGoodsFavorites } from './useGoodsFavorites'
import { useGoodsListQueryState } from './useGoodsListQueryState'
import { useGoodsScrollRestoration } from './useGoodsScrollRestoration'
import './goods.css'
import './goods-list-ui.css'
import Header from '../../shared/components/Header'

type LoadStatus = 'loading' | 'refreshing' | 'data' | 'empty' | 'error'
type FilterStatus = 'loading' | 'data' | 'error'
type GoodsSection = 'all' | 'favorites'

function uniqueFilterOptions(options: GoodsFilterOption[] = []) {
  return [...new Map(
    options.map((option) => [option.label.trim().toLocaleLowerCase(), option]),
  ).values()]
}

function GoodsPage() {
  const { favoriteIds, isFavorite, toggleFavorite, retainFavorites } = useGoodsFavorites()
  const {
    query,
    setQuery,
    sort,
    setSort,
    page,
    setPage,
    selectedFilters,
    setSelectedFilters,
    requestParams,
    toggleFilter,
    reset,
    commitSearch,
  } = useGoodsListQueryState()
  const [filters, setFilters] = useState<GoodsFilterGroup[]>([])
  const [goodsPage, setGoodsPage] = useState<PageResponse<GoodsSummary> | null>(null)
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('loading')
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [viewMode, setViewMode] = useState<GoodsViewMode>('grid')
  const [activeSection, setActiveSection] = useState<GoodsSection>('all')
  const {
    goods: favoriteGoods,
    status: favoritesStatus,
    error: favoritesError,
  } = useFavoriteGoods(activeSection === 'favorites', favoriteIds, retainFavorites)
  const [retryKey, setRetryKey] = useState(0)
  const [emptyResultsMinHeight, setEmptyResultsMinHeight] = useState(0)
  const hasLoadedGoodsRef = useRef(false)
  const resultsStartRef = useRef<HTMLDivElement | null>(null)
  const searchToolbarRef = useRef<HTMLElement | null>(null)
  const goodsResultsRef = useRef<HTMLDivElement | null>(null)
  const searchScrollPositionRef = useRef<number | null>(null)
  const openGoodsDetail = useGoodsScrollRestoration(status)

  useLayoutEffect(() => {
    if (status !== 'empty' || searchScrollPositionRef.current === null) {
      return
    }

    window.scrollTo({ top: searchScrollPositionRef.current })
    searchScrollPositionRef.current = null
  }, [status])

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
          { title: 'Category', param: 'categoryIds', options: uniqueFilterOptions(data.categories) },
          { title: 'Artist', param: 'artistIds', options: uniqueFilterOptions(data.artists) },
          { title: 'Tag', param: 'tags', options: uniqueFilterOptions(data.tags) },
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
        setError(loadError instanceof Error ? loadError.message : 'Failed to load goods.')
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
    scrollToResults()
  }

  function applyMobileFilters(nextFilters: GoodsSelectedFilters) {
    setPage(0)
    setSelectedFilters(nextFilters)
    scrollToResults()
  }

  const goods = useMemo(() => goodsPage?.content ?? [], [goodsPage])
  const totalElements = goodsPage?.totalElements ?? 0
  const totalPages = goodsPage?.totalPages ?? 0
  const currentPage = goodsPage?.page ?? goodsPage?.number ?? page
  const hasGoods = goods.length > 0

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
    scrollToResults()
  }

  function goToPage(nextPage: number) {
    setPage(nextPage)
    window.requestAnimationFrame(() => {
      searchToolbarRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' })
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

      <nav className="goods-section-tabs" aria-label="Goods sections">
        <button type="button" aria-pressed={activeSection === 'all'} onClick={() => setActiveSection('all')}>
          All goods
        </button>
        <button type="button" aria-pressed={activeSection === 'favorites'} onClick={() => setActiveSection('favorites')}>
          Favorites <span>{favoriteIds.length}</span>
        </button>
      </nav>

      {activeSection === 'all' && (
        <>
      <section className="store-toolbar" ref={searchToolbarRef} aria-label="Goods search and sort">
        <GoodsSearchAutocomplete
          query={query}
          suggestions={searchSuggestions}
          onQueryChange={handleQueryChange}
          onSearchCommit={commitSearch}
        />
        <label className="sort-field">
          <span>Sort</span>
          <select value={sort} onChange={handleSortChange}>
            <option value="createdAt,desc">Newest</option>
            <option value="price,asc">Price low to high</option>
            <option value="price,desc">Price high to low</option>
            <option value="goodsName,asc">Name A to Z</option>
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
          <GoodsActiveFilterChips
            groups={filters}
            selectedFilters={selectedFilters}
            onRemoveFilter={toggleFilter}
          />
          <div className="result-summary" ref={resultsStartRef}>
            <div>
              <h2>Featured Goods</h2>
              <p>
                {status === 'loading'
                  ? 'Loading store items'
                  : status === 'refreshing'
                    ? `Updating ${goods.length} of ${totalElements} store items`
                  : `Showing ${goods.length} of ${totalElements} store items`}
              </p>
            </div>
            <div className="view-toggle" aria-label="View options">
              <button type="button" aria-pressed={viewMode === 'grid'} onClick={() => setViewMode('grid')}>
                Grid
              </button>
              <button type="button" aria-pressed={viewMode === 'list'} onClick={() => setViewMode('list')}>
                List
              </button>
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
                  items={goods}
                  viewMode={viewMode}
                  isFavorite={isFavorite}
                  toggleFavorite={toggleFavorite}
                  onOpenDetail={openGoodsDetail}
                />
              </div>
            )}
          </div>

          <GoodsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        </div>
      </section>
        </>
      )}

      {activeSection === 'favorites' && (
        <section className="favorites-content" aria-labelledby="favorites-heading">
          <div className="result-summary">
            <div>
              <h2 id="favorites-heading">Favorite Goods</h2>
              <p>{favoriteIds.length} saved item{favoriteIds.length === 1 ? '' : 's'}</p>
            </div>
            <div className="view-toggle" aria-label="Favorite view options">
              <button type="button" aria-pressed={viewMode === 'grid'} onClick={() => setViewMode('grid')}>Grid</button>
              <button type="button" aria-pressed={viewMode === 'list'} onClick={() => setViewMode('list')}>List</button>
            </div>
          </div>

          {favoritesStatus === 'loading' && <GoodsCardSkeleton count={Math.min(favoriteIds.length, 6)} />}
          {favoritesStatus === 'error' && (
            <GoodsListState kind="error" message={favoritesError} onAction={() => setActiveSection('all')} />
          )}
          {favoriteIds.length === 0 && (
            <div className="goods-state favorites-empty" role="status">
              <span className="goods-state-mark" aria-hidden="true">♡</span>
              <strong>No favorite goods yet</strong>
              <span>Tap the heart on a goods card to save it here.</span>
              <button type="button" onClick={() => setActiveSection('all')}>Browse goods</button>
            </div>
          )}
          {favoritesStatus === 'data' && favoriteGoods.length > 0 && (
            <GoodsCards
              items={favoriteGoods}
              viewMode={viewMode}
              isFavorite={isFavorite}
              toggleFavorite={toggleFavorite}
              onOpenDetail={openGoodsDetail}
            />
          )}
        </section>
      )}
    </main>
  )
}

export default GoodsPage
