import { type CSSProperties, type MouseEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { fetchCmsArtists, fetchCmsPage, type CmsArtistProfile, type CmsPage } from '../../api/cms'
import { fetchGoods, type GoodsSummary } from '../../api/goods'
import { applyPreviewTheme, previewTypographyStyle } from '../theme/previewTheme'
import './home.css'

const defaultHomeCopySettings = {
  navHome: 'Home',
  navArtists: 'Artists',
  navGoods: 'Goods',
  navCart: 'Cart',
  statusSignalLabel: 'SHOP SIGNAL',
  statusReadyLabel: 'Live',
  statusLoadingLabel: 'Loading',
  statusErrorLabel: 'Offline',
  statusModeLabel: 'FULLPAGE MODE',
  artistsEyebrow: 'Cyan Idol Network',
  artistsTitle: 'Artist Signals',
  physicalEyebrow: 'Physical Goods',
  physicalTitle: 'Goods you can hold',
  physicalCta: 'View physical',
  digitalEyebrow: 'Digital Goods',
  digitalTitle: 'Voice, message, and download drops',
  digitalCta: 'Open digital',
  digitalFeatureEyebrow: 'DATA DROP',
  digitalFeatureDescription: '{artistName} channel goods for voice, message, download, or AI-assisted shopping flows.',
  digitalFeatureCta: 'Open drop',
  byArtistEyebrow: 'Goods By Artist',
  byArtistTitle: 'Shop from each artist channel',
  byArtistCta: 'Browse artist goods',
  categoryEyebrow: 'Goods Categories',
  categoryTitle: 'Browse by type',
  categoryCta: 'Open categories',
  footerEyebrow: 'Project Cyan SHOP',
  footerTitle: 'Official Shop Index',
  footerShopTitle: 'Shop',
  footerShopAllGoods: 'All goods',
  footerShopPhysicalGoods: 'Physical goods',
  footerShopDigitalGoods: 'Digital goods',
  footerArtistTitle: 'Artist',
  footerArtistArtistsPage: 'Artists page',
  footerArtistGroups: 'Artist groups',
  footerArtistGoodsByArtist: 'Goods by artist',
  footerAccountTitle: 'Account',
  footerAccountSignIn: 'Sign in',
  footerAccountCart: 'Cart',
  footerAccountLikes: 'Likes',
  footerInfoTitle: 'Info',
  footerInfoTop: 'Top',
  footerInfoCategories: 'Categories',
  footerBottomLabel: 'CYAN PRODUCTION',
  footerBackToFirst: 'Back to first page',
}

const defaultHomePage: CmsPage = {
  pageKey: 'home',
  eyebrow: 'Project Cyan',
  title: 'Project Cyan SHOP',
  summaryTitle: 'Official shop signal',
  summaryBody: 'A vertical shop map for characters, physical goods, digital drops, artist collections, and category browsing.',
  primaryColor: '#ffffff',
  accentColor: '#00d5ff',
  backgroundColor: '#030308',
  heroImageUrl: null,
  copySettings: defaultHomeCopySettings,
}

type HomeArtist = {
  artistId: number | string
  name: string
  groupName: string
  imageUrl: string | null
  lore: string
  signal: string
}

type HomeCategory = {
  code: string
  label: string
  count: number
}

type ArtistGoodsGroup = {
  artistName: string
  count: number
  imageUrl: string | null
  sampleGoods: GoodsSummary | null
}

type HomeDigitalDrop = {
  name: string
  typeLabel: string
  artistName: string
  priceLabel: string
  href: string
}

const fallbackArtists: HomeArtist[] = [
  {
    artistId: 'hiena-01',
    name: 'Hiena',
    groupName: 'Mirage Core',
    imageUrl: '/artist-idols/hiena/hiena-01-desert-archive-v5.png',
    lore: 'Sunlit archive pop, cyan accents, and future-idol field notes.',
    signal: 'CY-01',
  },
  {
    artistId: 'hiena-02',
    name: 'Hiena Tide',
    groupName: 'Sweet Wave',
    imageUrl: '/artist-idols/hiena/hiena-02-autumn-bakery-v5.png',
    lore: 'Warm arcade color, pastry mood, and sharp candy-bass styling.',
    signal: 'CY-02',
  },
  {
    artistId: 'rikane-01',
    name: 'Rikane',
    groupName: 'Neon Route',
    imageUrl: '/artist-idols/rikane/rikane-01-autumn-courier-v5.png',
    lore: 'Courier frequency, glossy stickers, and fast city movement.',
    signal: 'CY-03',
  },
  {
    artistId: 'manase-01',
    name: 'Manase',
    groupName: 'Lunar Glass',
    imageUrl: '/artist-idols/manase/manase-01-violet-rain-lantern-v5.png',
    lore: 'Violet lantern vocals, rain texture, and elegant future romance.',
    signal: 'CY-04',
  },
]

const fallbackDigitalDrops: HomeDigitalDrop[] = [
  {
    name: 'Voice Message Pack',
    typeLabel: 'Voice',
    artistName: 'Project Cyan',
    priceLabel: 'COMING SOON',
    href: '/goods',
  },
  {
    name: 'Wallpaper Signal Set',
    typeLabel: 'Download',
    artistName: 'Project Cyan',
    priceLabel: 'COMING SOON',
    href: '/goods',
  },
  {
    name: 'Live Ticket Code',
    typeLabel: 'Ticket',
    artistName: 'Project Cyan',
    priceLabel: 'COMING SOON',
    href: '/goods',
  },
  {
    name: 'AR Sticker Drop',
    typeLabel: 'AR',
    artistName: 'Project Cyan',
    priceLabel: 'COMING SOON',
    href: '/goods',
  },
  {
    name: 'Member Signal Pass',
    typeLabel: 'Pass',
    artistName: 'Project Cyan',
    priceLabel: 'COMING SOON',
    href: '/goods',
  },
]

function formatPrice(value: number | null | undefined) {
  return `KRW ${Number(value ?? 0).toLocaleString()}`
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

function isDemoArtist(artist: CmsArtistProfile) {
  return /^Artist [A-Z]$/.test(artist.name) || Boolean(artist.imageUrl?.includes('cdn.example.com'))
}

function isDigitalGoods(item: GoodsSummary) {
  const haystack = [item.name, item.categoryName, ...(item.tags ?? [])].join(' ').toLowerCase()
  return ['digital', 'voice', 'message', 'download', 'wallpaper', 'stream', 'ticket'].some((keyword) => haystack.includes(keyword))
}

function textOrDefault(value: string | null | undefined, fallback: string) {
  const normalized = value?.trim()
  return normalized || fallback
}

function isLegacyHomeCmsPage(page: CmsPage) {
  return page.eyebrow === 'SM Universe Store'
    && page.title === 'Goods'
    && page.summaryTitle === 'Featured Goods'
    && page.summaryBody === 'Showing store items'
    && !Object.keys(page.copySettings ?? {}).length
}

function toHomeArtist(artist: CmsArtistProfile, index: number): HomeArtist {
  const fallback = fallbackArtists[index % fallbackArtists.length]

  return {
    artistId: artist.artistId,
    name: artist.name,
    groupName: artist.groupName || fallback.groupName,
    imageUrl: artist.imageUrl?.includes('cdn.example.com') ? fallback.imageUrl : artist.imageUrl || fallback.imageUrl,
    lore: artist.lore || fallback.lore,
    signal: `CY-${String(index + 1).padStart(2, '0')}`,
  }
}

function groupGoodsByArtist(goods: GoodsSummary[]): ArtistGoodsGroup[] {
  const groups = goods.reduce<Map<string, ArtistGoodsGroup>>((map, item) => {
    const artistName = item.artistName?.trim() || 'Project Cyan'
    const current = map.get(artistName)

    if (current) {
      current.count += 1
      current.imageUrl = current.imageUrl || item.imageUrl
      current.sampleGoods = current.sampleGoods || item
    } else {
      map.set(artistName, {
        artistName,
        count: 1,
        imageUrl: item.imageUrl,
        sampleGoods: item,
      })
    }

    return map
  }, new Map<string, ArtistGoodsGroup>())

  return Array.from(groups.values()).slice(0, 6)
}

function HomePage() {
  const navigate = useNavigate()
  const wheelLockRef = useRef(false)
  const routingArtistRef = useRef(false)
  const artistRouteTimerRef = useRef<number | undefined>(undefined)
  const [cmsPage, setCmsPage] = useState<CmsPage>(defaultHomePage)
  const [goods, setGoods] = useState<GoodsSummary[]>([])
  const [totalGoods, setTotalGoods] = useState(0)
  const [artists, setArtists] = useState<CmsArtistProfile[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [routingArtistId, setRoutingArtistId] = useState<string | null>(null)
  const [artistDeckActiveIndex, setArtistDeckActiveIndex] = useState(0)
  const [artistDeckPaused, setArtistDeckPaused] = useState(false)
  const [artistDeckViewportWidth, setArtistDeckViewportWidth] = useState(() => (typeof window === 'undefined' ? 1280 : window.innerWidth))

  useEffect(() => {
    const controller = new AbortController()

    async function loadHome() {
      setStatus('loading')

      const [pageResult, goodsResult, artistsResult] = await Promise.allSettled([
        fetchCmsPage('home', { signal: controller.signal }),
        fetchGoods({ page: 0, size: 12, sort: 'createdAt,desc' }, { signal: controller.signal }),
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

  useEffect(() => {
    function handleWindowWheel(event: WheelEvent) {
      if (moveHomePageByDelta(event.deltaY)) {
        event.preventDefault()
      }
    }

    document.documentElement.classList.add('cyan-home-active')
    document.body.classList.add('cyan-home-active')
    window.addEventListener('wheel', handleWindowWheel, { passive: false })

    return () => {
      document.documentElement.classList.remove('cyan-home-active')
      document.body.classList.remove('cyan-home-active')
      window.removeEventListener('wheel', handleWindowWheel)
    }
  }, [])

  useEffect(() => {
    function handleWindowResize() {
      setArtistDeckViewportWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleWindowResize)

    return () => {
      window.removeEventListener('resize', handleWindowResize)
    }
  }, [])

  useEffect(() => {
    function scrollToHashPanel(behavior: ScrollBehavior = 'auto') {
      const hashId = decodeURIComponent(window.location.hash.replace(/^#/, ''))
      if (!hashId.startsWith('home-')) {
        return
      }

      document.getElementById(hashId)?.scrollIntoView({ behavior, block: 'start' })
    }

    const initialHashTimers = [
      window.setTimeout(() => {
        scrollToHashPanel()
      }, 0),
      window.setTimeout(() => {
        scrollToHashPanel()
      }, 180),
    ]

    function handleHashChange() {
      scrollToHashPanel('smooth')
    }

    window.addEventListener('hashchange', handleHashChange)

    return () => {
      initialHashTimers.forEach((timerId) => window.clearTimeout(timerId))
      window.removeEventListener('hashchange', handleHashChange)
      window.clearTimeout(artistRouteTimerRef.current)
    }
  }, [])

  const previewPage = applyPreviewTheme(cmsPage)
  const legacyHomeCmsPage = isLegacyHomeCmsPage(previewPage)
  const homeCopySettings = {
    ...defaultHomeCopySettings,
    ...(legacyHomeCmsPage ? {} : previewPage.copySettings ?? {}),
  }
  const copy = (key: keyof typeof defaultHomeCopySettings) => textOrDefault(homeCopySettings[key], defaultHomeCopySettings[key])
  const displayPage = {
    ...previewPage,
    eyebrow: textOrDefault(legacyHomeCmsPage ? '' : previewPage.eyebrow, defaultHomePage.eyebrow),
    title: textOrDefault(legacyHomeCmsPage ? '' : previewPage.title, defaultHomePage.title),
    summaryTitle: textOrDefault(legacyHomeCmsPage ? '' : previewPage.summaryTitle, defaultHomePage.summaryTitle),
    summaryBody: textOrDefault(legacyHomeCmsPage ? '' : previewPage.summaryBody, defaultHomePage.summaryBody),
    primaryColor: previewPage.primaryColor === '#111111' ? defaultHomePage.primaryColor : previewPage.primaryColor,
    accentColor: previewPage.accentColor === '#2f6f64' ? defaultHomePage.accentColor : previewPage.accentColor,
    backgroundColor: previewPage.backgroundColor === '#ffffff' ? defaultHomePage.backgroundColor : previewPage.backgroundColor,
  }

  const pageStyle = {
    '--home-ink': displayPage.primaryColor,
    '--home-accent': displayPage.accentColor,
    '--home-bg': displayPage.backgroundColor,
    ...previewTypographyStyle(),
  } as CSSProperties

  const artistGroups = useMemo<HomeArtist[]>(() => {
    const managedArtists = artists.filter((artist) => !isDemoArtist(artist)).map(toHomeArtist)
    return (managedArtists.length ? managedArtists : fallbackArtists).slice(0, 7)
  }, [artists])

  useEffect(() => {
    setArtistDeckActiveIndex((currentIndex) => {
      if (!artistGroups.length) {
        return 0
      }

      return currentIndex % artistGroups.length
    })
  }, [artistGroups.length])

  useEffect(() => {
    if (artistGroups.length <= 1 || artistDeckPaused || routingArtistRef.current) {
      return undefined
    }

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (motionQuery.matches) {
      return undefined
    }

    const timerId = window.setInterval(() => {
      setArtistDeckActiveIndex((currentIndex) => (currentIndex + 1) % artistGroups.length)
    }, 5000)

    return () => {
      window.clearInterval(timerId)
    }
  }, [artistDeckPaused, artistGroups.length])

  const physicalGoods = useMemo(() => {
    const physical = goods.filter((item) => !isDigitalGoods(item))
    return (physical.length ? physical : goods).slice(0, 6)
  }, [goods])

  const digitalGoods = useMemo(() => {
    const digital = goods.filter(isDigitalGoods)
    return digital.slice(0, 6)
  }, [goods])

  const digitalDrops = useMemo<HomeDigitalDrop[]>(() => {
    if (!digitalGoods.length) {
      return fallbackDigitalDrops
    }

    return digitalGoods.slice(0, 5).map((item) => ({
      name: item.name,
      typeLabel: item.categoryName ?? 'Digital',
      artistName: item.artistName ?? 'Project Cyan',
      priceLabel: formatPrice(item.price),
      href: `/goods/${item.goodsId}`,
    }))
  }, [digitalGoods])

  const artistGoodsGroups = useMemo(() => groupGoodsByArtist(goods), [goods])

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

  const statusLabel = status === 'loading' ? copy('statusLoadingLabel') : status === 'error' ? copy('statusErrorLabel') : copy('statusReadyLabel')
  const artistDeckCardWidth = Math.min(252, Math.max(168, artistDeckViewportWidth * 0.16))
  const artistDeckSideGuard = Math.min(180, Math.max(60, artistDeckViewportWidth * 0.12))
  const artistDeckGapCount = Math.max(artistGroups.length - 1, 1)
  const artistDeckOpenStep = artistDeckCardWidth + 24
  const artistDeckMinStep = artistDeckCardWidth * 0.34
  const artistDeckFitStep = (artistDeckViewportWidth - artistDeckSideGuard - artistDeckCardWidth) / artistDeckGapCount
  const artistDeckStep = Math.max(artistDeckMinStep, Math.min(artistDeckOpenStep, artistDeckFitStep))
  const artistDeckStyle = {
    '--artist-count': artistGroups.length,
    '--artist-deck-card-width': `${artistDeckCardWidth}px`,
    '--artist-deck-step': `${artistDeckStep}px`,
  } as CSSProperties

  function moveHomePageByDelta(deltaY: number) {
    if (routingArtistRef.current) {
      return true
    }

    if (Math.abs(deltaY) < 8) {
      return false
    }

    if (wheelLockRef.current) {
      return true
    }

    const pageHeight = window.innerHeight || 1
    const maxIndex = Math.max(document.querySelectorAll('.home-panel').length - 1, 0)
    const currentIndex = Math.round(window.scrollY / pageHeight)
    const nextIndex = Math.min(Math.max(currentIndex + (deltaY > 0 ? 1 : -1), 0), maxIndex)

    if (nextIndex === currentIndex) {
      return true
    }

    wheelLockRef.current = true
    window.scrollTo({
      top: nextIndex * pageHeight,
      behavior: 'smooth',
    })

    window.setTimeout(() => {
      wheelLockRef.current = false
    }, 720)

    return true
  }

  function handleArtistSignalClick(event: MouseEvent<HTMLAnchorElement>, targetPath: string, artistId: number | string) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) {
      return
    }

    event.preventDefault()
    window.clearTimeout(artistRouteTimerRef.current)
    routingArtistRef.current = true
    setArtistDeckPaused(true)
    setRoutingArtistId(String(artistId))

    artistRouteTimerRef.current = window.setTimeout(() => {
      navigate(targetPath)
    }, 560)
  }

  return (
    <main className={`home-page home-shell-breakout${routingArtistId ? ' home-artist-routing' : ''}`} style={pageStyle}>
      <div className="home-stage-lines" aria-hidden="true" />
      <div className="home-scanline" aria-hidden="true" />
      <div className="cyan-led-frame" aria-hidden="true" />

      <nav className="home-pager" aria-label="Home sections">
        {['01', '02', '03', '04', '05', '06', '07'].map((label, index) => (
          <a href={`#home-${index + 1}`} key={label} aria-label={`Home page ${label}`}>
            {label}
          </a>
        ))}
      </nav>

      <section className="home-panel home-brand-panel" id="home-1" aria-labelledby="home-brand-title">
        <div className="home-brand-orbit" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="home-brand-copy">
          <p className="home-eyebrow">{displayPage.eyebrow}</p>
          <h1 id="home-brand-title">{displayPage.title}</h1>
          <strong>{displayPage.summaryTitle}</strong>
        </div>
        <div className="home-brand-status" aria-label="Shop status">
          <span>{copy('statusSignalLabel')}</span>
          <span>{statusLabel}</span>
          <span>{copy('statusModeLabel')}</span>
        </div>
      </section>

      <section className="home-panel home-artists-panel" id="home-2" aria-labelledby="home-artists-title">
        <div className="home-section-heading">
          <p className="home-eyebrow">{copy('artistsEyebrow')}</p>
          <h2 id="home-artists-title">{copy('artistsTitle')}</h2>
        </div>
        <div
          className="home-artist-signal-deck"
          onBlur={(event) => {
            const nextFocus = event.relatedTarget
            if (!(nextFocus instanceof Node) || !event.currentTarget.contains(nextFocus)) {
              setArtistDeckPaused(false)
            }
          }}
          onFocus={() => setArtistDeckPaused(true)}
          onMouseEnter={() => setArtistDeckPaused(true)}
          onMouseLeave={() => setArtistDeckPaused(false)}
          style={artistDeckStyle}
        >
          <div className="home-artist-deck-stack" aria-label="Artist signals">
            {artistGroups.map((artist, index) => {
              const count = artistGroups.length
              const slot = count ? index - (count - 1) / 2 : 0
              const depth = Math.abs(slot)
              const isActive = index === artistDeckActiveIndex
              const deckOpacity = isActive ? 1 : Math.max(0.78, 0.92 - depth * 0.04)
              const deckZ = isActive ? 140 : 80 + index

              return (
                <Link
                  className="home-artist-signal"
                  data-active={isActive ? 'true' : undefined}
                  data-routing={routingArtistId === String(artist.artistId) ? 'true' : undefined}
                  key={artist.artistId}
                  onClick={(event) => handleArtistSignalClick(event, `/artists#artist-${artist.artistId}`, artist.artistId)}
                  style={
                    {
                      '--deck-depth': depth,
                      '--deck-drop': '0px',
                      '--deck-opacity': deckOpacity,
                      '--deck-scale': 1,
                      '--deck-slot': slot,
                      '--deck-tilt': '0deg',
                      '--deck-z': deckZ,
                    } as CSSProperties
                  }
                  to={`/artists#artist-${artist.artistId}`}
                >
                  {artist.imageUrl ? <img src={artist.imageUrl} alt={artist.name} /> : <span>{initials(artist.name)}</span>}
                  <small>{artist.signal}</small>
                  <strong>{artist.name}</strong>
                  <em>{artist.groupName}</em>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="home-panel home-physical-panel" id="home-3" aria-labelledby="home-physical-title">
        <div className="home-section-heading">
          <p className="home-eyebrow">{copy('physicalEyebrow')}</p>
          <h2 id="home-physical-title">{copy('physicalTitle')}</h2>
          <Link to="/goods">{copy('physicalCta')}</Link>
        </div>
        <div className="home-goods-strip">
          {physicalGoods.map((item) => (
            <Link className="home-goods-slit" key={item.goodsId} to={`/goods/${item.goodsId}`}>
              {item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : <span>{item.categoryName ?? 'Goods'}</span>}
              <small>{item.artistName ?? item.categoryName ?? 'Project Cyan'}</small>
              <strong>{item.name}</strong>
              <em>{formatPrice(item.price)}</em>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-panel home-digital-panel" id="home-4" aria-labelledby="home-digital-title">
        <div className="home-section-heading">
          <p className="home-eyebrow">{copy('digitalEyebrow')}</p>
          <h2 id="home-digital-title">{copy('digitalTitle')}</h2>
          <Link to="/goods">{copy('digitalCta')}</Link>
        </div>
        <div className="home-digital-layout">
          <article className="home-digital-feature">
            <span>{copy('digitalFeatureEyebrow')}</span>
            <h3>{digitalDrops[0]?.name ?? 'Digital Signal Pack'}</h3>
            <p>{copy('digitalFeatureDescription').replace('{artistName}', digitalDrops[0]?.artistName ?? 'Project Cyan')}</p>
            <Link to={digitalDrops[0]?.href ?? '/goods'}>{copy('digitalFeatureCta')}</Link>
          </article>
          <div className="home-digital-list">
            {digitalDrops.map((item) => (
              <Link key={item.name} to={item.href}>
                <span>{item.typeLabel}</span>
                <strong>{item.name}</strong>
                <em>{item.priceLabel}</em>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-panel home-by-artist-panel" id="home-5" aria-labelledby="home-by-artist-title">
        <div className="home-section-heading">
          <p className="home-eyebrow">{copy('byArtistEyebrow')}</p>
          <h2 id="home-by-artist-title">{copy('byArtistTitle')}</h2>
          <Link to="/goods">{copy('byArtistCta')}</Link>
        </div>
        <div className="home-by-artist-grid">
          {(artistGoodsGroups.length ? artistGoodsGroups : artistGroups.map((artist) => ({ artistName: artist.name, count: 0, imageUrl: artist.imageUrl, sampleGoods: null }))).map((group) => (
            <Link className="home-by-artist-card" key={group.artistName} to={group.sampleGoods ? `/goods/${group.sampleGoods.goodsId}` : '/artists'}>
              {group.imageUrl ? <img src={group.imageUrl} alt={group.artistName} /> : <span>{initials(group.artistName)}</span>}
              <strong>{group.artistName}</strong>
              <small>{group.count || 'Artist'} goods</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-panel home-category-panel" id="home-6" aria-labelledby="home-category-title">
        <div className="home-section-heading">
          <p className="home-eyebrow">{copy('categoryEyebrow')}</p>
          <h2 id="home-category-title">{copy('categoryTitle')}</h2>
          <Link to="/goods">{copy('categoryCta')}</Link>
        </div>
        <div className="home-category-grid">
          {(categories.length ? categories : [{ code: 'GD', label: 'Goods', count: totalGoods || goods.length }]).map((category) => (
            <Link className="home-category-card" key={category.label} to="/goods">
              <strong>{category.code}</strong>
              <span>{category.label}</span>
              <small>{category.count} items</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-panel home-footer-panel" id="home-7" aria-labelledby="home-footer-title">
        <footer className="home-footer">
          <div className="home-footer-brand">
            <Link to="/" className="home-footer-logo">PC</Link>
            <p className="home-eyebrow">{copy('footerEyebrow')}</p>
            <h2 id="home-footer-title">{copy('footerTitle')}</h2>
            <span>{displayPage.summaryBody}</span>
          </div>
          <div className="home-footer-columns">
            <div>
              <h3>{copy('footerShopTitle')}</h3>
              <Link to="/goods">{copy('footerShopAllGoods')}</Link>
              <a href="#home-3">{copy('footerShopPhysicalGoods')}</a>
              <a href="#home-4">{copy('footerShopDigitalGoods')}</a>
            </div>
            <div>
              <h3>{copy('footerArtistTitle')}</h3>
              <Link to="/artists">{copy('footerArtistArtistsPage')}</Link>
              <a href="#home-2">{copy('footerArtistGroups')}</a>
              <a href="#home-5">{copy('footerArtistGoodsByArtist')}</a>
            </div>
            <div>
              <h3>{copy('footerAccountTitle')}</h3>
              <Link to="/login">{copy('footerAccountSignIn')}</Link>
              <Link to="/cart">{copy('footerAccountCart')}</Link>
              <Link to="/like">{copy('footerAccountLikes')}</Link>
            </div>
            <div>
              <h3>{copy('footerInfoTitle')}</h3>
              <a href="#home-1">{copy('footerInfoTop')}</a>
              <a href="#home-6">{copy('footerInfoCategories')}</a>
              <span>{statusLabel}</span>
            </div>
          </div>
          <div className="home-footer-bottom">
            <span>{copy('footerBottomLabel')}</span>
            <a href="#home-1">{copy('footerBackToFirst')}</a>
          </div>
        </footer>
      </section>
    </main>
  )
}

export default HomePage
