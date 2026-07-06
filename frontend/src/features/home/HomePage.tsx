import { type CSSProperties, type MouseEvent, type PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { fetchCmsArtists, fetchCmsPage, type CmsArtistProfile, type CmsPage } from '../../api/cms'
import {
  fetchGoodsHomeDiscovery,
  type GoodsHomeDiscovery,
  type GoodsHomeDiscoveryGroup,
  type GoodsSummary,
} from '../../api/goods'
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
  href: string
  imageUrl: string | null
  lore: string
  memberCount: number
  memberNames: string[]
  signal: string
  sortOrder: number
}

type HomeCategory = {
  code: string
  label: string
  count: number
  href: string
  imageUrl: string | null
}

type ArtistGoodsGroup = {
  artistName: string
  count: number
  imageUrl: string | null
  href: string
}

type HomeDigitalDrop = {
  name: string
  typeLabel: string
  artistName: string
  priceLabel: string
  href: string | null
}

type HomeCubeCard = {
  key: string
  title: string
  eyebrow: string
  meta: string
  href: string | null
  imageUrl: string | null
}

type AdaptiveArtistTextColor = {
  '--artist-adaptive-label-color': string
}

type ArtistDeckPointerState = {
  dragging: boolean
  lastX: number | null
  moved: boolean
}

type ArtistDeckLayout = {
  cardHeight: number
  cardWidth: number
  depth: number
  labelAngle: number
  labelBottom: number
  labelFontSize: number
  labelInset: number
  opacity: number
  slot: number
  tilt: number
  x: number
  y: number
  zIndex: number
}

const fallbackArtists: HomeArtist[] = [
  {
    artistId: 'hiena-01',
    name: 'Hiena',
    groupName: 'Mirage Core',
    href: '/artists#artist-hiena-01',
    imageUrl: '/artist-idols/hiena/hiena-01-desert-archive-v5.png',
    lore: 'Sunlit archive pop, cyan accents, and future-idol field notes.',
    memberCount: 1,
    memberNames: ['Hiena'],
    signal: 'CY-01',
    sortOrder: 1,
  },
  {
    artistId: 'hiena-02',
    name: 'Hiena Tide',
    groupName: 'Sweet Wave',
    href: '/artists#artist-hiena-02',
    imageUrl: '/artist-idols/hiena/hiena-02-autumn-bakery-v5.png',
    lore: 'Warm arcade color, pastry mood, and sharp candy-bass styling.',
    memberCount: 1,
    memberNames: ['Hiena Tide'],
    signal: 'CY-02',
    sortOrder: 2,
  },
  {
    artistId: 'rikane-01',
    name: 'Rikane',
    groupName: 'Neon Route',
    href: '/artists#artist-rikane-01',
    imageUrl: '/artist-idols/rikane/rikane-01-autumn-courier-v5.png',
    lore: 'Courier frequency, glossy stickers, and fast city movement.',
    memberCount: 1,
    memberNames: ['Rikane'],
    signal: 'CY-03',
    sortOrder: 3,
  },
  {
    artistId: 'manase-01',
    name: 'Manase',
    groupName: 'Lunar Glass',
    href: '/artists#artist-manase-01',
    imageUrl: '/artist-idols/manase/manase-01-violet-rain-lantern-v5.png',
    lore: 'Violet lantern vocals, rain texture, and elegant future romance.',
    memberCount: 1,
    memberNames: ['Manase'],
    signal: 'CY-04',
    sortOrder: 4,
  },
]

const fallbackDigitalDrops: HomeDigitalDrop[] = [
  {
    name: 'Voice Message Pack',
    typeLabel: 'Voice',
    artistName: 'Project Cyan',
    priceLabel: 'COMING SOON',
    href: null,
  },
  {
    name: 'Wallpaper Signal Set',
    typeLabel: 'Download',
    artistName: 'Project Cyan',
    priceLabel: 'COMING SOON',
    href: null,
  },
  {
    name: 'Live Ticket Code',
    typeLabel: 'Ticket',
    artistName: 'Project Cyan',
    priceLabel: 'COMING SOON',
    href: null,
  },
  {
    name: 'AR Sticker Drop',
    typeLabel: 'AR',
    artistName: 'Project Cyan',
    priceLabel: 'COMING SOON',
    href: null,
  },
  {
    name: 'Member Signal Pass',
    typeLabel: 'Pass',
    artistName: 'Project Cyan',
    priceLabel: 'COMING SOON',
    href: null,
  },
]

const digitalGoodsKeywords = [
  'digital',
  'voice',
  'message',
  'download',
  'wallpaper',
  'stream',
  'ticket',
  'ar',
  'pass',
  '디지털',
  '보이스',
  '음성',
  '메시지',
  '메세지',
  '다운로드',
  '월페이퍼',
  '배경화면',
  '스트리밍',
  '티켓',
  '라이브',
  '스티커',
  '패스',
]

const emptyHomeDiscovery: GoodsHomeDiscovery = {
  physicalGoods: [],
  digitalGoods: [],
  artists: [],
  categories: [],
  physicalCategories: [],
  digitalCategories: [],
  digitalTags: [],
  totalGoods: 0,
  physicalGoodsCount: 0,
  digitalGoodsCount: 0,
}

type GoodsFilterUrlParam = 'categories' | 'artists' | 'tags'

function formatPrice(value: number | null | undefined) {
  return `KRW ${Number(value ?? 0).toLocaleString()}`
}

function cssUrl(value: string) {
  return `url("${value.replace(/["\\]/g, '\\$&')}")`
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

function normalizeFilterValue(value: string | number | null | undefined) {
  const normalized = String(value ?? '').trim()
  return normalized || null
}

function buildGoodsFilterHref(param: GoodsFilterUrlParam, values: Array<string | number | null | undefined>) {
  const normalizedValues = [...new Set(values.map(normalizeFilterValue).filter((value): value is string => Boolean(value)))]
  if (!normalizedValues.length) {
    return null
  }

  const params = new URLSearchParams()
  params.set(param, normalizedValues.join(';'))
  return `/goods?${params.toString()}`
}

function buildGoodsSearchHref(query: string | null | undefined) {
  const normalizedQuery = query?.trim()
  if (!normalizedQuery) {
    return '/goods'
  }

  const params = new URLSearchParams()
  params.set('q', normalizedQuery)
  return `/goods?${params.toString()}`
}

function buildGroupFilterHref(param: GoodsFilterUrlParam, group: GoodsHomeDiscoveryGroup) {
  return buildGoodsFilterHref(param, [group.value]) ?? '/goods'
}

function buildGroupsFilterHref(param: GoodsFilterUrlParam, groups: GoodsHomeDiscoveryGroup[] | undefined) {
  return buildGoodsFilterHref(param, groups?.map((group) => group.value) ?? [])
}

function isDigitalText(value: string | null | undefined) {
  const normalized = value?.toLowerCase().trim()
  return Boolean(normalized && digitalGoodsKeywords.some((keyword) => normalized.includes(keyword)))
}

function isDemoArtist(artist: CmsArtistProfile) {
  return /^Artist [A-Z]$/.test(artist.name) || Boolean(artist.imageUrl?.includes('cdn.example.com'))
}

function digitalTagValues(item: GoodsSummary) {
  return (item.tags ?? []).filter(isDigitalText)
}

function goodsFilterHref(item: GoodsSummary, mode: 'physical' | 'digital') {
  if (mode === 'digital') {
    const tagHref = buildGoodsFilterHref('tags', digitalTagValues(item))
    if (tagHref) {
      return tagHref
    }
  }

  return buildGoodsFilterHref('categories', [item.categoryId])
    ?? buildGoodsFilterHref('artists', [item.artistId])
    ?? buildGoodsFilterHref('tags', item.tags ?? [])
    ?? buildGoodsSearchHref(item.name)
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

function colorChannelToLinear(value: number) {
  const normalized = value / 255
  return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
}

function relativeLuminance(red: number, green: number, blue: number) {
  return 0.2126 * colorChannelToLinear(red)
    + 0.7152 * colorChannelToLinear(green)
    + 0.0722 * colorChannelToLinear(blue)
}

function contrastRatio(first: number, second: number) {
  const lighter = Math.max(first, second)
  const darker = Math.min(first, second)
  return (lighter + 0.05) / (darker + 0.05)
}

function mixChannel(first: number, second: number, amount: number) {
  return Math.round(first * (1 - amount) + second * amount)
}

function readableOppositeColor(red: number, green: number, blue: number) {
  const opposite = {
    red: 255 - red,
    green: 255 - green,
    blue: 255 - blue,
  }
  const backgroundLuminance = relativeLuminance(red, green, blue)
  const oppositeLuminance = relativeLuminance(opposite.red, opposite.green, opposite.blue)

  if (contrastRatio(backgroundLuminance, oppositeLuminance) >= 3) {
    return `rgb(${opposite.red} ${opposite.green} ${opposite.blue})`
  }

  const whiteContrast = contrastRatio(backgroundLuminance, 1)
  const blackContrast = contrastRatio(backgroundLuminance, 0)
  const readableTarget = whiteContrast >= blackContrast
    ? { red: 255, green: 255, blue: 255 }
    : { red: 0, green: 0, blue: 0 }

  return `rgb(${mixChannel(opposite.red, readableTarget.red, 0.55)} ${mixChannel(opposite.green, readableTarget.green, 0.55)} ${mixChannel(opposite.blue, readableTarget.blue, 0.55)})`
}

function averageVisibleImageColor(image: HTMLImageElement) {
  const sampleSize = 28
  const canvas = document.createElement('canvas')
  canvas.width = sampleSize
  canvas.height = sampleSize

  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) {
    return null
  }

  context.drawImage(image, 0, 0, sampleSize, sampleSize)
  const { data } = context.getImageData(0, 0, sampleSize, sampleSize)
  let red = 0
  let green = 0
  let blue = 0
  let count = 0

  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3]
    if (alpha < 16) {
      continue
    }

    red += data[index]
    green += data[index + 1]
    blue += data[index + 2]
    count += 1
  }

  if (!count) {
    return null
  }

  return {
    red: Math.round(red / count),
    green: Math.round(green / count),
    blue: Math.round(blue / count),
  }
}

function useAdaptiveArtistTextColors(imageUrls: Array<string | null>) {
  const imageUrlKey = useMemo(
    () => Array.from(new Set(imageUrls.filter((url): url is string => Boolean(url)))).join('\n'),
    [imageUrls],
  )
  const [colorsByUrl, setColorsByUrl] = useState<Record<string, AdaptiveArtistTextColor>>({})

  useEffect(() => {
    if (!imageUrlKey || typeof document === 'undefined') {
      return
    }

    let cancelled = false
    const urls = imageUrlKey.split('\n')

    urls.forEach((url) => {
      if (colorsByUrl[url]) {
        return
      }

      const image = new Image()
      image.crossOrigin = 'anonymous'
      image.onload = () => {
        try {
          const average = averageVisibleImageColor(image)
          if (!average || cancelled) {
            return
          }

          setColorsByUrl((currentColors) => {
            if (currentColors[url]) {
              return currentColors
            }

            return {
              ...currentColors,
              [url]: {
                '--artist-adaptive-label-color': readableOppositeColor(average.red, average.green, average.blue),
              },
            }
          })
        } catch {
          // Remote images without CORS headers cannot be sampled safely. The CSS fallback remains readable.
        }
      }
      image.src = url
    })

    return () => {
      cancelled = true
    }
  }, [colorsByUrl, imageUrlKey])

  return colorsByUrl
}

function wrapDeckIndex(index: number, count: number) {
  if (!count) {
    return 0
  }

  return ((index % count) + count) % count
}

/*
 * Previous compact deck sizing kept for reference:
 * card width 136/168..252px at 16vw, open step card+24px, stack height 62svh/590px.
 * The active version below is roughly 1.5x the artist page compact cards and allows heavy overlap.
 */
function artistDeckCardWidthForViewport(viewportWidth: number) {
  const minimumCardWidth = viewportWidth < 480 ? 204 : 252

  return Math.min(378, Math.max(minimumCardWidth, viewportWidth * 0.197))
}

function artistDeckCardHeightForViewport(viewportHeight: number, cardWidth: number) {
  const naturalCardHeight = cardWidth / 0.48
  const titleSafeHeight = Math.min(760, Math.max(520, viewportHeight * 0.7))

  return Math.min(naturalCardHeight, titleSafeHeight)
}

function artistDeckStepForViewport(viewportWidth: number, count: number, cardWidth: number) {
  const sideGuard = viewportWidth < 480 ? 16 : Math.min(48, Math.max(16, viewportWidth * 0.025))
  const gapCount = Math.max(count - 1, 1)
  const maxDenseStep = cardWidth * (viewportWidth < 480 ? 0.26 : 0.82)
  const minStep = cardWidth * (viewportWidth < 480 ? 0.12 : 0.18)
  const fitStep = (viewportWidth - sideGuard - cardWidth) / gapCount
  const fittedStep = Math.min(maxDenseStep, fitStep)

  if (viewportWidth < 480) {
    return Math.max(minStep, fittedStep)
  }

  return Math.max(minStep, fittedStep)
}

function artistDeckStackHeightForViewport(viewportHeight: number) {
  const targetHeight = Math.min(viewportHeight * 0.82, 820)
  const minimumHeight = Math.min(760, Math.max(0, viewportHeight - 96))

  return Math.max(targetHeight, minimumHeight)
}

function estimateArtistLabelWidthInEm(value: string, wideWeight = 1) {
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

function artistDeckLabelFontSize(name: string, groupName: string, baseFontSize: number, railLength: number) {
  const minimumFontSize = 13
  const estimatedLabelWidth = (
    estimateArtistLabelWidthInEm(groupName, 0.48) * baseFontSize
    + 8
    + estimateArtistLabelWidthInEm(name) * baseFontSize
  )

  if (estimatedLabelWidth <= railLength) {
    return baseFontSize
  }

  return Math.max(minimumFontSize, baseFontSize * (railLength / estimatedLabelWidth))
}

function fixedDeckSlot(index: number, count: number) {
  if (!count) {
    return 0
  }

  return index - (count - 1) / 2
}

function getArtistDeckLayout(index: number, count: number, viewportWidth: number, viewportHeight: number, artist: Pick<HomeArtist, 'groupName' | 'name'>): ArtistDeckLayout {
  const cardWidth = artistDeckCardWidthForViewport(viewportWidth)
  const cardHeight = artistDeckCardHeightForViewport(viewportHeight, cardWidth)
  const step = artistDeckStepForViewport(viewportWidth, count, cardWidth)
  const slot = fixedDeckSlot(index, count)
  const depth = Math.abs(slot)
  const maxSlotDepth = Math.max(1, (count - 1) / 2)
  const stackHeight = artistDeckStackHeightForViewport(viewportHeight)
  const verticalRoom = Math.max(0, stackHeight - cardHeight)
  const horizontalOverlap = Math.max(0, cardWidth - step)
  const overlapRatio = horizontalOverlap / cardWidth
  const verticalSpread = Math.min(240, verticalRoom * 0.9) * Math.min(1, overlapRatio / 0.5)
  const yStep = horizontalOverlap > 0 ? verticalSpread / maxSlotDepth : 0
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
    cardHeight,
    cardWidth,
    depth,
    labelAngle,
    labelBottom,
    labelFontSize: artistDeckLabelFontSize(artist.name, artist.groupName, baseFontSize, railLength),
    labelInset: Math.ceil(labelOnRight ? rightLabelInset : leftLabelInset),
    opacity: Math.max(0.76, 0.96 - depth * 0.04),
    slot,
    tilt: 0,
    x: slot * step,
    y: slot * yStep,
    zIndex: Math.round(120 + index),
  }
}

function normalizeHomeGroupKey(value: string | null | undefined, fallback: string) {
  const normalized = (value || fallback)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣ぁ-んァ-ン一-龥]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized || fallback
}

function homeGroupLabel(groupKey: string, fallback: string) {
  return textOrDefault(fallback, groupKey)
}

function toHomeArtistGroups(artists: CmsArtistProfile[]): HomeArtist[] {
  const groupedArtists = new Map<string, CmsArtistProfile[]>()

  artists
    .filter((artist) => !isDemoArtist(artist) && artist.groupVisible !== false)
    .forEach((artist) => {
      const groupKey = normalizeHomeGroupKey(artist.groupKey, artist.groupName || artist.name)
      const group = groupedArtists.get(groupKey) ?? []
      group.push(artist)
      groupedArtists.set(groupKey, group)
    })

  return Array.from(groupedArtists.entries())
    .map(([groupKey, group], index) => {
      const sortedGroup = [...group].sort((left, right) => (
        (left.sortOrder ?? 999) - (right.sortOrder ?? 999)
        || left.name.localeCompare(right.name)
      ))
      const representative = sortedGroup[0]
      const fallback = fallbackArtists[index % fallbackArtists.length]
      const groupName = homeGroupLabel(groupKey, representative.groupName || representative.name)
      const heroImageUrl = representative.imageUrl
        || sortedGroup.find((artist) => artist.groupHeroImageUrl)?.groupHeroImageUrl
        || fallback.imageUrl

      return {
        artistId: groupKey,
        name: groupName,
        groupName: 'GROUP',
        href: '/artists',
        imageUrl: heroImageUrl?.includes('cdn.example.com') ? fallback.imageUrl : heroImageUrl,
        lore: sortedGroup.find((artist) => artist.groupSummary)?.groupSummary || representative.lore || fallback.lore,
        memberCount: sortedGroup.length,
        memberNames: sortedGroup.map((artist) => artist.name),
        signal: `CY-${String(index + 1).padStart(2, '0')}`,
        sortOrder: sortedGroup.reduce((order, artist) => Math.min(order, artist.groupSortOrder ?? artist.sortOrder ?? 999), 999),
      }
    })
    .sort((left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name))
    .map((group, index) => ({
      ...group,
      href: `/artists#artist-${index + 1}`,
      signal: `CY-${String(index + 1).padStart(2, '0')}`,
    }))
}

function toArtistGoodsGroups(groups: GoodsHomeDiscoveryGroup[] = []): ArtistGoodsGroup[] {
  return groups.slice(0, 6).map((group) => ({
    artistName: group.label,
    count: group.count,
    imageUrl: group.imageUrl ?? null,
    href: buildGroupFilterHref('artists', group),
  }))
}

function toHomeCategories(groups: GoodsHomeDiscoveryGroup[] = []): HomeCategory[] {
  return groups.slice(0, 8).map((group) => ({
    code: categoryCode(group.label),
    label: group.label,
    count: group.count,
    href: buildGroupFilterHref('categories', group),
    imageUrl: group.imageUrl ?? null,
  }))
}

function hashHomeCubeValue(value: string) {
  let hash = 2166136261

  for (const character of value) {
    hash ^= character.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

function seededHomeCubeShuffle(cards: HomeCubeCard[], seed: number, pass: number) {
  const shuffled = [...cards]
  let state = hashHomeCubeValue(`${seed}:${pass}:${cards.length}`)

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    const targetIndex = state % (index + 1)
    const current = shuffled[index]
    shuffled[index] = shuffled[targetIndex]
    shuffled[targetIndex] = current
  }

  return shuffled
}

function buildHomeCubeRail(cards: HomeCubeCard[], seed: number) {
  const targetCount = Math.max(32, cards.length)
  const entries: Array<{ card: HomeCubeCard; key: string }> = []
  let pass = 0

  while (entries.length < targetCount) {
    seededHomeCubeShuffle(cards, seed, pass).forEach((card, index) => {
      entries.push({
        card,
        key: `${pass}-${index}-${card.key}`,
      })
    })
    pass += 1
  }

  return entries.slice(0, targetCount)
}

function HomeCubeTile({ card, isClone }: { card: HomeCubeCard; isClone: boolean }) {
  const content = (
    <>
      {card.imageUrl ? <img src={card.imageUrl} alt={card.title} /> : <span className="home-cube-fallback">{card.eyebrow}</span>}
      <span className="home-cube-card-text">
        <em>{card.eyebrow}</em>
        <strong>{card.title}</strong>
        <small>{card.meta}</small>
      </span>
    </>
  )

  return card.href ? (
    <Link className="home-cube-card" tabIndex={isClone ? -1 : undefined} to={card.href}>
      {content}
    </Link>
  ) : (
    <div className="home-cube-card">
      {content}
    </div>
  )
}

function setAnimationPlaybackRate(element: HTMLElement | null, playbackRate: number) {
  element?.getAnimations().forEach((animation) => {
    animation.updatePlaybackRate(playbackRate)
  })
}

function useSlowerHoverAnimation<T extends HTMLElement>(hoverPlaybackRate = 0.28) {
  const elementRef = useRef<T | null>(null)

  useEffect(() => () => {
    setAnimationPlaybackRate(elementRef.current, 1)
  }, [])

  return {
    ref: elementRef,
    onPointerEnter: () => setAnimationPlaybackRate(elementRef.current, hoverPlaybackRate),
    onPointerLeave: () => setAnimationPlaybackRate(elementRef.current, 1),
  }
}

function HomeDiagonalProductRail({ items }: { items: GoodsSummary[] }) {
  const railHoverProps = useSlowerHoverAnimation<HTMLDivElement>()

  if (!items.length) {
    return null
  }

  const repeatedGroups = ['first', 'second', 'third']

  return (
    <div className="home-diagonal-product-viewport" aria-label="Physical goods diagonal product rail">
      <div className="home-diagonal-product-track">
        <div className="home-diagonal-product-rail" {...railHoverProps}>
          {repeatedGroups.map((groupId) => (
            <div className="home-diagonal-product-sequence" key={groupId}>
              {items.map((item, index) => (
                <Link
                  className="home-diagonal-product-link"
                  key={`${groupId}-${item.goodsId}-${index}`}
                  to={`/goods/${item.goodsId}`}
                >
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : <span>{item.categoryName ?? 'Goods'}</span>}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function HomeCubeShowcase({ cards }: { cards: HomeCubeCard[] }) {
  const seedRef = useRef(Math.random())
  const railHoverProps = useSlowerHoverAnimation<HTMLDivElement>()
  const railCards = useMemo(() => cards.length ? buildHomeCubeRail(cards, seedRef.current) : [], [cards])
  const railDuration = `${Math.max(38, Math.min(120, railCards.length * 1.6))}s`

  if (!cards.length) {
    return null
  }

  return (
    <div className="home-cube-showcase" aria-label="Digital goods cube showcase">
      <div className="home-cube-grid" style={{ '--home-cube-rail-duration': railDuration } as CSSProperties} {...railHoverProps}>
        {[0, 1].map((cycleIndex) => (
          <div className="home-cube-sequence" key={`cycle-${cycleIndex}`} aria-hidden={cycleIndex === 0 ? undefined : true}>
            {railCards.map((entry, index) => (
              <HomeCubeTile
                card={entry.card}
                isClone={cycleIndex > 0 || index >= cards.length}
                key={`${cycleIndex}-${entry.key}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function HomePage() {
  const navigate = useNavigate()
  const wheelLockRef = useRef(false)
  const routingArtistRef = useRef(false)
  const artistRouteTimerRef = useRef<number | undefined>(undefined)
  const artistDeckStackRef = useRef<HTMLDivElement | null>(null)
  const artistDeckInteractionTimerRef = useRef<number | undefined>(undefined)
  const artistDeckPointerRef = useRef<ArtistDeckPointerState>({
    dragging: false,
    lastX: null,
    moved: false,
  })
  const suppressNextArtistClickRef = useRef(false)
  const [cmsPage, setCmsPage] = useState<CmsPage>(defaultHomePage)
  const [goodsDiscovery, setGoodsDiscovery] = useState<GoodsHomeDiscovery>(emptyHomeDiscovery)
  const [artists, setArtists] = useState<CmsArtistProfile[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [routingArtistId, setRoutingArtistId] = useState<string | null>(null)
  const [artistDeckActiveIndex, setArtistDeckActiveIndex] = useState(0)
  const [artistDeckPaused, setArtistDeckPaused] = useState(false)
  const [artistDeckViewportWidth, setArtistDeckViewportWidth] = useState(() => (typeof window === 'undefined' ? 1280 : window.innerWidth))
  const [artistDeckViewportHeight, setArtistDeckViewportHeight] = useState(() => (typeof window === 'undefined' ? 720 : window.innerHeight))

  useEffect(() => {
    const controller = new AbortController()

    async function loadHome() {
      setStatus('loading')

      const [pageResult, goodsResult, artistsResult] = await Promise.allSettled([
        fetchCmsPage('home', { signal: controller.signal }),
        fetchGoodsHomeDiscovery({ signal: controller.signal }),
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
        setGoodsDiscovery(goodsResult.value)
      } else {
        setGoodsDiscovery(emptyHomeDiscovery)
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

    const panels = Array.from(document.querySelectorAll<HTMLElement>('.home-panel'))
    const maxIndex = Math.max(panels.length - 1, 0)
    const currentIndex = panels.reduce((closestIndex, panel, index) => {
      const closestPanel = panels[closestIndex]
      return Math.abs(panel.offsetTop - window.scrollY) < Math.abs(closestPanel.offsetTop - window.scrollY) ? index : closestIndex
    }, 0)
    const nextIndex = Math.min(Math.max(currentIndex + (deltaY > 0 ? 1 : -1), 0), maxIndex)

    if (nextIndex === currentIndex) {
      return true
    }

    wheelLockRef.current = true
    const nextHash = `#home-${nextIndex + 1}`
    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, '', nextHash)
    }
    window.scrollTo({
      top: panels[nextIndex]?.offsetTop ?? 0,
      behavior: 'smooth',
    })

    window.setTimeout(() => {
      wheelLockRef.current = false
    }, 720)

    return true
  }

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
    function updateArtistDeckViewportSize() {
      const deckWidth = artistDeckStackRef.current?.getBoundingClientRect().width
      const nextWidth = Math.max(0, Math.round(deckWidth || window.innerWidth))
      const nextHeight = Math.max(0, Math.round(window.innerHeight))
      setArtistDeckViewportWidth((currentWidth) => currentWidth === nextWidth ? currentWidth : nextWidth)
      setArtistDeckViewportHeight((currentHeight) => currentHeight === nextHeight ? currentHeight : nextHeight)
    }

    updateArtistDeckViewportSize()
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateArtistDeckViewportSize)
    const deckStack = artistDeckStackRef.current
    if (deckStack) {
      observer?.observe(deckStack)
    }

    window.addEventListener('resize', updateArtistDeckViewportSize)

    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', updateArtistDeckViewportSize)
    }
  }, [])

  useEffect(() => {
    let handledHash = ''

    function scrollToHashPanel(behavior: ScrollBehavior = 'auto', force = false) {
      const currentHash = window.location.hash
      const hashId = decodeURIComponent(window.location.hash.replace(/^#/, ''))
      if (!hashId.startsWith('home-')) {
        return
      }

      const targetPanel = document.getElementById(hashId)
      if (!targetPanel) {
        return
      }

      const targetTop = targetPanel.offsetTop
      if (!force && currentHash === handledHash && Math.abs(window.scrollY - targetTop) < 2) {
        return
      }

      handledHash = currentHash
      if (behavior === 'auto') {
        window.scrollTo(0, targetTop)
        document.documentElement.scrollTop = targetTop
        document.body.scrollTop = targetTop
        return
      }

      window.scrollTo({
        top: targetTop,
        behavior,
      })
    }

    const initialHashTimers = [0, 120, 360, 720, 1400, 2200].map((delay) => window.setTimeout(() => {
      scrollToHashPanel('auto', true)
    }, delay))

    const hashSyncTimer = window.setInterval(() => {
      const currentHash = window.location.hash
      const currentHashId = decodeURIComponent(currentHash.replace(/^#/, ''))
      const currentPanel = currentHashId.startsWith('home-') ? document.getElementById(currentHashId) : null
      const isPanelOutOfSync = currentPanel ? Math.abs(window.scrollY - currentPanel.offsetTop) > 4 : false

      if (currentHash && (currentHash !== handledHash || isPanelOutOfSync)) {
        scrollToHashPanel('auto', true)
      }
    }, 200)

    function handleHashChange() {
      handledHash = ''
      window.setTimeout(() => {
        scrollToHashPanel('smooth', true)
      }, 0)
    }

    window.addEventListener('hashchange', handleHashChange)

    return () => {
      initialHashTimers.forEach((timerId) => window.clearTimeout(timerId))
      window.clearInterval(hashSyncTimer)
      window.removeEventListener('hashchange', handleHashChange)
      window.clearTimeout(artistRouteTimerRef.current)
      window.clearTimeout(artistDeckInteractionTimerRef.current)
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
    const managedArtistGroups = toHomeArtistGroups(artists)
    if (status === 'loading' && !managedArtistGroups.length) {
      return []
    }

    return (managedArtistGroups.length ? managedArtistGroups : fallbackArtists).slice(0, 5)
  }, [artists, status])
  const artistImageUrls = useMemo(() => artistGroups.map((artist) => artist.imageUrl), [artistGroups])
  const artistTextColorsByUrl = useAdaptiveArtistTextColors(artistImageUrls)
  const normalizedArtistDeckActiveIndex = wrapDeckIndex(artistDeckActiveIndex, artistGroups.length)

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

  const physicalGoods = useMemo(() => (goodsDiscovery.physicalGoods ?? []).slice(0, 6), [goodsDiscovery.physicalGoods])

  const digitalGoods = useMemo(() => (goodsDiscovery.digitalGoods ?? []).slice(0, 6), [goodsDiscovery.digitalGoods])

  const physicalGoodsHref = useMemo(
    () => buildGroupsFilterHref('categories', goodsDiscovery.physicalCategories) ?? '/goods',
    [goodsDiscovery.physicalCategories],
  )

  const digitalGoodsHref = useMemo(
    () => buildGroupsFilterHref('tags', goodsDiscovery.digitalTags)
      ?? buildGroupsFilterHref('categories', goodsDiscovery.digitalCategories)
      ?? (digitalGoods[0] ? goodsFilterHref(digitalGoods[0], 'digital') : null),
    [digitalGoods, goodsDiscovery.digitalCategories, goodsDiscovery.digitalTags],
  )

  const artistGoodsHref = useMemo(
    () => buildGroupsFilterHref('artists', goodsDiscovery.artists) ?? '/goods',
    [goodsDiscovery.artists],
  )

  const categoriesHref = useMemo(
    () => buildGroupsFilterHref('categories', goodsDiscovery.categories) ?? '/goods',
    [goodsDiscovery.categories],
  )

  const digitalDrops = useMemo<HomeDigitalDrop[]>(() => {
    if (!digitalGoods.length) {
      return fallbackDigitalDrops
    }

    return digitalGoods.slice(0, 5).map((item) => ({
      name: item.name,
      typeLabel: item.categoryName ?? 'Digital',
      artistName: item.artistName ?? 'Project Cyan',
      priceLabel: formatPrice(item.price),
      href: goodsFilterHref(item, 'digital'),
    }))
  }, [digitalGoods])

  const digitalCubeCards = useMemo<HomeCubeCard[]>(() => {
    if (digitalGoods.length) {
      return digitalGoods.slice(0, 6).map((item) => ({
        key: `goods-${item.goodsId}`,
        title: item.name,
        eyebrow: item.categoryName ?? 'Digital',
        meta: formatPrice(item.price),
        href: `/goods/${item.goodsId}`,
        imageUrl: item.imageUrl,
      }))
    }

    return digitalDrops.map((item) => ({
      key: `fallback-${item.name}`,
      title: item.name,
      eyebrow: item.typeLabel,
      meta: item.priceLabel,
      href: item.href,
      imageUrl: null,
    }))
  }, [digitalDrops, digitalGoods])
  const digitalHeroCard = digitalCubeCards.find((card) => card.imageUrl) ?? digitalCubeCards[0] ?? null
  const digitalHeroStyle = digitalHeroCard?.imageUrl
    ? ({ '--home-digital-hero-image': cssUrl(digitalHeroCard.imageUrl) } as CSSProperties)
    : undefined
  const digitalHeroDescription = copy('digitalFeatureDescription').replace(
    '{artistName}',
    digitalHeroCard?.title ?? digitalHeroCard?.eyebrow ?? 'Project Cyan',
  )

  const artistGoodsGroups = useMemo(() => toArtistGoodsGroups(goodsDiscovery.artists), [goodsDiscovery.artists])

  const categories = useMemo(() => toHomeCategories(goodsDiscovery.categories), [goodsDiscovery.categories])
  const totalGoods = goodsDiscovery.totalGoods ?? 0

  const statusLabel = status === 'loading' ? copy('statusLoadingLabel') : status === 'error' ? copy('statusErrorLabel') : copy('statusReadyLabel')
  const artistDeckCardWidth = artistDeckCardWidthForViewport(artistDeckViewportWidth)
  const artistDeckStep = artistDeckStepForViewport(artistDeckViewportWidth, artistGroups.length, artistDeckCardWidth)
  const artistDeckStyle = {
    '--artist-count': artistGroups.length,
    '--artist-deck-card-width': `${artistDeckCardWidth}px`,
    '--artist-deck-step': `${artistDeckStep}px`,
  } as CSSProperties

  function pauseArtistDeckForInteraction(durationMs = 900) {
    setArtistDeckPaused(true)
    window.clearTimeout(artistDeckInteractionTimerRef.current)
    artistDeckInteractionTimerRef.current = window.setTimeout(() => {
      if (!routingArtistRef.current) {
        setArtistDeckPaused(false)
      }
    }, durationMs)
  }

  function artistDeckIndexFromPointer(clientX: number) {
    const root = artistDeckStackRef.current
    if (!root) {
      return null
    }

    const rootRect = root.getBoundingClientRect()
    if (!rootRect.width) {
      return null
    }

    const deckCenterX = rootRect.left + rootRect.width / 2
    let closestIndex: number | null = null
    let closestDistance = Number.POSITIVE_INFINITY

    artistGroups.forEach((artist, index) => {
      const layout = getArtistDeckLayout(index, artistGroups.length, artistDeckViewportWidth, artistDeckViewportHeight, artist)
      const distance = Math.abs(clientX - (deckCenterX + layout.x))
      if (distance < closestDistance) {
        closestDistance = distance
        closestIndex = index
      }
    })

    return closestIndex
  }

  function selectArtistDeckIndexFromPointer(clientX: number, pauseMs = 800) {
    const targetIndex = artistDeckIndexFromPointer(clientX)
    if (targetIndex === null || artistGroups.length <= 1) {
      return false
    }

    const normalizedTargetIndex = wrapDeckIndex(targetIndex, artistGroups.length)
    if (normalizedTargetIndex === normalizedArtistDeckActiveIndex) {
      return false
    }

    setArtistDeckActiveIndex(normalizedTargetIndex)
    pauseArtistDeckForInteraction(pauseMs)
    return true
  }

  function handleArtistDeckPointerEnter(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse') {
      return
    }

    artistDeckPointerRef.current.lastX = event.clientX
    artistDeckPointerRef.current.moved = false
    selectArtistDeckIndexFromPointer(event.clientX)
  }

  function handleArtistDeckPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!event.isPrimary) {
      return
    }

    artistDeckPointerRef.current = {
      dragging: true,
      lastX: event.clientX,
      moved: false,
    }
    selectArtistDeckIndexFromPointer(event.clientX, 1200)
    setArtistDeckPaused(true)
    window.clearTimeout(artistDeckInteractionTimerRef.current)

    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // Some browsers reject capture if the pointer is already gone.
    }
  }

  function handleArtistDeckPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!event.isPrimary) {
      return
    }

    const pointerState = artistDeckPointerRef.current
    if (!pointerState.dragging && event.pointerType !== 'mouse') {
      return
    }

    const movedDistance = pointerState.lastX === null ? 0 : Math.abs(event.clientX - pointerState.lastX)
    const changedActiveCard = selectArtistDeckIndexFromPointer(event.clientX, pointerState.dragging ? 1200 : 800)

    if (!pointerState.dragging) {
      pointerState.lastX = event.clientX
      return
    }

    if (changedActiveCard || movedDistance > 6) {
      pointerState.moved = true
      suppressNextArtistClickRef.current = true
      event.preventDefault()
    }
    pointerState.lastX = event.clientX
  }

  function finishArtistDeckPointer(event: ReactPointerEvent<HTMLDivElement>) {
    const pointerState = artistDeckPointerRef.current
    const wasMoved = pointerState.moved
    if (pointerState.dragging) {
      pauseArtistDeckForInteraction(700)
    }

    pointerState.dragging = false
    pointerState.moved = false
    pointerState.lastX = event.pointerType === 'mouse' ? event.clientX : null
    if (wasMoved) {
      window.setTimeout(() => {
        suppressNextArtistClickRef.current = false
      }, 350)
    }

    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {
      // Capture may already be released after pointer cancellation.
    }
  }

  function handleArtistDeckPointerLeave(event: ReactPointerEvent<HTMLDivElement>) {
    const pointerState = artistDeckPointerRef.current
    if (pointerState.dragging) {
      return
    }

    pointerState.lastX = event.pointerType === 'mouse' ? event.clientX : null
  }

  function routeArtistGroup(targetIndex: number) {
    const artist = artistGroups[targetIndex]
    if (!artist) {
      return
    }

    window.clearTimeout(artistRouteTimerRef.current)
    routingArtistRef.current = true
    setArtistDeckPaused(true)
    setArtistDeckActiveIndex(targetIndex)
    setRoutingArtistId(String(artist.artistId))

    artistRouteTimerRef.current = window.setTimeout(() => {
      navigate(artist.href)
    }, 560)
  }

  function handleArtistDeckClick(event: MouseEvent<HTMLDivElement>) {
    if (suppressNextArtistClickRef.current) {
      event.preventDefault()
      suppressNextArtistClickRef.current = false
      artistDeckPointerRef.current.moved = false
      return
    }

    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) {
      return
    }

    const targetIndex = artistDeckIndexFromPointer(event.clientX)
    if (targetIndex === null) {
      return
    }

    event.preventDefault()
    routeArtistGroup(wrapDeckIndex(targetIndex, artistGroups.length))
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
          onPointerCancel={finishArtistDeckPointer}
          onPointerDown={handleArtistDeckPointerDown}
          onPointerEnter={handleArtistDeckPointerEnter}
          onPointerLeave={handleArtistDeckPointerLeave}
          onPointerMove={handleArtistDeckPointerMove}
          onPointerUp={finishArtistDeckPointer}
          onClickCapture={handleArtistDeckClick}
          style={artistDeckStyle}
        >
          <div className="home-artist-deck-stack" ref={artistDeckStackRef} aria-label="Artist signals">
            {artistGroups.map((artist, index) => {
              const count = artistGroups.length
              const layout = getArtistDeckLayout(index, count, artistDeckViewportWidth, artistDeckViewportHeight, artist)
              const isActive = wrapDeckIndex(index, count) === normalizedArtistDeckActiveIndex
              const deckOpacity = isActive ? 1 : layout.opacity
              const deckZ = isActive ? 180 : layout.zIndex
              const deckFaceLift = '0px'
              const deckFaceScale = isActive ? 1.02 : 1
              const adaptiveTextColor = artist.imageUrl ? artistTextColorsByUrl[artist.imageUrl] : undefined

              return (
                <Link
                  className="home-artist-signal"
                  data-deck-index={index}
                  data-deck-slot={layout.slot}
                  data-active={isActive ? 'true' : undefined}
                  data-routing={routingArtistId === String(artist.artistId) ? 'true' : undefined}
                  draggable={false}
                  key={artist.artistId}
                  style={
                    {
                      '--deck-depth': layout.depth,
                      '--deck-face-lift': deckFaceLift,
                      '--deck-face-scale': deckFaceScale,
                      '--deck-opacity': deckOpacity,
                      '--deck-slot': layout.slot,
                      '--deck-tilt': `${layout.tilt}deg`,
                      '--deck-x': `${layout.x.toFixed(2)}px`,
                      '--deck-y': `${layout.y.toFixed(2)}px`,
                      '--deck-z': deckZ,
                      '--artist-deck-card-height': `${layout.cardHeight}px`,
                      '--artist-label-angle': `${layout.labelAngle.toFixed(2)}deg`,
                      '--artist-label-bottom': `${Math.round(layout.labelBottom)}px`,
                      '--artist-label-edge-inset': `${layout.labelInset}px`,
                      '--artist-label-font-size': `${layout.labelFontSize.toFixed(2)}px`,
                      ...adaptiveTextColor,
                    } as CSSProperties
                  }
                  to={artist.href}
                >
                  <span className="home-artist-card-face">
                    {artist.imageUrl ? (
                      <img src={artist.imageUrl} alt={artist.name} draggable={false} />
                    ) : (
                      <span className="home-artist-card-fallback">{initials(artist.name)}</span>
                    )}
                    <span className="home-artist-card-border" aria-hidden="true">
                      <span className="home-artist-card-border-edge home-artist-card-border-edge-top" />
                      <span className="home-artist-card-border-edge home-artist-card-border-edge-right" />
                      <span className="home-artist-card-border-edge home-artist-card-border-edge-bottom" />
                      <span className="home-artist-card-border-edge home-artist-card-border-edge-left" />
                    </span>
                  </span>
                  <small>{artist.signal}</small>
                  <span className="home-artist-label">
                    <em>{artist.groupName}</em>
                    <strong>{artist.name}</strong>
                  </span>
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
          <Link to={physicalGoodsHref}>{copy('physicalCta')}</Link>
        </div>
        <HomeDiagonalProductRail items={physicalGoods} />
      </section>

      <section className="home-panel home-digital-panel" id="home-4" aria-labelledby="home-digital-title">
        <div className="home-digital-hero" style={digitalHeroStyle}>
          <div className="home-digital-hero-copy">
            <p className="home-eyebrow">{copy('digitalEyebrow')}</p>
            <h2 id="home-digital-title">{copy('digitalTitle')}</h2>
            <p>{digitalHeroDescription}</p>
          </div>
          {digitalGoodsHref ? (
            <Link to={digitalGoodsHref}>{copy('digitalCta')}</Link>
          ) : (
            <span className="home-section-action-disabled">COMING SOON</span>
          )}
        </div>
        <HomeCubeShowcase cards={digitalCubeCards} />
      </section>

      <section className="home-panel home-by-artist-panel" id="home-5" aria-labelledby="home-by-artist-title">
        <div className="home-section-heading">
          <p className="home-eyebrow">{copy('byArtistEyebrow')}</p>
          <h2 id="home-by-artist-title">{copy('byArtistTitle')}</h2>
          <Link to={artistGoodsHref}>{copy('byArtistCta')}</Link>
        </div>
        <div className="home-by-artist-grid">
          {(artistGoodsGroups.length ? artistGoodsGroups : artistGroups.map((artist) => ({ artistName: artist.name, count: artist.memberCount, imageUrl: artist.imageUrl, href: artist.href }))).map((group) => (
            <Link className="home-by-artist-card" key={group.artistName} to={group.href}>
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
          <Link to={categoriesHref}>{copy('categoryCta')}</Link>
        </div>
        <div className="home-category-grid">
          {(categories.length ? categories : [{ code: 'GD', label: 'Goods', count: totalGoods, href: '/goods', imageUrl: null }]).map((category) => (
            <Link className="home-category-card" key={category.label} to={category.href}>
              {category.imageUrl ? <img src={category.imageUrl} alt="" /> : <span className="home-category-card-fallback">{category.code}</span>}
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
              <Link to={physicalGoodsHref}>{copy('footerShopPhysicalGoods')}</Link>
              {digitalGoodsHref ? (
                <Link to={digitalGoodsHref}>{copy('footerShopDigitalGoods')}</Link>
              ) : (
                <a href="#home-4">{copy('footerShopDigitalGoods')}</a>
              )}
            </div>
            <div>
              <h3>{copy('footerArtistTitle')}</h3>
              <Link to="/artists">{copy('footerArtistArtistsPage')}</Link>
              <a href="#home-2">{copy('footerArtistGroups')}</a>
              <Link to={artistGoodsHref}>{copy('footerArtistGoodsByArtist')}</Link>
            </div>
            <div>
              <h3>{copy('footerAccountTitle')}</h3>
              <Link to="/login">{copy('footerAccountSignIn')}</Link>
              <Link to="/cart">{copy('footerAccountCart')}</Link>
              <Link to="/likes/goods">{copy('footerAccountLikes')}</Link>
            </div>
            <div>
              <h3>{copy('footerInfoTitle')}</h3>
              <a href="#home-1">{copy('footerInfoTop')}</a>
              <Link to={categoriesHref}>{copy('footerInfoCategories')}</Link>
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
