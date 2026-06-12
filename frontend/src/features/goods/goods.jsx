import './goods.css'

const filters = [
  {
    title: 'Artist',
    options: ['All', 'aespa', 'NCT', 'RIIZE', 'Red Velvet'],
  },
  {
    title: 'Category',
    options: ['Photo Card', 'Apparel', 'Album Goods', 'Light Stick', 'Stationery'],
  },
  {
    title: 'Price',
    options: ['Under 20,000', '20,000 - 50,000', '50,000 - 100,000'],
  },
  {
    title: 'Tag',
    options: ['New', 'Best', 'Limited', 'Pre-order'],
  },
]

const goods = [
  {
    name: 'Drama Photo Card Set',
    artist: 'aespa',
    category: 'Photo Card',
    price: '18,000',
    status: 'Best',
    tags: ['Photo Card', 'Best'],
  },
  {
    name: 'NCT Wish Logo Hoodie',
    artist: 'NCT',
    category: 'Apparel',
    price: '72,000',
    status: 'New',
    tags: ['Apparel', 'New'],
  },
  {
    name: 'RIIZE Memories Tin Case',
    artist: 'RIIZE',
    category: 'Stationery',
    price: '24,000',
    status: 'Limited',
    tags: ['Tin Case', 'Limited'],
  },
  {
    name: 'Red Velvet Fan Kit',
    artist: 'Red Velvet',
    category: 'Album Goods',
    price: '39,000',
    status: 'Pre-order',
    tags: ['Kit', 'Pre-order'],
  },
  {
    name: 'SM Town Mini Light Keyring',
    artist: 'SM Town',
    category: 'Light Stick',
    price: '21,000',
    status: 'New',
    tags: ['Keyring', 'Gift'],
  },
  {
    name: 'Winter Edition Sticker Pack',
    artist: 'aespa',
    category: 'Stationery',
    price: '9,000',
    status: 'Best',
    tags: ['Sticker', 'Best'],
  },
]

function GoodsPage() {
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
          <input type="search" placeholder="Search goods, artist, category" />
        </label>
        <label className="sort-field">
          <span>Sort</span>
          <select defaultValue="popular">
            <option value="popular">Popular</option>
            <option value="new">Newest</option>
            <option value="price-low">Price low to high</option>
            <option value="price-high">Price high to low</option>
          </select>
        </label>
      </section>

      <section className="store-layout" id="goods">
        <aside className="filter-panel" aria-label="Goods filters">
          <div className="panel-heading">
            <h2>Filters</h2>
            <button type="button">Reset</button>
          </div>
          {filters.map((group) => (
            <fieldset className="filter-group" key={group.title}>
              <legend>{group.title}</legend>
              {group.options.map((option) => (
                <label key={option}>
                  <input type="checkbox" />
                  <span>{option}</span>
                </label>
              ))}
            </fieldset>
          ))}
        </aside>

        <div className="goods-content">
          <div className="result-summary">
            <div>
              <h2>Featured Goods</h2>
              <p>Showing {goods.length} store items</p>
            </div>
            <div className="view-toggle" aria-label="View options">
              <button type="button" aria-pressed="true">
                Grid
              </button>
              <button type="button">List</button>
            </div>
          </div>

          <div className="goods-grid">
            {goods.map((item) => (
              <article className="goods-card" key={item.name}>
                <div className="goods-image" aria-label={`${item.name} image placeholder`}>
                  <span>{item.category}</span>
                </div>
                <div className="goods-card-body">
                  <div className="card-topline">
                    <span>{item.artist}</span>
                    <strong>{item.status}</strong>
                  </div>
                  <h3>{item.name}</h3>
                  <p>{item.category}</p>
                  <div className="tag-row">
                    {item.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <div className="card-footer">
                    <strong>KRW {item.price}</strong>
                    <div>
                      <button type="button">View</button>
                      <button type="button">Add</button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default GoodsPage
