import { type ChangeEvent, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  fetchGoods,
  fetchGoodsDetail,
  fetchGoodsFilters,
  type GoodsFilterOption,
  type GoodsQueryParams,
  type GoodsSummary,
  type PageResponse,
} from '../../api/goods'
import CartNavLink from '../cart/CartNavLink'
import GoodsFilterUi, {
  GoodsActiveFilterChips,
  type GoodsFilterGroup,
  type GoodsFilterParam,
  type GoodsSelectedFilters,
} from './GoodsFilterUi'
import GoodsImage from './GoodsImage'
import GoodsListState, { GoodsCardSkeleton } from './GoodsListState'
import GoodsSearchAutocomplete from './GoodsSearchAutocomplete'
import GoodsStatusBadge from './GoodsStatusBadge'
import { useDebouncedValue } from './useDebouncedValue'
import { useGoodsFavorites } from './useGoodsFavorites'
import './goods.css'
import './goods-list-ui.css'

type LoadStatus = 'loading' | 'refreshing' | 'data' | 'empty' | 'error'
type FilterStatus = 'loading' | 'data' | 'error'
type ViewMode = 'grid' | 'list'
type GoodsSection = 'all' | 'favorites'
type FavoritesStatus = 'idle' | 'loading' | 'data' | 'error'

const ALLOWED_SORTS = new Set(['createdAt,desc', 'price,asc', 'price,desc', 'goodsName,asc'])
function readFilterParam(params: URLSearchParams, key: string) {
  const raw = params.get(key) ?? ''
  const separator = raw.includes(';') ? ';' : ','
  return raw.split(separator).map((value) => value.trim()).filter(Boolean)
}

function expandFilterValues(values: string[]) {
  return values.flatMap((value) => value.split('|')).filter(Boolean)
}

function createGoodsUrl({
  query,
  sort,
  page,
  selectedFilters,
}: {
  query: string
  sort: string
  page: number
  selectedFilters: GoodsSelectedFilters
}) {
  const params = new URLSearchParams()
  if (query.trim()) params.set('q', query.trim())
  if (sort !== 'createdAt,desc') params.set('sort', sort)
  if (page > 0) params.set('page', String(page + 1))
  if (selectedFilters.categoryIds.length) params.set('categories', selectedFilters.categoryIds.join(';'))
  if (selectedFilters.artistIds.length) params.set('artists', selectedFilters.artistIds.join(';'))
  if (selectedFilters.tags.length) params.set('tags', selectedFilters.tags.join(';'))

  return `${window.location.pathname}${params.size ? `?${params.toString()}` : ''}`
}

function readInitialState() {
  const params = new URLSearchParams(window.location.search)
  const requestedSort = params.get('sort') ?? 'createdAt,desc'
  const requestedPage = Number(params.get('page') ?? 1)

  return {
    query: params.get('q') ?? '',
    sort: ALLOWED_SORTS.has(requestedSort) ? requestedSort : 'createdAt,desc',
    page: Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage - 1 : 0,
    selectedFilters: {
      categoryIds: readFilterParam(params, 'categories'),
      artistIds: readFilterParam(params, 'artists'),
      tags: readFilterParam(params, 'tags'),
    } satisfies GoodsSelectedFilters,
  }
}

function uniqueFilterOptions(options: GoodsFilterOption[] = []) {
  return [...new Map(
    options.map((option) => [option.label.trim().toLocaleLowerCase(), option]),
  ).values()]
}

function GoodsCards({
  items,
  viewMode,
  isFavorite,
  toggleFavorite,
}: {
  items: GoodsSummary[]
  viewMode: ViewMode
  isFavorite: (goodsId: number) => boolean
  toggleFavorite: (goodsId: number) => void
}) {
  return (
    <div className={`goods-grid goods-${viewMode}`}>
      {items.map((item) => (
        <article className="goods-card" data-goods-id={item.goodsId} key={item.goodsId}>
          <div className="goods-image" aria-label={`${item.name} image`}>
            <GoodsImage src={item.imageUrl} alt={item.name} fallbackLabel={item.categoryName} />
          </div>
          <div className="goods-card-body">
            <div className="card-topline">
              <span>{item.artistName ?? 'SM Artist'}</span>
              <GoodsStatusBadge salesStatus={item.salesStatus} isBestSeller={item.isBestSeller} />
            </div>
            <h3>{item.name}</h3>
            <p>{item.categoryName ?? 'Goods'}</p>
            {(item.tags ?? []).length > 0 && (
              <div className="tag-row">
                {(item.tags ?? []).map((tag) => <span key={tag}>{tag}</span>)}
              </div>
            )}
            <div className="card-footer">
              <strong>KRW {Number(item.price ?? 0).toLocaleString()}</strong>
              <div className="card-footer-actions">
                <Link className="card-action" to={`/goods/${item.goodsId}`}>View</Link>
                <button
                  className="favorite-button"
                  type="button"
                  aria-label={isFavorite(item.goodsId) ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`}
                  aria-pressed={isFavorite(item.goodsId)}
                  onClick={() => toggleFavorite(item.goodsId)}
                >
                  <span aria-hidden="true">{isFavorite(item.goodsId) ? '♥' : '♡'}</span>
                </button>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

function GoodsPage() {
  const [initialState] = useState(readInitialState)
  const { favoriteIds, isFavorite, toggleFavorite } = useGoodsFavorites()
  const [query, setQuery] = useState(initialState.query)
  const [sort, setSort] = useState(initialState.sort)
  const [page, setPage] = useState(initialState.page)
  const [selectedFilters, setSelectedFilters] = useState<GoodsSelectedFilters>(initialState.selectedFilters)
  const [filters, setFilters] = useState<GoodsFilterGroup[]>([])
  const [goodsPage, setGoodsPage] = useState<PageResponse<GoodsSummary> | null>(null)
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('loading')
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [activeSection, setActiveSection] = useState<GoodsSection>('all')
  const [favoriteGoods, setFavoriteGoods] = useState<GoodsSummary[]>([])
  const [favoritesStatus, setFavoritesStatus] = useState<FavoritesStatus>('idle')
  const [favoritesError, setFavoritesError] = useState('')
  const [retryKey, setRetryKey] = useState(0)
  const [emptyResultsMinHeight, setEmptyResultsMinHeight] = useState(0)
  const hasLoadedGoodsRef = useRef(false)
  const resultsStartRef = useRef<HTMLDivElement | null>(null)
  const goodsResultsRef = useRef<HTMLDivElement | null>(null)
  const searchScrollPositionRef = useRef<number | null>(null)
  const committedQueryRef = useRef(initialState.query.trim())
  const debouncedQuery = useDebouncedValue(query, 300)

  useLayoutEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    window.scrollTo({ top: 0, left: 0 })

    return () => {
      window.history.scrollRestoration = previousScrollRestoration
    }
  }, [])

  useLayoutEffect(() => {
    if (status !== 'empty' || searchScrollPositionRef.current === null) {
      return
    }

    window.scrollTo({ top: searchScrollPositionRef.current })
    searchScrollPositionRef.current = null
  }, [status])

  const scrollToResults = useCallback(() => {
    window.requestAnimationFrame(() => {
      resultsStartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [])

  const requestParams = useMemo<GoodsQueryParams>(
    () => {
      return {
        q: debouncedQuery,
        sort,
        page,
        size: 12,
        categoryIds: expandFilterValues(selectedFilters.categoryIds).join(','),
        artistIds: expandFilterValues(selectedFilters.artistIds).join(','),
        tags: expandFilterValues(selectedFilters.tags).join(','),
      }
    },
    [debouncedQuery, page, selectedFilters, sort],
  )

  useEffect(() => {
    window.history.replaceState(null, '', createGoodsUrl({
      query: committedQueryRef.current,
      sort,
      page,
      selectedFilters,
    }))
  }, [page, selectedFilters, sort])

  useEffect(() => {
    function restoreHistoryState() {
      const restoredState = readInitialState()
      committedQueryRef.current = restoredState.query.trim()
      setQuery(restoredState.query)
      setSort(restoredState.sort)
      setPage(restoredState.page)
      setSelectedFilters(restoredState.selectedFilters)
    }

    window.addEventListener('popstate', restoreHistoryState)
    return () => window.removeEventListener('popstate', restoreHistoryState)
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
        if (loadError.name === 'AbortError') {
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
        if (loadError.name === 'AbortError') {
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

  useEffect(() => {
    if (activeSection !== 'favorites') {
      return undefined
    }

    if (favoriteIds.length === 0) {
      return undefined
    }

    const controller = new AbortController()

    Promise.resolve()
      .then(() => {
        if (controller.signal.aborted) return []
        setFavoritesStatus('loading')
        setFavoritesError('')
        return Promise.all(
          favoriteIds.map((goodsId) => fetchGoodsDetail(goodsId, { signal: controller.signal })),
        )
      })
      .then((items) => {
        if (controller.signal.aborted) return
        setFavoriteGoods(items)
        setFavoritesStatus('data')
      })
      .catch((loadError) => {
        if (loadError instanceof DOMException && loadError.name === 'AbortError') return
        setFavoritesError(loadError instanceof Error ? loadError.message : 'Failed to load favorite goods.')
        setFavoritesStatus('error')
      })

    return () => controller.abort()
  }, [activeSection, favoriteIds])

  function updateFilter(param: GoodsFilterParam, value: string) {
    setPage(0)
    setSelectedFilters((current) => {
      const currentValues = current[param] ?? []
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((currentValue) => currentValue !== value)
        : [...currentValues, value]

      return {
        ...current,
        [param]: nextValues,
      }
    })
  }

  function resetFilters() {
    committedQueryRef.current = ''
    setQuery('')
    setSort('createdAt,desc')
    setPage(0)
    setSelectedFilters({ categoryIds: [], artistIds: [], tags: [] })
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
  const hasPreviousPage = currentPage > 0
  const hasNextPage = totalPages > 0 && currentPage < totalPages - 1
  const hasGoods = goods.length > 0

  const pageNumbers = useMemo(() => {
    if (totalPages < 1) {
      return []
    }

    const maxVisiblePages = 5
    const halfWindow = Math.floor(maxVisiblePages / 2)
    const startPage = Math.max(0, Math.min(currentPage - halfWindow, totalPages - maxVisiblePages))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages)

    return Array.from({ length: endPage - startPage }, (_, index) => startPage + index)
  }, [currentPage, totalPages])

  function handleQueryChange(value: string) {
    searchScrollPositionRef.current = window.scrollY
    if (goods.length > 0 && goodsResultsRef.current) {
      setEmptyResultsMinHeight(goodsResultsRef.current.offsetHeight)
    }
    setPage(0)
    setQuery(value)
  }

  function commitSearch(value: string) {
    const normalizedValue = value.trim()
    if (normalizedValue === committedQueryRef.current) {
      return
    }

    committedQueryRef.current = normalizedValue
    window.history.pushState(null, '', createGoodsUrl({
      query: normalizedValue,
      sort,
      page: 0,
      selectedFilters,
    }))
  }

  function handleSortChange(event: ChangeEvent<HTMLSelectElement>) {
    setPage(0)
    setSort(event.target.value)
    scrollToResults()
  }

  function goToPage(nextPage: number) {
    setPage(Math.min(Math.max(nextPage, 0), Math.max(totalPages - 1, 0)))
    scrollToResults()
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
      <header className="store-header">
        <div>
          <p className="eyebrow">SM Universe Store</p>
          <h1>Goods</h1>
        </div>
        <nav className="store-nav" aria-label="Store navigation">
          <Link to="/artists">Artists</Link>
          <Link to="/goods" aria-current="page">
            Goods
          </Link>
          <CartNavLink />
        </nav>
      </header>

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
      <section className="store-toolbar" aria-label="Goods search and sort">
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
          onToggle={updateFilter}
        />

        <div className="goods-content">
          <GoodsActiveFilterChips
            groups={filters}
            selectedFilters={selectedFilters}
            onRemoveFilter={updateFilter}
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
                />
              </div>
            )}
          </div>

          {totalPages > 0 && (
            <nav className="goods-pagination" aria-label="Goods pagination">
              <button type="button" disabled={!hasPreviousPage} onClick={() => goToPage(currentPage - 1)}>
                Previous
              </button>
              <div className="page-number-list">
                {pageNumbers.map((pageNumber) => (
                  <button
                    aria-current={pageNumber === currentPage ? 'page' : undefined}
                    key={pageNumber}
                    type="button"
                    onClick={() => goToPage(pageNumber)}
                  >
                    {pageNumber + 1}
                  </button>
                ))}
              </div>
              <button type="button" disabled={!hasNextPage} onClick={() => goToPage(currentPage + 1)}>
                Next
              </button>
              <span>
                Page {currentPage + 1} of {totalPages}
              </span>
            </nav>
          )}
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
            />
          )}
        </section>
      )}
    </main>
  )
}

export default GoodsPage
