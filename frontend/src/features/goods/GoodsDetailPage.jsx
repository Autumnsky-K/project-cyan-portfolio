import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchGoodsDetail } from '../../api/goods'
import './goods.css'
import './goods-detail.css'

function GoodsDetailPage() {
  const { goodsId } = useParams()
  const [goods, setGoods] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadGoodsDetail() {
      setStatus('loading')
      setError('')

      try {
        const data = await fetchGoodsDetail(goodsId, { signal: controller.signal })
        setGoods(data)
        setStatus('data')
      } catch (loadError) {
        if (loadError.name === 'AbortError') {
          return
        }
        setError(loadError.message)
        setStatus('error')
      }
    }

    loadGoodsDetail()

    return () => {
      controller.abort()
    }
  }, [goodsId])

  return (
    <main className="goods-page goods-detail-page">
      <header className="store-header">
        <div>
          <p className="eyebrow">SM Universe Store</p>
          <h1>Goods</h1>
        </div>
        <nav className="store-nav" aria-label="Store navigation">
          <Link to="/">Home</Link>
          <Link to="/artists">Artists</Link>
          <Link to="/goods" aria-current="page">
            Goods
          </Link>
          <a href="#cart">Cart</a>
        </nav>
      </header>

      <section className="detail-toolbar">
        <Link className="detail-action" to="/goods">
          Back to Goods
        </Link>
        {goods?.salesStatus && <span className="detail-status">{goods.salesStatus}</span>}
      </section>

      {status === 'loading' && <div className="goods-state detail-state">Loading goods detail...</div>}

      {status === 'error' && (
        <div className="goods-state detail-state error-state">
          <strong>Unable to load goods detail</strong>
          <span>{error}</span>
        </div>
      )}

      {status === 'data' && goods && (
        <>
          <section className="detail-hero">
            <div className="detail-image" aria-label={`${goods.name} image`}>
              {goods.imageUrl ? <img src={goods.imageUrl} alt="" /> : <span>{goods.categoryName ?? 'Goods'}</span>}
            </div>

            <div className="detail-summary">
              <p className="eyebrow">{goods.artistName ?? 'SM Artist'}</p>
              <h2>{goods.name}</h2>
              <strong className="detail-price">KRW {Number(goods.price ?? 0).toLocaleString()}</strong>
              <dl className="detail-meta">
                <div>
                  <dt>Category</dt>
                  <dd>{goods.categoryName ?? 'Not provided'}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{goods.salesStatus ?? 'Not provided'}</dd>
                </div>
              </dl>
              <div className="tag-row">
                {(goods.tags ?? []).map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <div className="detail-actions">
                <button type="button">Add</button>
                <Link className="detail-action" to="/goods">
                  Back
                </Link>
              </div>
            </div>
          </section>

          <section className="detail-section">
            <h2>Description</h2>
            <p>{goods.description || 'No description provided.'}</p>
          </section>

          <section className="detail-section">
            <h2>Product Info</h2>
            <dl className="info-grid">
              <div>
                <dt>Goods ID</dt>
                <dd>{goods.goodsId}</dd>
              </div>
              <div>
                <dt>Artist ID</dt>
                <dd>{goods.artistId ?? 'Not provided'}</dd>
              </div>
              <div>
                <dt>Stock</dt>
                <dd>{goods.stockCount ?? 'Not provided'}</dd>
              </div>
              <div>
                <dt>AI Pick</dt>
                <dd>{goods.aiPickDefault ? 'Yes' : 'No'}</dd>
              </div>
              <div>
                <dt>Best Seller</dt>
                <dd>{goods.isBestSeller ? 'Yes' : 'No'}</dd>
              </div>
            </dl>
          </section>
        </>
      )}
    </main>
  )
}

export default GoodsDetailPage
