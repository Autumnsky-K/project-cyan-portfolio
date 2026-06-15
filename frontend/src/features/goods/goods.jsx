import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchGoods } from '../../api/goods'
import './goods.css'

const filters = [
  {
    title: 'Artist',
    param: 'artistId',
    options: [
      { label: 'aespa', value: '1' },
      { label: 'NCT', value: '2' },
      { label: 'RIIZE', value: '3' },
      { label: 'Red Velvet', value: '4' },
    ],
  },
  {
    title: 'Category',
    param: 'categoryId',
    options: [
      { label: 'Photo Card', value: '1' },
      { label: 'Apparel', value: '2' },
      { label: 'Album Goods', value: '3' },
      { label: 'Light Stick', value: '4' },
      { label: 'Stationery', value: '5' },
    ],
  },
  {
    title: 'Tag',
    param: 'tag',
    options: [
      { label: 'New', value: 'NEW' },
      { label: 'Best', value: 'BEST' },
      { label: 'Limited', value: 'LIMITED' },
      { label: 'Pre-order', value: 'PRE_ORDER' },
    ],
  },
]

function GoodsPage() {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('createdAt,desc')
  const [selectedFilters, setSelectedFilters] = useState({})
  const [goodsPage, setGoodsPage] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  const requestParams = useMemo(
    () => ({
      q: query,
      sort,
      page: 0,
      size: 20,
      ...selectedFilters,
    }),
    [query, selectedFilters, sort],
  )

  useEffect(() => {
    const controller = new AbortController()

    async function loadGoods() {
      setStatus('loading')
      setError('')

      try {
        const data = await fetchGoods(requestParams, { signal: controller.signal })
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

  function updateFilter(param, value) {
    setSelectedFilters((current) => {
      if (current[param] === value) {
        const next = { ...current }
        delete next[param]
        return next
      }
      return { ...current, [param]: value }
    })
  }

  function resetFilters() {
    setQuery('')
    setSort('createdAt,desc')
    setSelectedFilters({})
  }

  const goods = goodsPage?.content ?? []
  const totalElements = goodsPage?.totalElements ?? 0

  return (
    <main className="goods-page">
      <header className="store-header">
        <div>
          <p className="eyebrow">SM Universe Store</p>
          <h1>Goods</h1>
        </div>
        <nav className="store-nav" aria-label="Store navigation">
          <a href="#home">Home</a>
          <a href="#artists">Artists</a>
          <a href="#goods" aria-current="page">
            Goods
          </a>
          <a href="#cart">Cart</a>
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
          {filters.map((group) => (
            <fieldset className="filter-group" key={group.title}>
              <legend>{group.title}</legend>
              {group.options.map((option) => (
                <label key={option.value}>
                  <input
                    type="checkbox"
                    checked={selectedFilters[group.param] === option.value}
                    onChange={() => updateFilter(group.param, option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
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

          {status === 'loading' && <div className="goods-state">Loading goods...</div>}

          {status === 'error' && (
            <div className="goods-state error-state">
              <strong>Unable to load goods</strong>
              <span>{error}</span>
            </div>
          )}

          {status === 'empty' && <div className="goods-state">No goods match these filters.</div>}

          {status === 'data' && (
            <div className="goods-grid">
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
                        <button type="button">Add</button>
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
