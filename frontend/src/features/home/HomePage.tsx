import { type CSSProperties, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { fetchCmsArtists, fetchCmsPage, type CmsArtistProfile, type CmsPage } from '../../api/cms'
import { fetchGoods, type GoodsSummary } from '../../api/goods'
import CartNavLink from '../cart/CartNavLink'
import { applyPreviewTheme, previewTypographyStyle } from '../theme/previewTheme'
import './home.css'

const defaultHomePage: CmsPage = {
  pageKey: 'home',
  eyebrow: 'Project Cyan',
  title: 'AI Vtuber Store',
  summaryTitle: 'Featured Goods',
  summaryBody: 'Browse character goods, artist profiles, and chatbot-powered shopping picks in one place.',
  primaryColor: '#111111',
  accentColor: '#2f6f64',
  backgroundColor: '#ffffff',
  heroImageUrl: null,
}

type HomeArtist = {
  artistId: number | string
  name: string
  groupName?: string | null
  imageUrl?: string | null
  lore?: string | null
}

type HomeCategory = {
  code: string
  label: string
  count: number
}

function formatPrice(value: number | null | undefined) {
  return `KRW ${Number(value ?? 0).toLocaleString()}`
}

function fallbackArtistCards(goods: GoodsSummary[]): HomeArtist[] {
  const seen = new Set<string>()

  return goods.reduce<HomeArtist[]>((artists, item) => {
    const artistName = item.artistName?.trim()
    if (!artistName || seen.has(artistName)) {
      return artists
    }

    seen.add(artistName)
    artists.push({
      artistId: `goods-${item.goodsId}`,
      name: artistName,
      groupName: item.categoryName ?? 'Goods artist',
      imageUrl: item.imageUrl,
      lore: `${item.name} and related collection goods are available now.`,
    })
    return artists
  }, [])
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.at(0))
    .join('')
    .toUpperCase()
}

function categoryCode(label: string) {
  return label
    .replace(/[^a-zA-Z]/g, '')
    .slice(0, 2)
    .toUpperCase()
    .padEnd(2, 'X')
}

function HomePage() {
  const [cmsPage, setCmsPage] = useState<CmsPage>(defaultHomePage)
  const [goods, setGoods] = useState<GoodsSummary[]>([])
  const [totalGoods, setTotalGoods] = useState(0)
  const [artists, setArtists] = useState<CmsArtistProfile[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    const controller = new AbortController()

    async function loadHome() {
      setStatus('loading')

      const [pageResult, goodsResult, artistsResult] = await Promise.allSettled([
        fetchCmsPage('home', { signal: controller.signal }),
        fetchGoods({ page: 0, size: 8, sort: 'createdAt,desc' }, { signal: controller.signal }),
        fetchCmsArtists({ signal: controller.signal }),
      ])

      if (controller.signal.aborted) {
        return
      }

      if (pageResult.status === 'fulfilled') {
        setCmsPage(pageResult.value)
      } else {
        setCmsPage(defaultHomePage)
      }

      if (goodsResult.status === 'fulfilled') {
        setGoods(goodsResult.value.content ?? [])
        setTotalGoods(goodsResult.value.totalElements ?? goodsResult.value.content?.length ?? 0)
      } else {
        setGoods([])
        setTotalGoods(0)
      }

      if (artistsResult.status === 'fulfilled') {
        setArtists((artistsResult.value ?? []).filter((artist) => artist.visible !== false))
      } else {
        setArtists([])
      }

      setStatus(goodsResult.status === 'fulfilled' || artistsResult.status === 'fulfilled' ? 'ready' : 'error')
    }

    loadHome()

    return () => {
      controller.abort()
    }
  }, [])

  const previewPage = applyPreviewTheme(cmsPage)
  const featuredGoods = goods.slice(0, 8)
  const heroGoods = goods.filter((item) => item.imageUrl).slice(0, 5)
  const voiceGoods = goods.filter((item) => {
    const haystack = [item.name, item.categoryName, ...(item.tags ?? [])].join(' ').toLowerCase()
    return haystack.includes('voice') || haystack.includes('digital') || haystack.includes('message')
  })
  const voiceGoodsIds = new Set(voiceGoods.map((item) => item.goodsId))
  const campaignGoods = [...voiceGoods, ...goods.filter((item) => !voiceGoodsIds.has(item.goodsId))].slice(0, 6)
  const artistCards = useMemo<HomeArtist[]>(() => {
    const cmsArtists = artists.map((artist) => ({
      artistId: artist.artistId,
      name: artist.name,
      groupName: artist.groupName,
      imageUrl: artist.imageUrl,
      lore: artist.lore,
    }))

    return (cmsArtists.length ? cmsArtists : fallbackArtistCards(goods)).slice(0, 8)
  }, [artists, goods])
  const categories = useMemo<HomeCategory[]>(() => {
    const counts = goods.reduce<Map<string, number>>((map, item) => {
      const label = item.categoryName ?? 'Goods'
      map.set(label, (map.get(label) ?? 0) + 1)
      return map
    }, new Map<string, number>())

    return Array.from(counts.entries())
      .map(([label, count]) => ({ code: categoryCode(label), label, count }))
      .slice(0, 8)
  }, [goods])

  const heroImageUrl = previewPage.heroImageUrl ?? heroGoods[0]?.imageUrl ?? null
  const pageStyle = {
    '--home-ink': previewPage.primaryColor,
    '--home-accent': previewPage.accentColor,
    '--home-bg': previewPage.backgroundColor,
    ...previewTypographyStyle(),
  } as CSSProperties

  const heroStyle = heroImageUrl
    ? {
        backgroundImage: `linear-gradient(90deg, rgb(255 255 255 / 94%) 0%, rgb(255 255 255 / 82%) 47%, rgb(255 255 255 / 38%) 100%), url("${heroImageUrl}")`,
      }
    : undefined

  return (
    <main className="home-page home-shell-breakout" style={pageStyle}>
      <nav className="home-floating-nav" aria-label="Home navigation">
        <Link to="/" aria-current="page">
          Home
        </Link>
        <Link to="/artists">Artists</Link>
        <Link to="/goods">Goods</Link>
        <CartNavLink />
      </nav>

      <nav className="home-pager" aria-label="Home sections">
        <a href="#home-hero" aria-label="Hero section">
          01
        </a>
        <a href="#home-goods" aria-label="Goods section">
          02
        </a>
        <a href="#home-artists" aria-label="Artists section">
          03
        </a>
        <a href="#home-ai" aria-label="AI section">
          04
        </a>
        <a href="#home-guide" aria-label="Guide section">
          05
        </a>
        <a href="#home-footer" aria-label="Footer section">
          06
        </a>
      </nav>

      <section className="home-hero" id="home-hero" style={heroStyle}>
        <div className="home-hero-copy">
          <p className="home-eyebrow">{previewPage.eyebrow}</p>
          <h1>{previewPage.title}</h1>
          <p className="home-summary">{previewPage.summaryBody}</p>
          <div className="home-actions">
            <Link to="/goods">Shop goods</Link>
            <Link to="/artists">Explore artists</Link>
          </div>
          <dl className="home-stats" aria-label="Store summary">
            <div>
              <dt>Goods</dt>
              <dd>{totalGoods || featuredGoods.length}</dd>
            </div>
            <div>
              <dt>Artists</dt>
              <dd>{artists.length || artistCards.length}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{status === 'loading' ? 'Loading' : status === 'error' ? 'Offline' : 'Live'}</dd>
            </div>
          </dl>
        </div>

        <div className="home-hero-showcase" aria-label="Featured product images">
          {heroGoods.length > 0 ? (
            heroGoods.map((item, index) => (
              <Link className="home-hero-tile" data-featured={index === 0 ? 'true' : undefined} key={item.goodsId} to={`/goods/${item.goodsId}`}>
                {item.imageUrl && <img src={item.imageUrl} alt={item.name} />}
                <span>{item.categoryName ?? 'Goods'}</span>
              </Link>
            ))
          ) : (
            <div className="home-hero-empty">Store preview</div>
          )}
        </div>
      </section>

      <section className="home-section" id="home-goods" aria-labelledby="home-goods-title">
        <div className="home-section-heading">
          <p className="home-eyebrow">New Merch</p>
          <h2 id="home-goods-title">{previewPage.summaryTitle}</h2>
          <Link to="/goods">View all goods</Link>
        </div>

        <div className="home-goods-grid">
          {featuredGoods.map((item) => (
            <article className="home-goods-card" key={item.goodsId}>
              <Link className="home-goods-image" to={`/goods/${item.goodsId}`}>
                {item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : <span>{item.categoryName ?? 'Goods'}</span>}
              </Link>
              <div className="home-card-body">
                <span>{item.artistName ?? 'Artist'}</span>
                <h3>{item.name}</h3>
                <div className="home-card-footer">
                  <strong>{formatPrice(item.price)}</strong>
                  <Link to={`/goods/${item.goodsId}`}>View</Link>
                </div>
              </div>
            </article>
          ))}
          {status === 'loading' &&
            Array.from({ length: 4 }, (_, index) => (
              <article className="home-goods-card home-loading-card" key={`goods-loading-${index}`}>
                <div className="home-goods-image" />
                <div className="home-card-body">
                  <span>Loading goods</span>
                  <h3>Preparing store item</h3>
                </div>
              </article>
            ))}
        </div>
      </section>

      <section className="home-section home-digital-section" id="home-ai" aria-labelledby="home-ai-title">
        <div className="home-section-heading">
          <p className="home-eyebrow">Digital Goods</p>
          <h2 id="home-ai-title">Voice and message picks</h2>
          <Link to="/goods">Digital goods</Link>
        </div>

        <div className="home-campaign-layout">
          <article className="home-campaign-card">
            <span>AI Pick</span>
            <h3>{campaignGoods[0]?.name ?? 'Voice Message Pack'}</h3>
            <p>{campaignGoods[0]?.artistName ?? 'Project Cyan'} recommends this item for live chat shopping flow.</p>
            <Link to={campaignGoods[0] ? `/goods/${campaignGoods[0].goodsId}` : '/goods'}>Open pick</Link>
          </article>
          <div className="home-campaign-grid">
            {campaignGoods.slice(0, 6).map((item) => (
              <Link className="home-campaign-item" key={item.goodsId} to={`/goods/${item.goodsId}`}>
                {item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : <span>{item.categoryName ?? 'Goods'}</span>}
                <strong>{item.name}</strong>
                <span>{formatPrice(item.price)}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-artist-section" id="home-artists" aria-labelledby="home-artists-title">
        <div className="home-section-heading">
          <p className="home-eyebrow">Character First</p>
          <h2 id="home-artists-title">Character goods by artist</h2>
          <Link to="/artists">View all artists</Link>
        </div>

        <div className="home-artist-grid">
          {artistCards.map((artist) => (
            <article className="home-artist-card" key={artist.artistId}>
              <div className="home-artist-image">
                {artist.imageUrl ? <img src={artist.imageUrl} alt={artist.name} /> : <span>{initials(artist.name)}</span>}
              </div>
              <div>
                <span>{artist.groupName ?? 'Project Cyan'}</span>
                <h3>{artist.name}</h3>
                <p>{artist.lore || 'Profile and goods collection are ready for preview.'}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section home-guide-section" id="home-guide" aria-labelledby="home-guide-title">
        <div className="home-section-heading">
          <p className="home-eyebrow">Categories</p>
          <h2 id="home-guide-title">Quick shop map</h2>
          <Link to="/goods">Browse store</Link>
        </div>

        <div className="home-guide-layout">
          <div className="home-category-grid">
            {categories.map((category) => (
              <Link className="home-category-card" key={category.label} to="/goods">
                <strong>{category.code}</strong>
                <span>{category.label}</span>
                <small>{category.count} items</small>
              </Link>
            ))}
          </div>
          <div className="home-announcement-panel">
            <p className="home-eyebrow">Information</p>
            <h3>Shipping and operation notes</h3>
            <ul>
              <li>Pre-order goods ship by the schedule on each product page.</li>
              <li>Digital goods stay available from the account page after payment.</li>
              <li>Local preview data can be replaced when Supabase comes back online.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="home-footer-section" id="home-footer" aria-labelledby="home-footer-title">
        <footer className="home-footer">
          <div className="home-footer-brand">
            <Link to="/" className="home-footer-logo">CS</Link>
            <p className="home-eyebrow">Cyan Stage Goods</p>
            <h2 id="home-footer-title">Project Cyan Official Shop</h2>
            <span>Character goods, digital voice packs, and artist collections for local preview.</span>
          </div>
          <div className="home-footer-columns">
            <div>
              <h3>Official Shop</h3>
              <a href="https://ai-vtuber-shopping-mall.vercel.app/">Cyan Stage Goods</a>
              <a href="https://ai-vtuber-shopping-mall.vercel.app/shop">Shop</a>
              <a href="https://ai-vtuber-shopping-mall.vercel.app/talents">Talents</a>
            </div>
            <div>
              <h3>Service</h3>
              <Link to="/login">Sign in</Link>
              <Link to="/cart">Cart</Link>
              <Link to="/goods">Goods list</Link>
            </div>
            <div>
              <h3>Search</h3>
              <Link to="/goods">Goods</Link>
              <Link to="/artists">Artist</Link>
              <Link to="/goods">Category</Link>
            </div>
            <div>
              <h3>Information</h3>
              <a href="#home-guide">International shipping</a>
              <a href="#home-guide">Payment methods</a>
              <a href="#home-guide">Privacy policy</a>
            </div>
          </div>
          <div className="home-footer-bottom">
            <span>© CYAN PRODUCTION</span>
            <a href="#home-hero">Top</a>
          </div>
        </footer>
      </section>
    </main>
  )
}

export default HomePage
