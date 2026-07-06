import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CartNavLink from '../cart/CartNavLink'

import { fetchCmsArtists, fetchCmsPage, type CmsArtistProfile, type CmsPage } from '../../api/cms'
import { applyPreviewTheme, previewTypographyStyle } from '../theme/previewTheme'
import { buildArtistGoodsGroups, createArtistGoodsPath } from './artistGoodsLinks'
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
  groupKey?: string
  groupSortOrder?: number
  groupVisible?: boolean
  groupHeroImageUrl?: string | null
  groupSummary?: string | null
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
  sortOrder?: number
}

type ArtistGroupPanel = {
  groupKey: string
  groupName: string
  artists: ArtistProfile[]
  artistAnchors: string[]
  goodsPath: string
  groupSortOrder: number
  heroImageUrl: string | null
  summary: string
  accentColor: string
  glowColor: string
  area: string
  signal: string
  debutDate: string
  collections: string[]
  stationCode: string
}

type ArtistCompactDeckItem = {
  key: string
  name: string
  groupName: string
  signal: string
  imageUrl: string | null
  href?: string
  accentColor: string
  glowColor: string
}

type ArtistCompactDeckLayout = {
  cardWidth: number
  labelAngle: number
  labelBottom: number
  labelFontSize: number
  labelInset: number
  opacity: number
  slot: number
  x: number
  y: number
  zIndex: number
}

const defaultArtistCopySettings = {
  navHome: 'Home',
  navArtists: 'Artists',
  navGoods: 'Goods',
  navCart: 'Cart',
  broadcastStrip: 'CYAN IDOL NETWORK // AREA STREAM // MUSIC MEDIA MIX // CHARACTER SIGNAL',
  statsArtistsLabel: 'Artists',
  statsModeLabel: 'Mode',
  statsViewLabel: 'View',
  statsViewValue: 'Stage',
  statusLoadingLabel: 'Loading',
  statusLiveLabel: 'Live',
  statusPreviewLabel: 'Preview',
  channelWorld: 'WORLD',
  channelArea: 'AREA',
  channelCharacter: 'CHARACTER',
  channelMusic: 'MUSIC',
  profileBpmLabel: 'BPM',
  profileDebutLabel: 'Debut',
  profileCollectionsLabel: 'Collections',
  profileSignalLabel: 'Signal',
  artistGoodsCta: '이 아티스트 굿즈 보기',
  groupGoodsCta: '그룹 굿즈 보기',
  indexEyebrow: 'Roster',
  indexTitle: 'Artist Index',
  indexGroupGoodsCta: '그룹 굿즈 보기',
  pagerIndexLabel: 'All',
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
  copySettings: defaultArtistCopySettings,
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
    groupKey: artist.groupKey || artist.groupName || 'Project Cyan',
    groupSortOrder: artist.groupSortOrder ?? artist.sortOrder ?? index + 1,
    groupVisible: artist.groupVisible !== false,
    groupHeroImageUrl: hasDemoImageUrl(artist.groupHeroImageUrl) ? null : artist.groupHeroImageUrl || null,
    groupSummary: artist.groupSummary || null,
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
    sortOrder: artist.sortOrder ?? index + 1,
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

function textOrDefault(value: string | null | undefined, fallback: string) {
  const text = value?.trim()
  return text ? text : fallback
}

function safePanelKey(value: string, fallback: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣ぁ-んァ-ン一-龥]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized || fallback
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))]
}

function artistCompactCardWidthForViewport(viewportWidth: number) {
  const minimumCardWidth = viewportWidth < 480 ? 136 : 168

  return Math.min(252, Math.max(minimumCardWidth, viewportWidth * 0.16))
}

function artistCompactStepForViewport(viewportWidth: number, count: number, cardWidth: number) {
  const sideGuard = viewportWidth < 480 ? 24 : Math.min(180, Math.max(60, viewportWidth * 0.12))
  const gapCount = Math.max(count - 1, 1)
  const openStep = cardWidth + 24
  const minStep = cardWidth * 0.34
  const fitStep = (viewportWidth - sideGuard - cardWidth) / gapCount
  const fittedStep = Math.min(openStep, fitStep)

  if (viewportWidth < 480) {
    return Math.max(18, fittedStep)
  }

  return Math.max(minStep, fittedStep)
}

function estimateCompactLabelWidthInEm(value: string, wideWeight = 1) {
  return Array.from(value).reduce((width, character) => {
    if (/[\u3131-\u318e\uac00-\ud7a3\u3040-\u30ff\u3400-\u9fff]/u.test(character)) {
      return width + 0.96 * wideWeight
    }

    if (/[A-Z0-9]/.test(character)) {
      return width + 0.66
    }

    if (/[a-z]/.test(character)) {
      return width + 0.55
    }

    return width + 0.38
  }, 0)
}

function compactLabelFontSize(name: string, groupName: string, baseFontSize: number, railLength: number) {
  const minimumFontSize = 13
  const estimatedLabelWidth = (
    estimateCompactLabelWidthInEm(groupName, 0.48) * baseFontSize
    + 8
    + estimateCompactLabelWidthInEm(name) * baseFontSize
  )

  if (estimatedLabelWidth <= railLength) {
    return baseFontSize
  }

  return Math.max(minimumFontSize, baseFontSize * (railLength / estimatedLabelWidth))
}

function compactDeckSlot(index: number, count: number) {
  if (!count) {
    return 0
  }

  return index - (count - 1) / 2
}

function getArtistCompactDeckLayout(index: number, count: number, viewportWidth: number, item: Pick<ArtistCompactDeckItem, 'groupName' | 'name'>): ArtistCompactDeckLayout {
  const cardWidth = artistCompactCardWidthForViewport(viewportWidth)
  const cardHeight = cardWidth / 0.48
  const step = artistCompactStepForViewport(viewportWidth, count, cardWidth)
  const slot = compactDeckSlot(index, count)
  const depth = Math.abs(slot)
  const sideInsetRatio = 0.17
  const sideOffset = cardWidth * sideInsetRatio
  const labelOnRight = slot > 0
  const labelAngle = -(Math.atan2(cardHeight, sideOffset) * 180) / Math.PI
  const labelBottom = Math.min(62, Math.max(44, cardWidth * 0.24))
  const edgeAtBottom = sideOffset * (labelBottom / cardHeight)
  const baseFontSize = Math.min(24, Math.max(18, cardWidth * 0.11))
  const leftLabelInset = edgeAtBottom + baseFontSize + 8
  const rightEdgeAtBottom = cardWidth - sideOffset + edgeAtBottom
  const rightLabelInset = Math.max(baseFontSize, rightEdgeAtBottom - baseFontSize - 10)
  const railLength = Math.max(80, cardHeight - labelBottom - 32)

  return {
    cardWidth,
    labelAngle,
    labelBottom,
    labelFontSize: compactLabelFontSize(item.name, item.groupName, baseFontSize, railLength),
    labelInset: Math.ceil(labelOnRight ? rightLabelInset : leftLabelInset),
    opacity: Math.max(0.76, 0.96 - depth * 0.04),
    slot,
    x: slot * step,
    y: slot * 11,
    zIndex: Math.round(120 + index),
  }
}

function ArtistCompactDeck({ ariaLabel, className = '', items }: { ariaLabel: string; className?: string; items: ArtistCompactDeckItem[] }) {
  const stackRef = useRef<HTMLDivElement | null>(null)
  const [viewportWidth, setViewportWidth] = useState(() => (typeof window === 'undefined' ? 1280 : window.innerWidth))

  useEffect(() => {
    function updateDeckWidth() {
      const deckWidth = stackRef.current?.getBoundingClientRect().width
      const nextWidth = Math.max(0, Math.round(deckWidth || window.innerWidth))
      setViewportWidth((currentWidth) => currentWidth === nextWidth ? currentWidth : nextWidth)
    }

    updateDeckWidth()
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateDeckWidth)
    const stack = stackRef.current
    if (stack) {
      observer?.observe(stack)
    }

    window.addEventListener('resize', updateDeckWidth)

    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', updateDeckWidth)
    }
  }, [])

  if (!items.length) {
    return null
  }

  return (
    <div className={`artist-compact-deck ${className}`.trim()} aria-label={ariaLabel}>
      <div className="artist-compact-deck-stack" ref={stackRef}>
        {items.map((item, index) => {
          const layout = getArtistCompactDeckLayout(index, items.length, viewportWidth, item)
          const style = {
            '--artist-compact-accent': item.accentColor,
            '--artist-compact-card-width': `${layout.cardWidth}px`,
            '--artist-compact-glow': item.glowColor,
            '--artist-compact-label-angle': `${layout.labelAngle.toFixed(2)}deg`,
            '--artist-compact-label-bottom': `${Math.round(layout.labelBottom)}px`,
            '--artist-compact-label-edge-inset': `${layout.labelInset}px`,
            '--artist-compact-label-font-size': `${layout.labelFontSize.toFixed(2)}px`,
            '--artist-compact-opacity': layout.opacity,
            '--artist-compact-x': `${layout.x.toFixed(2)}px`,
            '--artist-compact-y': `${layout.y.toFixed(2)}px`,
            '--artist-compact-z': layout.zIndex,
          } as CSSProperties
          const content = (
            <>
              <span className="artist-compact-card-face">
                {item.imageUrl ? <img src={item.imageUrl} alt={item.name} draggable={false} /> : <strong>{initials(item.name)}</strong>}
              </span>
              <small>{item.signal}</small>
              <span className="artist-compact-card-label">
                <em>{item.groupName}</em>
                <strong>{item.name}</strong>
              </span>
            </>
          )

          return item.href ? (
            <a className="artist-compact-card" href={item.href} key={item.key} style={style}>
              {content}
            </a>
          ) : (
            <article className="artist-compact-card" key={item.key} style={style}>
              {content}
            </article>
          )
        })}
      </div>
    </div>
  )
}

function buildArtistGroupPanels(artists: ArtistProfile[], goodsGroups: ReturnType<typeof buildArtistGoodsGroups>): ArtistGroupPanel[] {
  const groupedArtists = new Map<string, { groupName: string; artists: ArtistProfile[] }>()

  artists.filter((artist) => artist.groupVisible !== false).forEach((artist) => {
    const groupName = artist.groupName.trim() || 'Project Cyan'
    const groupKey = (artist.groupKey?.trim() || groupName).toLowerCase()
    const group = groupedArtists.get(groupKey) ?? { groupName, artists: [] }
    group.artists.push(artist)
    groupedArtists.set(groupKey, group)
  })

  const goodsGroupByName = new Map(goodsGroups.map((group) => [group.groupKey, group]))

  return [...groupedArtists.entries()].map(([groupLookupKey, group], index) => {
    const sortedArtists = [...group.artists].sort((left, right) => (
      (left.sortOrder ?? 999) - (right.sortOrder ?? 999)
      || left.name.localeCompare(right.name)
    ))
    const representative = sortedArtists[0]
    const goodsGroup = goodsGroupByName.get(groupLookupKey)
    const collections = uniqueStrings(sortedArtists.flatMap((artist) => artist.collections))
    const groupKey = safePanelKey(groupLookupKey, `group-${index + 1}`)
    const groupSortOrder = sortedArtists.reduce((minOrder, artist) => Math.min(minOrder, artist.groupSortOrder ?? artist.sortOrder ?? 999), 999)
    const heroImageUrl = representative.imageUrl || sortedArtists.find((artist) => artist.groupHeroImageUrl)?.groupHeroImageUrl || null
    const summary = sortedArtists.find((artist) => artist.groupSummary)?.groupSummary || representative.lore

    return {
      groupKey,
      groupName: group.groupName,
      artists: sortedArtists,
      artistAnchors: sortedArtists.map((artist) => `artist-${artist.artistId}`),
      goodsPath: goodsGroup?.goodsPath ?? createArtistGoodsPath(representative),
      groupSortOrder,
      heroImageUrl,
      summary,
      accentColor: representative.accentColor,
      glowColor: representative.glowColor,
      area: representative.area,
      signal: uniqueStrings(sortedArtists.map((artist) => artist.signal)).slice(0, 3).join(' / ') || representative.signal,
      debutDate: representative.debutDate,
      collections: collections.length ? collections : [group.groupName],
      stationCode: `GR-${String(index + 1).padStart(2, '0')}`,
    }
  }).sort((left, right) => left.groupSortOrder - right.groupSortOrder || left.groupName.localeCompare(right.groupName))
}

function toLandingDeckItem(group: ArtistGroupPanel, index: number): ArtistCompactDeckItem {
  return {
    key: group.groupKey,
    name: group.groupName,
    groupName: 'GROUP',
    signal: `CY-${String(index + 1).padStart(2, '0')}`,
    imageUrl: group.heroImageUrl,
    href: `#artist-${index + 1}`,
    accentColor: group.accentColor,
    glowColor: group.glowColor,
  }
}

function toGroupDeckItems(group: ArtistGroupPanel): ArtistCompactDeckItem[] {
  if (group.artists.length <= 1) {
    const representative = group.artists[0]

    return [{
      key: group.groupKey,
      name: group.groupName,
      groupName: 'GROUP',
      signal: group.stationCode,
      imageUrl: group.heroImageUrl || representative?.imageUrl || null,
      accentColor: group.accentColor,
      glowColor: group.glowColor,
    }]
  }

  return group.artists.map((artist) => ({
    key: String(artist.artistId),
    name: artist.name,
    groupName: artist.groupName || group.groupName,
    signal: artist.stationCode,
    imageUrl: artist.imageUrl,
    accentColor: artist.accentColor,
    glowColor: artist.glowColor,
  }))
}

function ArtistPage() {
  const navigate = useNavigate()
  const scrollRef = useRef<HTMLElement | null>(null)
  const returnHomeTimerRef = useRef<number | undefined>(undefined)
  const [cmsPage, setCmsPage] = useState<CmsPage>(defaultArtistPage)
  const [cmsArtists, setCmsArtists] = useState<CmsArtistProfile[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'preview'>('loading')
  const [isReturningHome, setIsReturningHome] = useState(false)
  const [isArtistMenuOpen, setIsArtistMenuOpen] = useState(false)

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
  const artistGoodsGroups = useMemo(() => buildArtistGoodsGroups(artists), [artists])
  const artistGroups = useMemo(() => buildArtistGroupPanels(artists, artistGoodsGroups), [artists, artistGoodsGroups])

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

      const panels = Array.from(scrollerElement.children)
      const exactPanelIndex = panels.findIndex((panel) => panel.id === hashId)
      const targetIndex = exactPanelIndex >= 0
        ? exactPanelIndex
        : panels.findIndex((panel) => {
            if (!(panel instanceof HTMLElement)) {
              return false
            }

            return (panel.dataset.artistAnchors ?? '').split(' ').includes(hashId)
          })
      if (targetIndex < 0) {
        return
      }

      const targetPanel = panels[targetIndex]
      if (targetPanel instanceof HTMLElement && targetPanel.id && targetPanel.id !== hashId) {
        window.history.replaceState(null, '', `#${targetPanel.id}`)
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
  }, [artistGroups.length])

  const previewPage = applyPreviewTheme(cmsPage)
  const artistCopySettings = {
    ...defaultArtistCopySettings,
    ...(previewPage.copySettings ?? {}),
  }
  const copy = (key: keyof typeof defaultArtistCopySettings) => textOrDefault(artistCopySettings[key], defaultArtistCopySettings[key])
  const displayPage = {
    ...previewPage,
    eyebrow: /^(cyan|sm universe store)$/i.test(previewPage.eyebrow) ? defaultArtistPage.eyebrow : textOrDefault(previewPage.eyebrow, defaultArtistPage.eyebrow),
    title: /^(artists|cyan idol frequencies)$/i.test(previewPage.title) ? defaultArtistPage.title : textOrDefault(previewPage.title, defaultArtistPage.title),
    summaryTitle: /^artist universe$/i.test(previewPage.summaryTitle) ? defaultArtistPage.summaryTitle : textOrDefault(previewPage.summaryTitle, defaultArtistPage.summaryTitle),
    summaryBody: /^showing artist profiles$/i.test(previewPage.summaryBody) ? defaultArtistPage.summaryBody : textOrDefault(previewPage.summaryBody, defaultArtistPage.summaryBody),
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

  const statusLabel = status === 'loading'
    ? copy('statusLoadingLabel')
    : hasManagedContent
      ? copy('statusLiveLabel')
      : copy('statusPreviewLabel')
  return (
    <main className={`artist-page artist-shell-breakout${isReturningHome ? ' artist-returning-home' : ''}`} style={pageStyle}>
      <div className="artist-grid-overlay" aria-hidden="true" />
      <div className="artist-signal-ring" aria-hidden="true" />
      <div className="cyan-led-frame" aria-hidden="true" />
      <nav className="artist-floating-nav" aria-label="Artist navigation">
        <Link to="/" aria-label="Home">
          {copy('navHome')}
        </Link>
        <Link to="/artists" aria-current="page">
          {copy('navArtists')}
        </Link>
        <Link to="/goods">{copy('navGoods')}</Link>
        <CartNavLink label={copy('navCart')} />
      </nav>

      <div className="artist-menu-wrap">
        <button
          className="artist-menu-button"
          type="button"
          aria-label={isArtistMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={isArtistMenuOpen}
          aria-controls="artist-menu"
          onClick={() => setIsArtistMenuOpen((value) => !value)}
        >
          <span aria-hidden="true" />
        </button>
        <nav className="artist-menu" id="artist-menu" data-open={isArtistMenuOpen} aria-label="Artist navigation">
          <Link to="/" onClick={() => setIsArtistMenuOpen(false)}>{copy('navHome')}</Link>
          <Link to="/artists" aria-current="page" onClick={() => setIsArtistMenuOpen(false)}>{copy('navArtists')}</Link>
          <Link to="/goods" onClick={() => setIsArtistMenuOpen(false)}>{copy('navGoods')}</Link>
          <CartNavLink label={copy('navCart')} />
        </nav>
      </div>

      <nav className="artist-pager" aria-label="Artist pages">
        <a href="#artist-landing">00</a>
        {artistGroups.map((group, index) => (
          <a href={`#artist-${index + 1}`} key={group.groupKey}>
            {String(index + 1).padStart(2, '0')}
          </a>
        ))}
        <a href="#artist-index">{copy('pagerIndexLabel')}</a>
      </nav>

      <section className="artist-scroll" ref={scrollRef} aria-label="Artist horizontal pages">
        <section className="artist-panel artist-intro" id="artist-landing">
          <div className="artist-broadcast-strip" aria-hidden="true">
            {copy('broadcastStrip')}
          </div>
          <div className="artist-intro-copy">
            <p className="artist-eyebrow">{displayPage.eyebrow}</p>
            <h1>{displayPage.title}</h1>
            <strong className="artist-area-word">{displayPage.summaryTitle}</strong>
            <p>{displayPage.summaryBody}</p>
            <dl className="artist-stats" aria-label="Artist summary">
              <div>
                <dt>{copy('statsArtistsLabel')}</dt>
                <dd>{artists.length}</dd>
              </div>
              <div>
                <dt>{copy('statsModeLabel')}</dt>
                <dd>{statusLabel}</dd>
              </div>
              <div>
                <dt>{copy('statsViewLabel')}</dt>
                <dd>{copy('statsViewValue')}</dd>
              </div>
            </dl>
            <div className="artist-channel-row" aria-label="Broadcast channels">
              <span>{copy('channelWorld')}</span>
              <span>{copy('channelArea')}</span>
              <span>{copy('channelCharacter')}</span>
              <span>{copy('channelMusic')}</span>
            </div>
          </div>
          <ArtistCompactDeck
            ariaLabel="Artist group compact deck"
            className="artist-intro-gallery"
            items={artistGroups.map(toLandingDeckItem)}
          />
        </section>

        {artistGroups.map((group, index) => {
          return (
            <article
              className="artist-panel artist-profile artist-group-profile"
              id={`artist-${index + 1}`}
              key={group.groupKey}
              data-artist-anchors={[`artist-group-${group.groupKey}`, ...group.artistAnchors].join(' ')}
              style={
                {
                  '--artist-profile-accent': group.accentColor,
                  '--artist-profile-glow': group.glowColor,
                } as CSSProperties
              }
            >
              <aside className="artist-profile-frequency" aria-label={`${group.groupName} group`}>
                <span>{group.stationCode}</span>
                <strong>{String(index + 1).padStart(2, '0')}</strong>
                <small>Group</small>
              </aside>
              <div className="artist-profile-copy artist-group-copy">
                <p className="artist-eyebrow">{group.area}</p>
                <h2 className="artist-profile-name">
                  <span className="artist-profile-name-faded">{group.groupName}</span>
                  <span className="artist-profile-name-solid" aria-hidden="true">
                    {group.groupName}
                  </span>
                </h2>
                <div className="artist-signal-card">
                  <span>{String(index + 1).padStart(2, '0')} / {group.stationCode}</span>
                  <strong>{group.artists.map((artist) => artist.name).join(' · ')}</strong>
                </div>
                <p>{group.summary}</p>
                <dl className="artist-profile-meta" aria-label={`${group.groupName} profile`}>
                  <div>
                    <dt>{copy('profileDebutLabel')}</dt>
                    <dd>{group.debutDate}</dd>
                  </div>
                  <div>
                    <dt>{copy('profileSignalLabel')}</dt>
                    <dd>{group.signal}</dd>
                  </div>
                </dl>
                <div className="artist-collection-row" aria-label={`${group.groupName} collections`}>
                  {group.collections.slice(0, 8).map((collection) => (
                    <span key={collection}>{collection}</span>
                  ))}
                </div>
                <div className="artist-shop-actions" aria-label={`${group.groupName} goods links`}>
                  <Link className="artist-shop-link artist-shop-link-primary" to={group.goodsPath}>
                    {copy('groupGoodsCta')}
                  </Link>
                </div>
              </div>
              <div className="artist-group-stage" aria-label={`${group.groupName} group visual`}>
                <ArtistCompactDeck
                  ariaLabel={`${group.groupName} artist compact deck`}
                  className="artist-group-roster"
                  items={toGroupDeckItems(group)}
                />
              </div>
            </article>
          )
        })}

        <section className="artist-panel artist-index" id="artist-index">
          <div>
            <p className="artist-eyebrow">{copy('indexEyebrow')}</p>
            <h2>{copy('indexTitle')}</h2>
          </div>
          <div className="artist-index-list">
            {artistGroups.map((group, index) => (
              <a href={`#artist-${index + 1}`} key={group.groupKey}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{group.groupName}</strong>
                <small>{group.artists.map((artist) => artist.name).join(' / ')}</small>
              </a>
            ))}
          </div>
          <div className="artist-group-goods-list" aria-label="Group goods links">
            {artistGoodsGroups.map((group) => (
              <Link to={group.goodsPath} key={group.groupKey}>
                <span>{String(group.artistNames.length).padStart(2, '0')}</span>
                <strong>{group.groupName}</strong>
                <small>{copy('indexGroupGoodsCta')}</small>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </main>
  )
}

export default ArtistPage
