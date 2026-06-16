import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchGoods, fetchGoodsFilters, type GoodsFilterOption, type GoodsQueryParams, type GoodsSummary, type PageResponse } from '../../api/goods'
import CartNavLink from '../cart/CartNavLink'
import { useCart } from '../cart/useCart'
import './goods.css'

type LoadStatus = 'loading' | 'refreshing' | 'data' | 'empty' | 'error'
type FilterStatus = 'loading' | 'data' | 'error'
type FilterParam = 'categoryIds' | 'artistIds' | 'tags'
type SelectedFilters = Record<FilterParam, string[]>
type FilterGroup = {
  title: string
  param: FilterParam
  options: GoodsFilterOption[]
}

function GoodsPage() {
  const { addCartItem } = useCart()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('createdAt,desc')
  const [page, setPage] = useState(0)
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({ categoryIds: [], artistIds: [], tags: [] })
  const [filters, setFilters] = useState<FilterGroup[]>([])
  const [goodsPage, setGoodsPage] = useState<PageResponse<GoodsSummary> | null>(null)
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('loading')
  const [addedGoodsId, setAddedGoodsId] = useState<number | null>(null)
  const hasLoadedGoodsRef = useRef(false)
  const cartToastTimerRef = useRef<number | null>(null)

  const requestParams = useMemo<GoodsQueryParams>(
    () => {
      const params = {
        q: query,
        sort,
        page,
        size: 12,
        categoryIds: selectedFilters.categoryIds.join(','),
        artistIds: selectedFilters.artistIds.join(','),
        tags: selectedFilters.tags.join(','),
      }

      if (selectedFilters.categoryIds.length === 1) {
        params.categoryId = selectedFilters.categoryIds[0]
      }
      if (selectedFilters.artistIds.length === 1) {
        params.artistId = selectedFilters.artistIds[0]
      }
      if (selectedFilters.tags.length === 1) {
        params.tag = selectedFilters.tags[0]
      }

      return params
    },
    [page, query, selectedFilters, sort],
  )

  useEffect(() => {
    const controller = new AbortController()

    async function loadFilters() {
      setFilterStatus('loading')

      try {
        const data = await fetchGoodsFilters({ signal: controller.signal })
        setFilters([
          { title: 'Category', param: 'categoryIds', options: data.categories ?? [] },
          { title: 'Artist', param: 'artistIds', options: data.artists ?? [] },
          { title: 'Tag', param: 'tags', options: data.tags ?? [] },
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
  }, [requestParams])

  useEffect(
    () => () => {
      if (cartToastTimerRef.current !== null) {
        window.clearTimeout(cartToastTimerRef.current)
      }
    },
    [],
  )

  function updateFilter(param: FilterParam, value: string) {
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
    setQuery('')
    setSort('createdAt,desc')
    setPage(0)
    setSelectedFilters({ categoryIds: [], artistIds: [], tags: [] })
  }

  function isFilterSelected(param: FilterParam, value: string) {
    return (selectedFilters[param] ?? []).includes(value)
  }

  function handleAddCartItem(item: GoodsSummary) {
    addCartItem(item)
    setAddedGoodsId(item.goodsId)
    if (cartToastTimerRef.current !== null) {
      window.clearTimeout(cartToastTimerRef.current)
    }
    cartToastTimerRef.current = window.setTimeout(() => {
      setAddedGoodsId(null)
    }, 1600)
  }

  const goods = goodsPage?.content ?? []
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

  function handleQueryChange(event: ChangeEvent<HTMLInputElement>) {
    setPage(0)
    setQuery(event.target.value)
  }

  function handleSortChange(event: ChangeEvent<HTMLSelectElement>) {
    setPage(0)
    setSort(event.target.value)
  }

  function goToPage(nextPage: number) {
    setPage(Math.min(Math.max(nextPage, 0), Math.max(totalPages - 1, 0)))
  }

  return (
    <main className="goods-page">
      <header className="store-header">
        <div>
          <p className="eyebrow">SM Universe Store</p>
          <h1>Goods</h1>
        </div>
        <nav className="store-nav" aria-label="Store navigation">
          <Link to="/">Home</Link>
          <Link to="/artists">Artists</Link>
          <a href="#goods" aria-current="page">
            Goods
          </a>
          <CartNavLink />
        </nav>
      </header>

      <section className="store-toolbar" aria-label="Goods search and sort">
        <label className="search-field">
          <span>Search</span>
          <input
            type="search"
            placeholder="Search goods, artist, category"
            value={query}
            onChange={handleQueryChange}
          />
        </label>
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
        <aside className="filter-panel" aria-label="Goods filters">
          <div className="panel-heading">
            <h2>Filters</h2>
            <button type="button" onClick={resetFilters}>
              Reset
            </button>
          </div>
          {filterStatus === 'loading' && <p className="filter-note">Loading filters...</p>}
          {filterStatus === 'error' && <p className="filter-note">Unable to load filters.</p>}
          {filters.map((group) => (
            <fieldset className="filter-group" key={group.title}>
              <legend>{group.title}</legend>
              <div className="filter-options">
                {group.options.map((option) => (
                  <label key={option.value}>
                    <input
                      type="checkbox"
                      checked={isFilterSelected(group.param, option.value)}
                      onChange={() => updateFilter(group.param, option.value)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </aside>

        <div className="goods-content">
          <div className="result-summary">
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
              <button type="button" aria-pressed="true">
                Grid
              </button>
              <button type="button">List</button>
            </div>
          </div>

          {status === 'loading' && !hasGoods && <div className="goods-state">Loading goods...</div>}

          {status === 'error' && (
            <div className="goods-state error-state">
              <strong>Unable to load goods</strong>
              <span>{error}</span>
            </div>
          )}

          {status === 'empty' && !hasGoods && <div className="goods-state">No goods match these filters.</div>}

          {hasGoods && (
            <div className="goods-grid" data-refreshing={status === 'refreshing'}>
              {goods.map((item) => (
                <article className="goods-card" data-goods-id={item.goodsId} key={item.goodsId}>
                  <div className="goods-image" aria-label={`${item.name} image`}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt="" />
                    ) : (
                      <span>{item.categoryName ?? 'Goods'}</span>
                    )}
                  </div>
                  <div className="goods-card-body">
                    <div className="card-topline">
                      <span>{item.artistName ?? 'SM Artist'}</span>
                      <strong>{item.salesStatus ?? (item.isBestSeller ? 'Best' : 'On sale')}</strong>
                    </div>
                    <h3>{item.name}</h3>
                    <p>{item.categoryName ?? 'Goods'}</p>
                    <div className="tag-row">
                      {(item.tags ?? []).map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                    <div className="card-footer">
                      <strong>KRW {Number(item.price ?? 0).toLocaleString()}</strong>
                      <div>
                        <Link className="card-action" to={`/goods/${item.goodsId}`}>
                          View
                        </Link>
                        <span className="add-action-wrap">
                          <button type="button" data-add-to-cart={item.goodsId} onClick={() => handleAddCartItem(item)}>
                            Add
                          </button>
                          {addedGoodsId === item.goodsId && (
                            <span className="add-feedback-popover">Added to cart</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

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
    </main>
  )
}

export default GoodsPage
