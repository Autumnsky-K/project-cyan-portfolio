import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CartNavLink from '../cart/CartNavLink'

import { fetchCmsArtists, fetchCmsPage, type CmsArtistProfile, type CmsPage } from '../../api/cms'
import { applyPreviewTheme, previewTypographyStyle } from '../theme/previewTheme'
import './artist.css'

type ArtistVisual = {
  accentColor: string
  glowColor: string
  imageUrl: string
}

type ArtistProfile = {
  artistId: number | string
  name: string
  groupName: string
  imageUrl: string | null
  lore: string
  debutDate: string
  collections: string[]
  accentColor: string
  glowColor: string
  area: string
  bpm: string
  signal: string
  stationCode: string
}

const defaultArtistPage: CmsPage = {
  pageKey: 'artists',
  eyebrow: 'Cyan Character Area',
  title: 'CHARACTER',
  summaryTitle: 'CYAN',
  summaryBody: 'A full-screen character signal map for virtual idols, stage districts, music energy, and future-pop worlds.',
  primaryColor: '#f7fbff',
  accentColor: '#00d5ff',
  backgroundColor: '#070815',
  heroImageUrl: null,
}

const fallbackVisuals: ArtistVisual[] = [
  { accentColor: '#ff5fb7', glowColor: '#9bff4d', imageUrl: '/artist-idols/hiena/hiena-01-desert-archive-v5.png' },
  { accentColor: '#00d8ff', glowColor: '#fff34a', imageUrl: '/artist-idols/hiena/hiena-02-autumn-bakery-v5.png' },
  { accentColor: '#ffdc3e', glowColor: '#00e5ff', imageUrl: '/artist-idols/rikane/rikane-01-autumn-courier-v5.png' },
  { accentColor: '#5a7cff', glowColor: '#ff7ad9', imageUrl: '/artist-idols/rikane/rikane-02-desert-observatory-v5.png' },
  { accentColor: '#b46dff', glowColor: '#58f7ff', imageUrl: '/artist-idols/manase/manase-01-violet-rain-lantern-v5.png' },
  { accentColor: '#60d8ff', glowColor: '#f5f7ff', imageUrl: '/artist-idols/manase/manase-02-porcelain-atelier-v5.png' },
]

const fallbackArtists: ArtistProfile[] = [
  {
    artistId: 'hiena-01',
    name: 'Hiena',
    groupName: 'Desert Archive Unit',
    imageUrl: fallbackVisuals[0].imageUrl,
    lore: 'A bright signal operator crossing sunlit ruins, glossy stage tech, and sugar-pop hooks into one high-voltage idol channel.',
    debutDate: 'CY-2026.06',
    collections: ['Desert Archive', 'Signal Charm', 'Future Pop'],
    accentColor: fallbackVisuals[0].accentColor,
    glowColor: fallbackVisuals[0].glowColor,
    area: 'MIRAGE CORE',
    bpm: '142',
    signal: 'CANDY-RUSH',
    stationCode: 'CY-01',
  },
  {
    artistId: 'hiena-02',
    name: 'Hiena Tide',
    groupName: 'Bakery Street Signal',
    imageUrl: fallbackVisuals[1].imageUrl,
    lore: 'A warm arcade-pop persona with pastry colors, chrome accents, and a cute but sharp broadcast rhythm.',
    debutDate: 'CY-2026.07',
    collections: ['Autumn Bakery', 'Stage Snack', 'Neon Apron'],
    accentColor: fallbackVisuals[1].accentColor,
    glowColor: fallbackVisuals[1].glowColor,
    area: 'SWEET WAVE',
    bpm: '150',
    signal: 'SUGAR-BASS',
    stationCode: 'CY-02',
  },
  {
    artistId: 'rikane-01',
    name: 'Rikane',
    groupName: 'Courier Frequency',
    imageUrl: fallbackVisuals[2].imageUrl,
    lore: 'A quick-footed courier idol carrying message beats through city districts, glossy stickers, and kinetic club drops.',
    debutDate: 'CY-2026.08',
    collections: ['Autumn Courier', 'Delivery Beat', 'City Patch'],
    accentColor: fallbackVisuals[2].accentColor,
    glowColor: fallbackVisuals[2].glowColor,
    area: 'NEON ROUTE',
    bpm: '156',
    signal: 'RUN-STEP',
    stationCode: 'CY-03',
  },
  {
    artistId: 'rikane-02',
    name: 'Rikane Ray',
    groupName: 'Desert Observatory',
    imageUrl: fallbackVisuals[3].imageUrl,
    lore: 'A stargazing edition tuned for blue hour synths, laser trails, and clear-eyed future idol silhouettes.',
    debutDate: 'CY-2026.09',
    collections: ['Observatory', 'Star Map', 'Ray Module'],
    accentColor: fallbackVisuals[3].accentColor,
    glowColor: fallbackVisuals[3].glowColor,
    area: 'ORBIT YARD',
    bpm: '136',
    signal: 'STAR-LINE',
    stationCode: 'CY-04',
  },
  {
    artistId: 'manase-01',
    name: 'Manase',
    groupName: 'Violet Rain Channel',
    imageUrl: fallbackVisuals[4].imageUrl,
    lore: 'A violet-lantern vocalist balancing soft rain textures with hard neon cuts and elegant future-romance styling.',
    debutDate: 'CY-2026.10',
    collections: ['Violet Rain', 'Lantern Code', 'Velvet Spark'],
    accentColor: fallbackVisuals[4].accentColor,
    glowColor: fallbackVisuals[4].glowColor,
    area: 'LUNAR GLASS',
    bpm: '110',
    signal: 'VIOLET-LINE',
    stationCode: 'CY-05',
  },
  {
    artistId: 'manase-02',
    name: 'Manase Blanc',
    groupName: 'Porcelain Atelier',
    imageUrl: fallbackVisuals[5].imageUrl,
    lore: 'A clean ice-pop channel for glassy vocals, porcelain-white costume detail, and precise high-fashion idol motion.',
    debutDate: 'CY-2026.11',
    collections: ['Porcelain Atelier', 'Crystal Tone', 'White Signal'],
    accentColor: fallbackVisuals[5].accentColor,
    glowColor: fallbackVisuals[5].glowColor,
    area: 'GLASS SNOW',
    bpm: '124',
    signal: 'CRYO-DREAM',
    stationCode: 'CY-06',
  },
]

const areaNames = ['HYPER GARDEN', 'AQUA BAY', 'NEON WARD', 'SOLAR CAMPUS', 'LUNAR DOME', 'GLASS SNOW', 'PIXEL MARKET', 'NIGHT TERMINAL']
const signalNames = ['POP-BLOOM', 'WAVE-RUSH', 'CASE-BEAT', 'DAYBREAK', 'VIOLET-LINE', 'CRYO-DREAM', 'BYTE-KISS', 'AFTERGLOW']
const bpmValues = ['142', '156', '128', '136', '110', '118', '150', '124']

function splitCollections(collections: string | null | undefined): string[] {
  return (collections ?? '')
    .split(/[,|]/)
    .map((collection) => collection.trim())
    .filter(Boolean)
}

function hasDemoImageUrl(imageUrl: string | null | undefined) {
  return Boolean(imageUrl?.includes('cdn.example.com'))
}

function isSeedPlaceholder(artist: CmsArtistProfile) {
  return (
    (/^Artist [A-Z]$/.test(artist.name) && !artist.imageUrl && Boolean(artist.lore?.includes('CMS editing'))) ||
    hasDemoImageUrl(artist.imageUrl)
  )
}

function normalizeCmsArtist(artist: CmsArtistProfile, index: number): ArtistProfile {
  const visual = fallbackVisuals[index % fallbackVisuals.length]
  const collections = splitCollections(artist.collections)

  return {
    artistId: artist.artistId,
    name: artist.name,
    groupName: artist.groupName || 'Project Cyan',
    imageUrl: hasDemoImageUrl(artist.imageUrl) ? visual.imageUrl : artist.imageUrl || visual.imageUrl,
    lore: artist.lore || 'Artist profile and collection direction are ready for preview.',
    debutDate: artist.debutDate || 'Profile ready',
    collections: collections.length ? collections : [artist.groupName || 'Project Cyan'],
    accentColor: visual.accentColor,
    glowColor: visual.glowColor,
    area: areaNames[index % areaNames.length],
    bpm: bpmValues[index % bpmValues.length],
    signal: signalNames[index % signalNames.length],
    stationCode: `CY-${String(index + 1).padStart(2, '0')}`,
  }
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

function ArtistPage() {
  const navigate = useNavigate()
  const scrollRef = useRef<HTMLElement | null>(null)
  const returnHomeTimerRef = useRef<number | undefined>(undefined)
  const [cmsPage, setCmsPage] = useState<CmsPage>(defaultArtistPage)
  const [cmsArtists, setCmsArtists] = useState<CmsArtistProfile[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'preview'>('loading')
  const [isReturningHome, setIsReturningHome] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function loadArtists() {
      const [pageResult, artistsResult] = await Promise.allSettled([
        fetchCmsPage('artists', { signal: controller.signal }),
        fetchCmsArtists({ signal: controller.signal }),
      ])

      if (controller.signal.aborted) {
        return
      }

      if (pageResult.status === 'fulfilled') {
        setCmsPage(pageResult.value)
      } else {
        setCmsPage(defaultArtistPage)
      }

      if (artistsResult.status === 'fulfilled') {
        setCmsArtists((artistsResult.value ?? []).filter((artist) => artist.visible !== false))
        setStatus('ready')
      } else {
        setCmsArtists([])
        setStatus('preview')
      }
    }

    loadArtists()

    return () => {
      controller.abort()
    }
  }, [])

  useEffect(() => {
    const scroller = scrollRef.current
    if (!scroller) {
      return undefined
    }

    const scrollerElement = scroller

    let wheelLocked = false
    let wheelAnimationFrame: number | undefined
    let wheelUnlockTimer: number | undefined

    function updateHashForPanel(panelIndex: number) {
      const targetPanel = scrollerElement.children.item(panelIndex)
      if (targetPanel?.id) {
        window.history.replaceState(null, '', `#${targetPanel.id}`)
      }
    }

    function animateWheelPage(targetLeft: number, targetIndex: number) {
      const startLeft = scrollerElement.scrollLeft
      const distance = targetLeft - startLeft
      const startedAt = window.performance.now()
      const duration = 460
      const previousSnapType = scrollerElement.style.scrollSnapType

      scrollerElement.style.scrollSnapType = 'none'
      window.cancelAnimationFrame(wheelAnimationFrame ?? 0)

      function finish() {
        scrollerElement.scrollTo({ left: targetLeft, behavior: 'auto' })
        scrollerElement.style.scrollSnapType = previousSnapType
        updateHashForPanel(targetIndex)
        wheelUnlockTimer = window.setTimeout(() => {
          wheelLocked = false
        }, 120)
      }

      function tick(now: number) {
        const progress = Math.min((now - startedAt) / duration, 1)
        const easedProgress = 1 - (1 - progress) ** 3

        scrollerElement.scrollTo({
          left: startLeft + distance * easedProgress,
          behavior: 'auto',
        })

        if (progress < 1) {
          wheelAnimationFrame = window.requestAnimationFrame(tick)
        } else {
          finish()
        }
      }

      wheelAnimationFrame = window.requestAnimationFrame(tick)
    }

    function handleWheel(event: globalThis.WheelEvent) {
      const primaryDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY

      if (Math.abs(primaryDelta) < 8) {
        return
      }

      const panelWidth = scrollerElement.clientWidth
      const panelCount = Math.max(1, Math.round(scrollerElement.scrollWidth / panelWidth))
      const currentIndex = Math.round(scrollerElement.scrollLeft / panelWidth)

      if (currentIndex === 0 && primaryDelta < 0) {
        event.preventDefault()

        if (wheelLocked) {
          return
        }

        wheelLocked = true
        window.clearTimeout(wheelUnlockTimer)
        window.clearTimeout(returnHomeTimerRef.current)
        setIsReturningHome(true)
        returnHomeTimerRef.current = window.setTimeout(() => {
          navigate('/#home-2')
        }, 420)
        return
      }

      const nextIndex = Math.min(Math.max(currentIndex + (primaryDelta > 0 ? 1 : -1), 0), panelCount - 1)

      if (nextIndex === currentIndex) {
        return
      }

      event.preventDefault()

      if (wheelLocked) {
        return
      }

      wheelLocked = true
      window.clearTimeout(wheelUnlockTimer)
      animateWheelPage(nextIndex * panelWidth, nextIndex)
    }

    scroller.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      window.clearTimeout(wheelUnlockTimer)
      window.clearTimeout(returnHomeTimerRef.current)
      window.cancelAnimationFrame(wheelAnimationFrame ?? 0)
      scroller.removeEventListener('wheel', handleWheel)
    }
  }, [navigate])

  const hasManagedContent = useMemo(() => cmsArtists.some((artist) => !isSeedPlaceholder(artist)), [cmsArtists])
  const artists = useMemo(() => (hasManagedContent ? cmsArtists.map(normalizeCmsArtist) : fallbackArtists), [cmsArtists, hasManagedContent])

  useEffect(() => {
    const scroller = scrollRef.current
    if (!scroller) {
      return undefined
    }

    const scrollerElement = scroller

    function scrollToHashPanel(behavior: ScrollBehavior = 'auto') {
      const hashId = decodeURIComponent(window.location.hash.replace(/^#/, ''))
      if (!hashId) {
        return
      }

      const targetIndex = Array.from(scrollerElement.children).findIndex((panel) => panel.id === hashId)
      if (targetIndex < 0) {
        return
      }

      scrollerElement.scrollTo({
        left: targetIndex * scrollerElement.clientWidth,
        behavior,
      })
    }

    function handleHashChange() {
      scrollToHashPanel('smooth')
    }

    const initialHashTimers = [
      window.setTimeout(() => {
        scrollToHashPanel()
      }, 0),
      window.setTimeout(() => {
        scrollToHashPanel()
      }, 180),
    ]
    window.addEventListener('hashchange', handleHashChange)

    return () => {
      initialHashTimers.forEach((timerId) => window.clearTimeout(timerId))
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [artists.length])

  const previewPage = applyPreviewTheme(cmsPage)
  const displayPage = {
    ...previewPage,
    eyebrow: /^(cyan|sm universe store)$/i.test(previewPage.eyebrow) ? defaultArtistPage.eyebrow : previewPage.eyebrow,
    title: /^(artists|cyan idol frequencies)$/i.test(previewPage.title) ? defaultArtistPage.title : previewPage.title,
    summaryTitle: /^artist universe$/i.test(previewPage.summaryTitle) ? defaultArtistPage.summaryTitle : previewPage.summaryTitle,
    summaryBody: /^showing artist profiles$/i.test(previewPage.summaryBody) ? defaultArtistPage.summaryBody : previewPage.summaryBody || defaultArtistPage.summaryBody,
    primaryColor: previewPage.primaryColor === '#111111' ? defaultArtistPage.primaryColor : previewPage.primaryColor,
    accentColor: previewPage.accentColor === '#2f6f64' ? defaultArtistPage.accentColor : previewPage.accentColor,
    backgroundColor: previewPage.backgroundColor === '#ffffff' ? defaultArtistPage.backgroundColor : previewPage.backgroundColor,
  }
  const pageStyle = {
    '--artist-ink': displayPage.primaryColor,
    '--artist-accent': displayPage.accentColor,
    '--artist-bg': displayPage.backgroundColor,
    ...previewTypographyStyle(),
  } as CSSProperties

  const statusLabel = status === 'loading' ? 'Loading' : hasManagedContent ? 'Live' : 'Preview'

  return (
    <main className={`artist-page artist-shell-breakout${isReturningHome ? ' artist-returning-home' : ''}`} style={pageStyle}>
      <div className="artist-grid-overlay" aria-hidden="true" />
      <div className="artist-signal-ring" aria-hidden="true" />
      <div className="cyan-led-frame" aria-hidden="true" />
      <nav className="artist-floating-nav" aria-label="Artist navigation">
        <Link to="/" aria-label="Home">
          Home
        </Link>
        <Link to="/artists" aria-current="page">
          Artists
        </Link>
        <Link to="/goods">Goods</Link>
        <CartNavLink />
      </nav>

      <nav className="artist-pager" aria-label="Artist pages">
        <a href="#artist-landing">00</a>
        {artists.map((artist, index) => (
          <a href={`#artist-${artist.artistId}`} key={artist.artistId}>
            {String(index + 1).padStart(2, '0')}
          </a>
        ))}
        <a href="#artist-index">All</a>
      </nav>

      <section className="artist-scroll" ref={scrollRef} aria-label="Artist horizontal pages">
        <section className="artist-panel artist-intro" id="artist-landing">
          <div className="artist-broadcast-strip" aria-hidden="true">
            CYAN IDOL NETWORK // AREA STREAM // MUSIC MEDIA MIX // CHARACTER SIGNAL
          </div>
          <div className="artist-intro-copy">
            <p className="artist-eyebrow">{displayPage.eyebrow}</p>
            <h1>{displayPage.title}</h1>
            <strong className="artist-area-word">{displayPage.summaryTitle}</strong>
            <p>{displayPage.summaryBody}</p>
            <dl className="artist-stats" aria-label="Artist summary">
              <div>
                <dt>Artists</dt>
                <dd>{artists.length}</dd>
              </div>
              <div>
                <dt>Mode</dt>
                <dd>{statusLabel}</dd>
              </div>
              <div>
                <dt>View</dt>
                <dd>Stage</dd>
              </div>
            </dl>
            <div className="artist-channel-row" aria-label="Broadcast channels">
              <span>WORLD</span>
              <span>AREA</span>
              <span>CHARACTER</span>
              <span>MUSIC</span>
            </div>
          </div>
          <div className="artist-intro-gallery" aria-label="Artist visuals">
            {artists.slice(0, 4).map((artist, index) => (
              <a className="artist-gallery-tile" href={`#artist-${artist.artistId}`} key={artist.artistId} data-featured={index === 0 ? 'true' : undefined}>
                {artist.imageUrl ? <img src={artist.imageUrl} alt={artist.name} /> : <span>{initials(artist.name)}</span>}
                <small>{artist.area}</small>
                <strong>{artist.name}</strong>
              </a>
            ))}
          </div>
        </section>

        {artists.map((artist, index) => (
          <article
            className="artist-panel artist-profile"
            id={`artist-${artist.artistId}`}
            key={artist.artistId}
            style={
              {
                '--artist-profile-accent': artist.accentColor,
                '--artist-profile-glow': artist.glowColor,
              } as CSSProperties
            }
          >
            <aside className="artist-profile-frequency" aria-label={`${artist.name} frequency`}>
              <span>{artist.stationCode}</span>
              <strong>{artist.bpm}</strong>
              <small>BPM</small>
            </aside>
            <div className="artist-profile-visual">
              <span>{String(index + 1).padStart(2, '0')}</span>
              {artist.imageUrl ? <img src={artist.imageUrl} alt={artist.name} /> : <strong>{initials(artist.name)}</strong>}
              <div className="artist-visual-caption">
                <small>{artist.stationCode}</small>
                <strong>{artist.area}</strong>
              </div>
            </div>
            <div className="artist-profile-copy">
              <p className="artist-eyebrow">{artist.area}</p>
              <h2 className="artist-profile-name">
                <span className="artist-profile-name-faded">{artist.name}</span>
                <span className="artist-profile-name-solid" aria-hidden="true">
                  {artist.name}
                </span>
              </h2>
              <div className="artist-signal-card">
                <span>{artist.signal}</span>
                <strong>{artist.groupName}</strong>
              </div>
              <p>{artist.lore}</p>
              <dl className="artist-profile-meta" aria-label={`${artist.name} profile`}>
                <div>
                  <dt>Debut</dt>
                  <dd>{artist.debutDate}</dd>
                </div>
                <div>
                  <dt>Collections</dt>
                  <dd>{artist.collections.length}</dd>
                </div>
                <div>
                  <dt>Signal</dt>
                  <dd>{artist.signal}</dd>
                </div>
              </dl>
              <div className="artist-collection-row" aria-label={`${artist.name} collections`}>
                {artist.collections.map((collection) => (
                  <span key={collection}>{collection}</span>
                ))}
              </div>
            </div>
          </article>
        ))}

        <section className="artist-panel artist-index" id="artist-index">
          <div>
            <p className="artist-eyebrow">Roster</p>
            <h2>Artist Index</h2>
          </div>
          <div className="artist-index-list">
            {artists.map((artist, index) => (
              <a href={`#artist-${artist.artistId}`} key={artist.artistId}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{artist.name}</strong>
                <small>{artist.area} / {artist.signal}</small>
              </a>
            ))}
          </div>
        </section>
      </section>
    </main>
  )
}

export default ArtistPage
