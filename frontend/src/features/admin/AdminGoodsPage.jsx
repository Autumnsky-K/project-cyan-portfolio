import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchGoods, fetchGoodsFilters } from '../../api/goods'
import './admin.css'

const PAGE_SIZE = 12

function formatPrice(value) {
  return `KRW ${Number(value ?? 0).toLocaleString()}`
}

function AdminGoodsPage() {
  const [query, setQuery] = useState('')
  const [artistId, setArtistId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [sort, setSort] = useState('createdAt,desc')
  const [page, setPage] = useState(0)
  const [filters, setFilters] = useState({ artists: [], categories: [] })
  const [goodsPage, setGoodsPage] = useState(null)
  const [loadStatus, setLoadStatus] = useState('loading')
  const [filterStatus, setFilterStatus] = useState('loading')
  const [error, setError] = useState('')

  const requestParams = useMemo(
    () => ({
      q: query,
      artistId,
      categoryId,
      sort,
      page,
      size: PAGE_SIZE,
    }),
    [artistId, categoryId, page, query, sort],
  )

  useEffect(() => {
    const controller = new AbortController()

    async function loadFilters() {
      setFilterStatus('loading')

      try {
        const data = await fetchGoodsFilters({ signal: controller.signal })
        setFilters({
          artists: data.artists ?? [],
          categories: data.categories ?? [],
        })
        setFilterStatus('data')
      } catch (loadError) {
        if (loadError.name === 'AbortError') {
          return
        }
        setFilters({ artists: [], categories: [] })
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
      setLoadStatus('loading')
      setError('')

      try {
        const data = await fetchGoods(requestParams, { signal: controller.signal })
        setGoodsPage(data)
        setLoadStatus(data.content?.length ? 'data' : 'empty')
      } catch (loadError) {
        if (loadError.name === 'AbortError') {
          return
        }
        setError(loadError.message)
        setLoadStatus('error')
      }
    }

    loadGoods()

    return () => {
      controller.abort()
    }
  }, [requestParams])

  const goods = goodsPage?.content ?? []
  const totalElements = goodsPage?.totalElements ?? 0
  const totalPages = goodsPage?.totalPages ?? 0
  const currentPage = goodsPage?.page ?? goodsPage?.number ?? page
  const hasPreviousPage = currentPage > 0
  const hasNextPage = totalPages > 0 && currentPage < totalPages - 1
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

  function resetToFirstPage(update) {
    setPage(0)
    update()
  }

  function goToPage(nextPage) {
    setPage(Math.min(Math.max(nextPage, 0), Math.max(totalPages - 1, 0)))
  }

  return (
    <main className="admin-page">
      <aside className="admin-sidebar" aria-label="Admin navigation">
        <div>
          <p className="admin-eyebrow">Project Cyan</p>
          <h1>Admin</h1>
        </div>
        <nav>
          <Link aria-current="page" to="/admin/goods">
            Goods
          </Link>
          <span>Orders</span>
          <span>Members</span>
        </nav>
      </aside>

      <section className="admin-main">
        <header className="admin-header">
          <div>
            <p className="admin-eyebrow">Store Management</p>
            <h2>Goods</h2>
          </div>
          <Link to="/goods">View Store</Link>
        </header>

        <section className="admin-stats" aria-label="Goods status">
          <article>
            <span>Total goods</span>
            <strong>{totalElements}</strong>
          </article>
          <article>
            <span>Current page</span>
            <strong>{totalPages > 0 ? currentPage + 1 : 0}</strong>
          </article>
          <article>
            <span>Rows visible</span>
            <strong>{goods.length}</strong>
          </article>
        </section>

        <section className="admin-toolbar" aria-label="Goods admin filters">
          <label>
            <span>Search</span>
            <input
              type="search"
              placeholder="Search goods"
              value={query}
              onChange={(event) => resetToFirstPage(() => setQuery(event.target.value))}
            />
          </label>
          <label>
            <span>Artist</span>
            <select
              value={artistId}
              onChange={(event) => resetToFirstPage(() => setArtistId(event.target.value))}
            >
              <option value="">All artists</option>
              {filters.artists.map((artist) => (
                <option key={artist.value} value={artist.value}>
                  {artist.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Category</span>
            <select
              value={categoryId}
              onChange={(event) => resetToFirstPage(() => setCategoryId(event.target.value))}
            >
              <option value="">All categories</option>
              {filters.categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Sort</span>
            <select value={sort} onChange={(event) => resetToFirstPage(() => setSort(event.target.value))}>
              <option value="createdAt,desc">Newest</option>
              <option value="goodsName,asc">Name A to Z</option>
              <option value="price,asc">Price low to high</option>
              <option value="price,desc">Price high to low</option>
            </select>
          </label>
        </section>

        {filterStatus === 'error' && <div className="admin-note">Filter options could not be loaded.</div>}

        <section className="admin-table-panel" aria-label="Goods table">
          {loadStatus === 'loading' && <div className="admin-state">Loading goods...</div>}

          {loadStatus === 'error' && (
            <div className="admin-state admin-state-error">
              <strong>Unable to load goods</strong>
              <span>{error}</span>
            </div>
          )}

          {loadStatus === 'empty' && <div className="admin-state">No goods match these filters.</div>}

          {loadStatus === 'data' && (
            <div className="admin-table-scroll">
              <table className="admin-goods-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Artist</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Flags</th>
                    <th>Tags</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {goods.map((item) => (
                    <tr key={item.goodsId}>
                      <td>
                        <div className="admin-thumb" aria-label={`${item.name} image`}>
                          {item.imageUrl ? <img src={item.imageUrl} alt="" /> : <span>{item.categoryName ?? 'Goods'}</span>}
                        </div>
                      </td>
                      <td>
                        <strong>{item.name}</strong>
                        <span>#{item.goodsId}</span>
                      </td>
                      <td>{item.artistName ?? '-'}</td>
                      <td>{item.categoryName ?? '-'}</td>
                      <td>{formatPrice(item.price)}</td>
                      <td>
                        <span className="admin-status">{item.salesStatus ?? 'UNKNOWN'}</span>
                      </td>
                      <td>
                        <div className="admin-flag-list">
                          {item.isBestSeller && <span>Best</span>}
                          {item.aiPickDefault && <span>AI pick</span>}
                          {!item.isBestSeller && !item.aiPickDefault && <span>-</span>}
                        </div>
                      </td>
                      <td>
                        <div className="admin-tag-list">
                          {(item.tags ?? []).slice(0, 3).map((tag) => (
                            <span key={tag}>{tag}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div className="admin-actions">
                          <Link to={`/goods/${item.goodsId}`}>View</Link>
                          <button type="button" disabled>
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {totalPages > 0 && (
          <nav className="admin-pagination" aria-label="Admin goods pagination">
            <button type="button" disabled={!hasPreviousPage} onClick={() => goToPage(currentPage - 1)}>
              Previous
            </button>
            <div className="admin-page-list">
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
      </section>
    </main>
  )
}

export default AdminGoodsPage
