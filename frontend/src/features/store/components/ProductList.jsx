import { formatPrice } from '../utils/storeUtils'

function ProductList({
  products,
  status,
  message,
  onAddToCart,
  onUseFallbackProducts,
}) {
  return (
    <section className="store-section" id="products" aria-labelledby="products-title">
      <div className="section-heading">
        <h2 id="products-title">Products</h2>
        {status === 'empty' && (
          <button type="button" onClick={onUseFallbackProducts}>
            미리보기 상품 사용
          </button>
        )}
      </div>
      {message && <p className="status-message">{message}</p>}
      {status === 'loading' ? (
        <p>상품을 불러오는 중입니다...</p>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <article className="product-card" key={product.id}>
              <div>
                <p className="product-artist">{product.artist}</p>
                <h3>{product.name}</h3>
                <p>{product.description}</p>
              </div>
              <div className="product-card-footer">
                <strong>{formatPrice(product.price)}</strong>
                <button type="button" onClick={() => onAddToCart(product.id)}>
                  담기
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default ProductList
