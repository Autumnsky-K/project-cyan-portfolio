import {
  type CSSProperties,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  type VtuberCharacterRenderStatus,
  type VtuberCharacterOption,
  type VtuberCharacterConfig,
  type VtuberConversationMessage,
  type VtuberDisplayState,
  type VtuberMotionKey,
} from '../../features/vtuber/types'
import Live2DCharacter from '../../features/vtuber/Live2DCharacter'
import ThreeDCharacter from '../../features/vtuber/ThreeDCharacter'
import IconButton from './IconButton'
import './VtuberChatbot.css'

type VtuberChatbotProps = {
  actionsCount: number
  authNotice?: {
    actionLabel: string
    message: string
    onAction: () => void
  } | null
  characterBubbleText: string
  characterBubbleSequence: number
  character: VtuberCharacterConfig
  characterOptions?: readonly VtuberCharacterOption[]
  displayState: VtuberDisplayState
  inputPlaceholder: string
  isSendDisabled: boolean
  messages: VtuberConversationMessage[]
  motionKey: VtuberMotionKey | null
  motionTriggerId: number
  onCharacterChange?: (characterId: string) => void
  onSendMessage: (message: string) => boolean | Promise<boolean>
  selectedCharacterId?: string
  statusLabel: string
}

type ChatbotPosition = {
  x: number
  y: number
}

type CharacterBubbleAnchor = {
  left: number
  top: number
}

type ChatbotSettings = {
  isChatCollapsed: boolean
  position: ChatbotPosition | null
}

type DragState = {
  didMove: boolean
  offsetX: number
  offsetY: number
  startX: number
  startY: number
}

const CHATBOT_SETTINGS_STORAGE_KEY = 'project-cyan.vtuber-chatbot.settings'
const DESKTOP_DRAG_MIN_WIDTH = 721
const DRAG_CLICK_TOLERANCE_PX = 4
const CHARACTER_BUBBLE_VISIBLE_MS = 5000
const CHARACTER_BUBBLE_SEGMENT_HOLD_MS = 500
const CHARACTER_BUBBLE_TYPEWRITER_INTERVAL_MS = 14
const CHARACTER_BUBBLE_MAX_LINE_LENGTH = 28
const CHARACTER_BUBBLE_LINES_PER_SEGMENT = 3
const DEFAULT_CHARACTER_GREETING = '안녕하세요. 필요한 굿즈를 편하게 물어봐 주세요.'
const HELP_WAVE_GREETING = '안녕? 뭐 찾는거 있어?'
const CART_PANEL_SELECTOR = '.goods-cart-side-panel'
const CART_PANEL_GAP_PX = 16
const CHAT_SIDEBAR_MIN_HEIGHT_PX = 208
const CHAT_SIDEBAR_MAX_HEIGHT_PX = 512
const CHAT_SIDEBAR_DEFAULT_WIDTH_PX = 420
const CHAT_SIDEBAR_VIEWPORT_MARGIN_PX = 16
const CHAT_SIDEBAR_COLLAPSED_BOTTOM_PX = 16
const CHARACTER_BUBBLE_ANCHOR_THRESHOLD_PX = 2
const CHARACTER_BUBBLE_VIEWPORT_MARGIN_PX = 8
const THREE_DRAG_HORIZONTAL_OVERFLOW_PX = 560
const VTUBER_FONT_PRELOADS = [
  {
    family: 'VtuberGyuriDiary',
    href: '/vtuber/fonts/nanum-gyuri-diary.ttf',
    type: 'font/ttf',
    weight: 900,
    sizePx: 21,
  },
  {
    family: 'VtuberMoonOrbit',
    href: '/vtuber/fonts/nanum-moon-orbit.ttf',
    type: 'font/ttf',
    weight: 900,
    sizePx: 21,
  },
  {
    family: 'VtuberFutureTree',
    href: '/vtuber/fonts/nanum-future-tree.ttf',
    type: 'font/ttf',
    weight: 900,
    sizePx: 21,
  },
  {
    family: 'VtuberUserMonaS',
    href: '/vtuber/fonts/mona-s-12-text-kr.woff2',
    type: 'font/woff2',
    weight: 900,
    sizePx: 19,
  },
] as const

const DEFAULT_CHATBOT_SETTINGS: ChatbotSettings = {
  isChatCollapsed: false,
  position: null,
}

let vtuberFontLoadPromise: Promise<void> | null = null

function getDocumentFontSet(): FontFaceSet | null {
  if (typeof document === 'undefined') {
    return null
  }

  return (document as Document & { fonts?: FontFaceSet }).fonts ?? null
}

function buildFontLoadSpec(font: (typeof VTUBER_FONT_PRELOADS)[number]): string {
  return `${font.weight} ${font.sizePx}px "${font.family}"`
}

function ensureVtuberFontsPreloaded(): void {
  if (typeof document === 'undefined') {
    return
  }

  VTUBER_FONT_PRELOADS.forEach((font) => {
    const hasPreload = Array.from(
      document.head.querySelectorAll<HTMLLinkElement>('link[rel="preload"][as="font"]'),
    ).some((link) => link.href.endsWith(font.href))

    if (hasPreload) {
      return
    }

    const preloadLink = document.createElement('link')
    preloadLink.rel = 'preload'
    preloadLink.href = font.href
    preloadLink.as = 'font'
    preloadLink.type = font.type
    preloadLink.crossOrigin = 'anonymous'
    document.head.appendChild(preloadLink)
  })
}

function loadVtuberFonts(): Promise<void> {
  if (typeof document === 'undefined') {
    return Promise.resolve()
  }

  if (vtuberFontLoadPromise) {
    return vtuberFontLoadPromise
  }

  ensureVtuberFontsPreloaded()
  const fontSet = getDocumentFontSet()

  if (!fontSet?.load) {
    return Promise.resolve()
  }

  vtuberFontLoadPromise = Promise.all(
    VTUBER_FONT_PRELOADS.map((font) => fontSet.load(buildFontLoadSpec(font))),
  )
    .then(() => undefined)
    .catch(() => undefined)

  return vtuberFontLoadPromise
}

function buildVisibleCharacterBubbleText({
  characterRenderStatus,
  displayState,
  fallbackText,
}: {
  characterRenderStatus: VtuberCharacterRenderStatus
  displayState: VtuberDisplayState
  fallbackText: string
}): string {
  if (characterRenderStatus === 'loading') {
    return '주섬주섬 옷 입는 중...'
  }

  if (characterRenderStatus === 'fallback') {
    return '거울 앞에서 옷매무새를 다시 고치는 중...'
  }

  if (displayState === 'connecting') {
    return '낮잠에서 깨는 중...'
  }

  if (displayState === 'thinking') {
    return '생각 주머니를 뒤적이는 중...'
  }

  if (displayState === 'error') {
    return '잠깐 길을 다시 찾는 중...'
  }

  if (fallbackText.trim()) {
    return fallbackText
  }

  return DEFAULT_CHARACTER_GREETING
}

function splitBubbleLine(line: string): string[] {
  const trimmedLine = line.trim()

  if (!trimmedLine) {
    return []
  }

  const lines: string[] = []
  let remainingLine = trimmedLine

  while (remainingLine.length > CHARACTER_BUBBLE_MAX_LINE_LENGTH) {
    const preferredBreakIndex = remainingLine.lastIndexOf(
      ' ',
      CHARACTER_BUBBLE_MAX_LINE_LENGTH,
    )
    const breakIndex = preferredBreakIndex >= CHARACTER_BUBBLE_MAX_LINE_LENGTH * 0.45
      ? preferredBreakIndex
      : CHARACTER_BUBBLE_MAX_LINE_LENGTH

    lines.push(remainingLine.slice(0, breakIndex).trim())
    remainingLine = remainingLine.slice(breakIndex).trim()
  }

  if (remainingLine) {
    lines.push(remainingLine)
  }

  return lines
}

function splitCharacterBubbleText(text: string): string[] {
  const trimmedText = text.trim()

  if (!trimmedText) {
    return [DEFAULT_CHARACTER_GREETING]
  }

  const visibleLines = trimmedText
    .split(/\n+/)
    .flatMap((line) => {
      const trimmedLine = line.trim()

      if (trimmedLine.length <= CHARACTER_BUBBLE_MAX_LINE_LENGTH) {
        return [trimmedLine]
      }

      return trimmedLine
        .split(/(?<=[.!?。！？요다죠니다까])\s+/)
        .map((part) => part.trim())
        .filter(Boolean)
    })
    .flatMap(splitBubbleLine)
    .filter(Boolean)

  if (!visibleLines.length) {
    return [trimmedText]
  }

  const segments: string[] = []

  for (
    let lineIndex = 0;
    lineIndex < visibleLines.length;
    lineIndex += CHARACTER_BUBBLE_LINES_PER_SEGMENT
  ) {
    segments.push(
      visibleLines
        .slice(lineIndex, lineIndex + CHARACTER_BUBBLE_LINES_PER_SEGMENT)
        .join('\n'),
    )
  }

  return segments
}

function renderInlineFormattedText(text: string): ReactNode[] {
  const formattedParts: ReactNode[] = []
  let currentIndex = 0
  let partIndex = 0

  while (currentIndex < text.length) {
    const markerStartIndex = text.indexOf('**', currentIndex)

    if (markerStartIndex === -1) {
      formattedParts.push(text.slice(currentIndex))
      break
    }

    if (markerStartIndex > currentIndex) {
      formattedParts.push(text.slice(currentIndex, markerStartIndex))
    }

    const markerEndIndex = text.indexOf('**', markerStartIndex + 2)
    const underlinedText = markerEndIndex === -1
      ? text.slice(markerStartIndex + 2)
      : text.slice(markerStartIndex + 2, markerEndIndex)

    if (underlinedText) {
      formattedParts.push(
        <span
          key={`underline-${partIndex}`}
          className="vtuber-inline-underline"
        >
          {underlinedText}
        </span>,
      )
      partIndex += 1
    }

    if (markerEndIndex === -1) {
      break
    }

    currentIndex = markerEndIndex + 2
  }

  return formattedParts
}

function calculateCharacterBubbleVisibleMs(segments: string[]): number {
  const segmentPlaybackMs = segments.reduce(
    (totalMs, segment) =>
      totalMs +
      segment.length * CHARACTER_BUBBLE_TYPEWRITER_INTERVAL_MS +
      CHARACTER_BUBBLE_SEGMENT_HOLD_MS,
    0,
  )

  return Math.max(CHARACTER_BUBBLE_VISIBLE_MS, segmentPlaybackMs + 1200)
}

function loadChatbotSettings(): ChatbotSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_CHATBOT_SETTINGS
  }

  try {
    const storedSettings = window.localStorage.getItem(CHATBOT_SETTINGS_STORAGE_KEY)

    if (!storedSettings) {
      return DEFAULT_CHATBOT_SETTINGS
    }

    const parsedSettings = JSON.parse(storedSettings) as Partial<ChatbotSettings>
      & { isHidden?: boolean }
    const parsedPosition = parsedSettings.position
    const hasValidPosition =
      parsedPosition &&
      Number.isFinite(parsedPosition.x) &&
      Number.isFinite(parsedPosition.y)

    return {
      isChatCollapsed: parsedSettings.isChatCollapsed === true || parsedSettings.isHidden === true,
      position: hasValidPosition
        ? { x: parsedPosition.x, y: parsedPosition.y }
        : null,
    }
  } catch {
    return DEFAULT_CHATBOT_SETTINGS
  }
}

function clampChatbotPosition(
  position: ChatbotPosition,
  element: HTMLElement,
  options: { horizontalOverflowPx?: number } = {},
): ChatbotPosition {
  const horizontalOverflowPx = options.horizontalOverflowPx ?? 0
  const minX = -horizontalOverflowPx
  const maxX = Math.max(minX, window.innerWidth - element.offsetWidth + horizontalOverflowPx)
  const maxY = Math.max(0, window.innerHeight - element.offsetHeight)

  return {
    x: Math.min(Math.max(minX, position.x), maxX),
    y: Math.min(Math.max(0, position.y), maxY),
  }
}

function isDesktopDragViewport(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.innerWidth >= DESKTOP_DRAG_MIN_WIDTH
  )
}

function VtuberChatbotShell({
  actionsCount,
  authNotice = null,
  characterBubbleText,
  characterBubbleSequence,
  character,
  characterOptions = [],
  displayState,
  inputPlaceholder,
  isSendDisabled,
  messages,
  motionKey,
  motionTriggerId,
  onCharacterChange,
  onSendMessage,
  selectedCharacterId = character.id,
  statusLabel,
}: VtuberChatbotProps): ReactElement {
  const chatbotRef = useRef<HTMLElement>(null)
  const characterBubbleRef = useRef<HTMLDivElement>(null)
  const messageListRef = useRef<HTMLDivElement>(null)
  const dragStateRef = useRef<DragState | null>(null)
  const observedCharacterBubbleSequenceRef = useRef(characterBubbleSequence)
  const readyGreetingCharacterRef = useRef<string | null>(null)
  const removeDragListenersRef = useRef<(() => void) | null>(null)
  const [settings, setSettings] = useState<ChatbotSettings>(loadChatbotSettings)
  const [isDesktopViewport, setIsDesktopViewport] = useState(isDesktopDragViewport)
  const [isDragging, setIsDragging] = useState(false)
  const [characterRenderStatus, setCharacterRenderStatus] =
    useState<VtuberCharacterRenderStatus>('loading')
  const [characterBubbleAnchor, setCharacterBubbleAnchor] =
    useState<CharacterBubbleAnchor | null>(null)
  const [isCharacterBubbleVisible, setIsCharacterBubbleVisible] = useState(true)
  const [characterBubbleSegmentIndex, setCharacterBubbleSegmentIndex] = useState(0)
  const [characterBubbleVisibleLength, setCharacterBubbleVisibleLength] = useState(0)
  const [characterBubbleNudgeX, setCharacterBubbleNudgeX] = useState(0)
  const [interactionBubbleText, setInteractionBubbleText] = useState('')
  const [interactionBubbleSequence, setInteractionBubbleSequence] = useState(0)
  const [dragDanceTriggerId, setDragDanceTriggerId] = useState(0)
  const [greetingSpeechTriggerId, setGreetingSpeechTriggerId] = useState(0)
  const [areCustomFontsReady, setAreCustomFontsReady] = useState(
    () => typeof document === 'undefined',
  )
  const [sidebarDockStyle, setSidebarDockStyle] = useState<CSSProperties | undefined>(undefined)
  const [message, setMessage] = useState('')
  const trimmedMessage = message.trim()
  const shouldUseCustomPosition = isDesktopViewport && settings.position !== null
  const chatbotClampOptions = useMemo(
    () => character.renderMode === 'three3d'
      ? { horizontalOverflowPx: THREE_DRAG_HORIZONTAL_OVERFLOW_PX }
      : undefined,
    [character.renderMode],
  )
  const defaultAssistantGreeting =
    messages.find((conversationMessage) => conversationMessage.role === 'assistant')
      ?.text.trim() || ''
  const visibleCharacterBubbleText = interactionBubbleText || buildVisibleCharacterBubbleText({
    characterRenderStatus,
    displayState,
    fallbackText: characterBubbleText,
  })
  const characterBubbleSegments = useMemo(
    () => splitCharacterBubbleText(visibleCharacterBubbleText),
    [visibleCharacterBubbleText],
  )
  const visibleCharacterBubbleSegment =
    characterBubbleSegments[
      Math.min(characterBubbleSegmentIndex, characterBubbleSegments.length - 1)
    ] ?? visibleCharacterBubbleText
  const typedCharacterBubbleSegment = visibleCharacterBubbleSegment.slice(
    0,
    characterBubbleVisibleLength,
  )
  const characterBubbleKind =
    interactionBubbleText
      ? 'speech'
      : displayState === 'thinking' ||
    displayState === 'connecting' ||
    displayState === 'error' ||
    characterRenderStatus === 'fallback'
      ? 'thought'
      : 'speech'
  const shouldSuppressReadyFallbackBubble =
    !interactionBubbleText &&
    characterRenderStatus === 'ready' &&
    displayState === 'ready' &&
    messages.length === 0 &&
    characterBubbleSequence === 0
  const shouldShowCharacterBubble =
    isCharacterBubbleVisible &&
    characterRenderStatus !== 'loading' &&
    !shouldSuppressReadyFallbackBubble
  const characterBubbleStyle = {
    '--vtuber-bubble-nudge-x': `${characterBubbleNudgeX}px`,
    '--vtuber-bubble-anchor-left': characterBubbleAnchor
      ? `${characterBubbleAnchor.left}px`
      : undefined,
    '--vtuber-bubble-anchor-top': characterBubbleAnchor
      ? `${characterBubbleAnchor.top}px`
      : undefined,
  } as CSSProperties
  const characterBubbleAnchorMode = character.renderMode === 'three3d'
    ? 'screen'
    : 'stack'
  const characterDragZoneStyle = {
    '--vtuber-drag-zone-anchor-left': characterBubbleAnchor
      ? `${characterBubbleAnchor.left + 8}px`
      : undefined,
    '--vtuber-drag-zone-anchor-top': characterBubbleAnchor
      ? `${Math.max(8, characterBubbleAnchor.top + 42)}px`
      : undefined,
  } as CSSProperties
  const characterDragZoneAnchorMode =
    character.renderMode === 'three3d' && characterBubbleAnchor ? 'screen' : 'fallback'
  const chatbotStyle: CSSProperties | undefined = shouldUseCustomPosition
    ? {
        bottom: 'auto',
        left: settings.position?.x,
        right: 'auto',
        top: settings.position?.y,
      }
    : undefined

  useEffect(() => {
    let isActive = true

    void loadVtuberFonts().then(() => {
      if (isActive) {
        setAreCustomFontsReady(true)
      }
    })

    return () => {
      isActive = false
    }
  }, [])

  const handleCharacterBubbleAnchorChange = useCallback((
    nextAnchor: CharacterBubbleAnchor | null,
  ) => {
    setCharacterBubbleAnchor((currentAnchor) => {
      if (!currentAnchor && !nextAnchor) {
        return currentAnchor
      }

      if (
        currentAnchor &&
        nextAnchor &&
        Math.abs(currentAnchor.left - nextAnchor.left) < CHARACTER_BUBBLE_ANCHOR_THRESHOLD_PX &&
        Math.abs(currentAnchor.top - nextAnchor.top) < CHARACTER_BUBBLE_ANCHOR_THRESHOLD_PX
      ) {
        return currentAnchor
      }

      return nextAnchor
    })
  }, [])

  const handleHelpWaveStart = useCallback(() => {
    setInteractionBubbleText(HELP_WAVE_GREETING)
    setInteractionBubbleSequence((currentSequence) => currentSequence + 1)
    setCharacterBubbleSegmentIndex(0)
    setCharacterBubbleVisibleLength(0)
    setIsCharacterBubbleVisible(true)
  }, [])

  const handleCharacterRenderStatusChange = useCallback((
    nextRenderStatus: VtuberCharacterRenderStatus,
  ) => {
    setCharacterRenderStatus(nextRenderStatus)

    if (
      nextRenderStatus !== 'ready' ||
      readyGreetingCharacterRef.current === character.id
    ) {
      return
    }

    readyGreetingCharacterRef.current = character.id
    if (!defaultAssistantGreeting) {
      return
    }

    setInteractionBubbleText(defaultAssistantGreeting)
    setInteractionBubbleSequence((currentSequence) => currentSequence + 1)
    setCharacterBubbleSegmentIndex(0)
    setCharacterBubbleVisibleLength(0)
    setIsCharacterBubbleVisible(true)
    setGreetingSpeechTriggerId((currentTriggerId) => currentTriggerId + 1)
  }, [character.id, defaultAssistantGreeting])

  useEffect(() => {
    window.localStorage.setItem(
      CHATBOT_SETTINGS_STORAGE_KEY,
      JSON.stringify(settings),
    )
  }, [settings])

  useEffect(() => {
    setCharacterBubbleAnchor(null)
    setCharacterBubbleNudgeX(0)
    readyGreetingCharacterRef.current = null
    setInteractionBubbleText('')
  }, [character.id, character.renderMode])

  useEffect(() => {
    if (observedCharacterBubbleSequenceRef.current === characterBubbleSequence) {
      return
    }

    observedCharacterBubbleSequenceRef.current = characterBubbleSequence
    setInteractionBubbleText('')
  }, [characterBubbleSequence])

  useEffect(() => {
    let resizeObserver: ResizeObserver | null = null

    function findVisibleCartPanel(): HTMLElement | null {
      const cartPanel = document.querySelector<HTMLElement>(CART_PANEL_SELECTOR)

      if (!cartPanel) {
        return null
      }

      const rect = cartPanel.getBoundingClientRect()
      const style = window.getComputedStyle(cartPanel)
      const isCartPanelVisible =
        rect.width > 0 &&
        rect.height > 0 &&
        style.display !== 'none' &&
        style.visibility !== 'hidden'

      if (!isCartPanelVisible) {
        return null
      }

      return cartPanel
    }

    function getSidebarDockLeft(cartRect: DOMRect) {
      const viewportWidth = document.documentElement.clientWidth
      const sidebarWidth = Math.min(
        CHAT_SIDEBAR_DEFAULT_WIDTH_PX,
        Math.max(0, viewportWidth - CHAT_SIDEBAR_VIEWPORT_MARGIN_PX * 2),
      )
      const minLeft = CHAT_SIDEBAR_VIEWPORT_MARGIN_PX
      const maxLeft = Math.max(
        minLeft,
        viewportWidth - sidebarWidth - CHAT_SIDEBAR_VIEWPORT_MARGIN_PX,
      )
      const isCompactCartPanel = cartRect.width < CHAT_SIDEBAR_DEFAULT_WIDTH_PX / 2
      const preferredLeft = isCompactCartPanel
        ? cartRect.left - sidebarWidth - CART_PANEL_GAP_PX
        : cartRect.left

      return Math.min(Math.max(Math.round(preferredLeft), minLeft), maxLeft)
    }

    function updateSidebarDock() {
      const cartPanel = findVisibleCartPanel()

      if (!cartPanel) {
        setSidebarDockStyle(undefined)
        return
      }

      const rect = cartPanel.getBoundingClientRect()
      const left = getSidebarDockLeft(rect)

      if (settings.isChatCollapsed) {
        setSidebarDockStyle({
          bottom: CHAT_SIDEBAR_COLLAPSED_BOTTOM_PX,
          left,
          right: 'auto',
          top: 'auto',
        })
        return
      }

      const top = Math.round(rect.bottom + CART_PANEL_GAP_PX)
      const availableHeight = Math.floor(window.innerHeight - top - 24)

      if (availableHeight < CHAT_SIDEBAR_MIN_HEIGHT_PX) {
        setSidebarDockStyle(undefined)
        return
      }

      setSidebarDockStyle({
        bottom: 'auto',
        height: Math.min(CHAT_SIDEBAR_MAX_HEIGHT_PX, availableHeight),
        left,
        right: 'auto',
        top,
      })
    }

    updateSidebarDock()

    const cartPanel = findVisibleCartPanel()
    if (cartPanel) {
      resizeObserver = new ResizeObserver(updateSidebarDock)
      resizeObserver.observe(cartPanel)
    }

    window.addEventListener('resize', updateSidebarDock)
    window.addEventListener('scroll', updateSidebarDock, { passive: true })

    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener('resize', updateSidebarDock)
      window.removeEventListener('scroll', updateSidebarDock)
    }
  }, [settings.isChatCollapsed])

  useEffect(() => {
    const messageList = messageListRef.current

    if (!messageList) {
      return
    }

    messageList.scrollTop = messageList.scrollHeight
  }, [messages])

  useEffect(() => {
    setIsCharacterBubbleVisible(true)

    const timerId = window.setTimeout(() => {
      setIsCharacterBubbleVisible(false)
    }, calculateCharacterBubbleVisibleMs(characterBubbleSegments))

    return () => window.clearTimeout(timerId)
  }, [
    characterBubbleSegments,
    characterBubbleSequence,
    interactionBubbleSequence,
    visibleCharacterBubbleText,
  ])

  useEffect(() => {
    setCharacterBubbleSegmentIndex(0)
  }, [characterBubbleSequence, interactionBubbleSequence, visibleCharacterBubbleText])

  useEffect(() => {
    if (
      characterBubbleSegments.length <= 1 ||
      !isCharacterBubbleVisible ||
      characterBubbleSegmentIndex >= characterBubbleSegments.length - 1 ||
      characterBubbleVisibleLength < visibleCharacterBubbleSegment.length
    ) {
      return undefined
    }

    const timerId = window.setTimeout(() => {
      setCharacterBubbleSegmentIndex((currentIndex) => {
        return Math.min(currentIndex + 1, characterBubbleSegments.length - 1)
      })
    }, CHARACTER_BUBBLE_SEGMENT_HOLD_MS)

    return () => window.clearTimeout(timerId)
  }, [
    characterBubbleSegmentIndex,
    characterBubbleSegments.length,
    characterBubbleVisibleLength,
    isCharacterBubbleVisible,
    visibleCharacterBubbleSegment,
  ])

  useEffect(() => {
    setCharacterBubbleVisibleLength(0)
  }, [characterBubbleSegmentIndex, interactionBubbleSequence, visibleCharacterBubbleSegment])

  useEffect(() => {
    if (!isCharacterBubbleVisible || !visibleCharacterBubbleSegment) {
      return undefined
    }

    if (characterBubbleVisibleLength >= visibleCharacterBubbleSegment.length) {
      return undefined
    }

    const timerId = window.setTimeout(() => {
      setCharacterBubbleVisibleLength((currentLength) => Math.min(
        visibleCharacterBubbleSegment.length,
        currentLength + 1,
      ))
    }, CHARACTER_BUBBLE_TYPEWRITER_INTERVAL_MS)

    return () => window.clearTimeout(timerId)
  }, [
    characterBubbleVisibleLength,
    isCharacterBubbleVisible,
    visibleCharacterBubbleSegment,
  ])

  useEffect(() => {
    function updateCharacterBubbleNudge() {
      const bubbleElement = characterBubbleRef.current

      if (!bubbleElement) {
        return
      }

      const rect = bubbleElement.getBoundingClientRect()
      let nextNudgeX = characterBubbleNudgeX

      if (rect.left < CHARACTER_BUBBLE_VIEWPORT_MARGIN_PX) {
        nextNudgeX += CHARACTER_BUBBLE_VIEWPORT_MARGIN_PX - rect.left
      }

      if (rect.right > window.innerWidth - CHARACTER_BUBBLE_VIEWPORT_MARGIN_PX) {
        nextNudgeX -= rect.right - (window.innerWidth - CHARACTER_BUBBLE_VIEWPORT_MARGIN_PX)
      }

      const roundedNudgeX = Math.round(nextNudgeX)
      if (roundedNudgeX !== characterBubbleNudgeX) {
        setCharacterBubbleNudgeX(roundedNudgeX)
      }
    }

    const frameId = window.requestAnimationFrame(updateCharacterBubbleNudge)
    window.addEventListener('resize', updateCharacterBubbleNudge)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('resize', updateCharacterBubbleNudge)
    }
  }, [
    characterBubbleNudgeX,
    isCharacterBubbleVisible,
    settings.position,
    typedCharacterBubbleSegment,
  ])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('showChatbot') !== '1') {
      return
    }

    setSettings((currentSettings) => ({
      ...currentSettings,
      isChatCollapsed: false,
      position: null,
    }))
  }, [])

  useEffect(() => {
    function handleResize() {
      setIsDesktopViewport(isDesktopDragViewport())

      const chatbotElement = chatbotRef.current

      if (!chatbotElement) {
        return
      }

      setSettings((currentSettings) => {
        if (!currentSettings.position) {
          return currentSettings
        }

        const clampedPosition = clampChatbotPosition(
          currentSettings.position,
          chatbotElement,
          chatbotClampOptions,
        )

        if (
          clampedPosition.x === currentSettings.position.x &&
          clampedPosition.y === currentSettings.position.y
        ) {
          return currentSettings
        }

        return { ...currentSettings, position: clampedPosition }
      })
    }

    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [chatbotClampOptions])

  useEffect(() => {
    return () => {
      removeDragListenersRef.current?.()
    }
  }, [])

  useEffect(() => {
    if (!shouldUseCustomPosition) {
      return
    }

    const chatbotElement = chatbotRef.current

    if (!chatbotElement || !settings.position) {
      return
    }

    const clampedPosition = clampChatbotPosition(
      settings.position,
      chatbotElement,
      chatbotClampOptions,
    )

    if (
      clampedPosition.x !== settings.position.x ||
      clampedPosition.y !== settings.position.y
    ) {
      setSettings((currentSettings) => ({
        ...currentSettings,
        position: clampedPosition,
      }))
    }
  }, [chatbotClampOptions, settings.position, shouldUseCustomPosition])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (await onSendMessage(trimmedMessage)) {
      setMessage('')
    }
  }

  function collapseChat() {
    setSettings((currentSettings) => ({ ...currentSettings, isChatCollapsed: true }))
  }

  function expandChat() {
    const chatbotElement = chatbotRef.current

    if (!chatbotElement) {
      setSettings((currentSettings) => ({ ...currentSettings, isChatCollapsed: false }))
      return
    }

    setSettings((currentSettings) => {
      if (!currentSettings.position || !isDesktopViewport) {
        return { ...currentSettings, isChatCollapsed: false }
      }

      return {
        ...currentSettings,
        isChatCollapsed: false,
        position: clampChatbotPosition(
          currentSettings.position,
          chatbotElement,
          chatbotClampOptions,
        ),
      }
    })
  }

  function updateChatbotPosition(event: PointerEvent) {
    if (!dragStateRef.current) {
      return
    }

    const chatbotElement = chatbotRef.current

    if (!chatbotElement) {
      return
    }

    const didMove =
      dragStateRef.current.didMove ||
      Math.abs(event.clientX - dragStateRef.current.startX) > DRAG_CLICK_TOLERANCE_PX ||
      Math.abs(event.clientY - dragStateRef.current.startY) > DRAG_CLICK_TOLERANCE_PX
    dragStateRef.current.didMove = didMove

    const nextPosition = clampChatbotPosition(
      {
        x: event.clientX - dragStateRef.current.offsetX,
        y: event.clientY - dragStateRef.current.offsetY,
      },
      chatbotElement,
      chatbotClampOptions,
    )

    setSettings((currentSettings) => ({
      ...currentSettings,
      position: nextPosition,
    }))
  }

  function stopDragging(): boolean {
    const didMove = dragStateRef.current?.didMove === true

    removeDragListenersRef.current?.()
    removeDragListenersRef.current = null
    dragStateRef.current = null
    setIsDragging(false)

    return didMove
  }

  function requestDragDance() {
    setDragDanceTriggerId((currentTriggerId) => currentTriggerId + 1)
  }

  function startDragging(
    event: ReactPointerEvent<HTMLElement>,
    options: { preventDefault: boolean } = { preventDefault: true },
  ) {
    if (!isDesktopViewport || event.button !== 0) {
      return
    }

    const chatbotElement = chatbotRef.current

    if (!chatbotElement) {
      return
    }

    const chatbotRect = chatbotElement.getBoundingClientRect()
    dragStateRef.current = {
      didMove: false,
      offsetX: event.clientX - chatbotRect.left,
      offsetY: event.clientY - chatbotRect.top,
      startX: event.clientX,
      startY: event.clientY,
    }

    function handleWindowPointerMove(pointerEvent: PointerEvent) {
      updateChatbotPosition(pointerEvent)
    }

    function handleWindowPointerUp() {
      if (stopDragging()) {
        requestDragDance()
      }
    }

    removeDragListenersRef.current?.()
    window.addEventListener('pointermove', handleWindowPointerMove)
    window.addEventListener('pointerup', handleWindowPointerUp)
    window.addEventListener('pointercancel', handleWindowPointerUp)
    removeDragListenersRef.current = () => {
      window.removeEventListener('pointermove', handleWindowPointerMove)
      window.removeEventListener('pointerup', handleWindowPointerUp)
      window.removeEventListener('pointercancel', handleWindowPointerUp)
    }

    setIsDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)

    if (options.preventDefault) {
      event.preventDefault()
    }
  }

  function handleDragPointerMove(event: ReactPointerEvent<HTMLElement>) {
    if (!isDragging || !dragStateRef.current) {
      return
    }

    updateChatbotPosition(event.nativeEvent)
  }

  function handleExpandClick() {
    expandChat()
  }

  function clickThroughCharacter(event: ReactPointerEvent<HTMLElement>) {
    const characterStage = event.currentTarget
    const previousPointerEvents = characterStage.style.pointerEvents
    characterStage.style.pointerEvents = 'none'

    const target = document.elementFromPoint(event.clientX, event.clientY)
    characterStage.style.pointerEvents = previousPointerEvents

    if (!(target instanceof HTMLElement) || characterStage.contains(target)) {
      return
    }

    target.dispatchEvent(new window.MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      clientX: event.clientX,
      clientY: event.clientY,
    }))
  }

  function handleCharacterPointerDown(event: ReactPointerEvent<HTMLElement>) {
    startDragging(event)
  }

  function handleCharacterPointerUp(event: ReactPointerEvent<HTMLElement>) {
    if (!isDragging) {
      return
    }

    const didMove = stopDragging()

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    if (didMove) {
      requestDragDance()
    } else {
      event.preventDefault()
      clickThroughCharacter(event)
    }
  }

  function handleCharacterPointerCancel(event: ReactPointerEvent<HTMLElement>) {
    if (!isDragging) {
      return
    }

    stopDragging()

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <aside
      ref={chatbotRef}
      id="vtuber"
      className={`vtuber-chatbot${isDragging ? ' is-dragging' : ''}`}
      aria-label="버추얼 캐릭터 챗봇"
      data-character-id={character.id}
      data-display-state={displayState}
      data-chat-collapsed={settings.isChatCollapsed}
      data-model-url={character.modelUrl}
      data-motion-key={motionKey ?? undefined}
      data-render-mode={character.renderMode ?? 'live2d'}
      data-position-mode={shouldUseCustomPosition ? 'custom' : 'default'}
      data-fonts-ready={areCustomFontsReady}
      style={chatbotStyle}
    >
      <>
          <div
            className="vtuber-character-stack"
            aria-label={`${character.name} 캐릭터`}
          >
            <div
              ref={characterBubbleRef}
              className="vtuber-character-bubble"
              data-anchor-mode={characterBubbleAnchorMode}
              data-bubble-kind={characterBubbleKind}
              data-display-state={displayState}
              data-is-visible={shouldShowCharacterBubble}
              aria-live="polite"
              style={characterBubbleStyle}
            >
              <p
                className="vtuber-character-bubble-measure"
                aria-hidden="true"
              >
                {renderInlineFormattedText(visibleCharacterBubbleSegment)}
              </p>
              <p className="vtuber-character-bubble-text">
                {renderInlineFormattedText(typedCharacterBubbleSegment)}
              </p>
              <span className="vtuber-sr-only" aria-live="polite">
                표시 상태: {statusLabel}. 준비된 동작: {actionsCount}개.
              </span>
            </div>

            <div
              className="vtuber-stage"
              aria-label={`${character.name} 캐릭터 영역`}
            >
              {character.renderMode === 'three3d' ? (
                <ThreeDCharacter
                  key={character.id}
                  character={character}
                  displayState={displayState}
                  danceTriggerId={dragDanceTriggerId}
                  greetingSpeechTriggerId={greetingSpeechTriggerId}
                  motionKey={motionKey}
                  motionTriggerId={motionTriggerId}
                  onBubbleAnchorChange={handleCharacterBubbleAnchorChange}
                  onHelpWaveStart={handleHelpWaveStart}
                  onRenderStatusChange={handleCharacterRenderStatusChange}
                  statusLabel={statusLabel}
                />
              ) : (
                <Live2DCharacter
                  key={character.id}
                  character={character}
                  displayState={displayState}
                  motionKey={motionKey}
                  motionTriggerId={motionTriggerId}
                  onRenderStatusChange={handleCharacterRenderStatusChange}
                  statusLabel={statusLabel}
                />
              )}
            </div>

            <div
              className="vtuber-character-drag-zone"
              data-anchor-mode={characterDragZoneAnchorMode}
              aria-label={`${character.name} 캐릭터 드래그 영역`}
              style={characterDragZoneStyle}
              onPointerDown={handleCharacterPointerDown}
              onPointerMove={handleDragPointerMove}
              onPointerUp={handleCharacterPointerUp}
              onPointerCancel={handleCharacterPointerCancel}
            />
          </div>

          <section
            className="vtuber-chat-sidebar"
            aria-label="Chatbot conversation"
            data-chat-collapsed={settings.isChatCollapsed}
            data-vtuber-drag-excluded="true"
            style={sidebarDockStyle}
          >
            {settings.isChatCollapsed ? null : (
              <header className="vtuber-chat-sidebar-header">
                {characterOptions.length > 1 && onCharacterChange ? (
                  <div
                    className="vtuber-character-switcher"
                    role="radiogroup"
                    aria-label="캐릭터 선택"
                  >
                    {characterOptions.map((option) => {
                      const isSelected = option.id === selectedCharacterId

                      return (
                        <button
                          key={option.id}
                          type="button"
                          className="vtuber-character-switcher-button"
                          data-character-option-id={option.id}
                          data-selected={isSelected}
                          aria-checked={isSelected}
                          aria-label={`${option.name} ${option.colorLabel}`}
                          onClick={() => onCharacterChange(option.id)}
                          role="radio"
                          title={option.name}
                        />
                      )
                    })}
                  </div>
                ) : null}
                <div className="vtuber-chat-title">
                  <strong>{character.name}</strong>
                  <span>쇼핑 도우미</span>
                </div>
                <IconButton
                  className="vtuber-chat-toggle-button"
                  icon={<span className="vtuber-minimize-icon" />}
                  label="채팅창 줄이기"
                  onClick={collapseChat}
                  size="small"
                  title="채팅창 줄이기"
                />
              </header>
            )}

            {settings.isChatCollapsed ? null : (
              <div
                ref={messageListRef}
                className="vtuber-message-list"
                role="log"
                aria-live="polite"
                aria-relevant="additions text"
              >
                {messages.map((conversationMessage) => (
                  <article
                    key={conversationMessage.id}
                    className={`vtuber-message is-${conversationMessage.role}`}
                  >
                    <p>{renderInlineFormattedText(conversationMessage.text)}</p>
                  </article>
                ))}
              </div>
            )}

            {!settings.isChatCollapsed && authNotice ? (
              <div className="vtuber-auth-notice" role="status">
                <p>{authNotice.message}</p>
                <button type="button" onClick={authNotice.onAction}>
                  {authNotice.actionLabel}
                </button>
              </div>
            ) : null}

            <form className="vtuber-form" onSubmit={handleSubmit}>
              <label className="vtuber-sr-only" htmlFor="vtuber-message">
                채팅 메시지
              </label>
              <input
                id="vtuber-message"
                type="text"
                value={message}
                placeholder={inputPlaceholder}
                autoComplete="off"
                disabled={isSendDisabled}
                onChange={(event) => setMessage(event.target.value)}
              />
              <button
                className="vtuber-send-button"
                type="submit"
                disabled={isSendDisabled || trimmedMessage.length === 0}
                aria-label="메시지 보내기"
              >
                보내기
              </button>
              {settings.isChatCollapsed ? (
                <IconButton
                  className="vtuber-chat-toggle-button"
                  icon={<span className="vtuber-window-icon" />}
                  label="채팅창 펼치기"
                  onClick={handleExpandClick}
                  size="small"
                  title="채팅창 펼치기"
                />
              ) : null}
            </form>
          </section>
        </>
    </aside>
  )
}

export default VtuberChatbotShell
