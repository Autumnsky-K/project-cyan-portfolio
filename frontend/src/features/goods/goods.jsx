import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchGoods, fetchGoodsFilters } from '../../api/goods'
import CartNavLink from '../cart/CartNavLink'
import { useCart } from '../cart/useCart'
import './goods.css'

function GoodsPage() {
  const { addCartItem } = useCart()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('createdAt,desc')
  const [selectedFilters, setSelectedFilters] = useState({ categoryIds: [], artistIds: [], tags: [] })
  const [filters, setFilters] = useState([])
  const [goodsPage, setGoodsPage] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState('loading')
  const [addedGoodsId, setAddedGoodsId] = useState(null)
  const hasLoadedGoodsRef = useRef(false)
  const cartToastTimerRef = useRef(null)

  const requestParams = useMemo(
    () => {
      const params = {
        q: query,
        sort,
        page: 0,
        size: 20,
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
    [query, selectedFilters, sort],
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
        setError(loadError.message)
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
      window.clearTimeout(cartToastTimerRef.current)
    },
    [],
  )

  function updateFilter(param, value) {
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
    setSelectedFilters({ categoryIds: [], artistIds: [], tags: [] })
  }

  function isFilterSelected(param, value) {
    return (selectedFilters[param] ?? []).includes(value)
  }

  function handleAddCartItem(item) {
    addCartItem(item)
    setAddedGoodsId(item.goodsId)
    window.clearTimeout(cartToastTimerRef.current)
    cartToastTimerRef.current = window.setTimeout(() => {
      setAddedGoodsId(null)
    }, 1600)
  }

  const goods = goodsPage?.content ?? []
  const totalElements = goodsPage?.totalElements ?? 0
  const hasGoods = goods.length > 0

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
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label className="sort-field">
          <span>Sort</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
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
        </div>
      </section>
    </main>
  )
}

export default GoodsPage
