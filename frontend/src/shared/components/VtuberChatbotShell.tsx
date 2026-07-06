import {
  type CSSProperties,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  type VtuberCharacterRenderStatus,
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
  displayState: VtuberDisplayState
  isSendDisabled: boolean
  messages: VtuberConversationMessage[]
  motionKey: VtuberMotionKey | null
  motionTriggerId: number
  onSendMessage: (message: string) => boolean | Promise<boolean>
  statusLabel: string
}

type ChatbotPosition = {
  x: number
  y: number
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
const DEFAULT_CHARACTER_GREETING = '안녕! 궁금한거 있어?'
const CART_PANEL_SELECTOR = '.goods-cart-side-panel'
const CART_PANEL_GAP_PX = 16
const CHAT_SIDEBAR_MIN_HEIGHT_PX = 208
const CHAT_SIDEBAR_MAX_HEIGHT_PX = 512
const CHAT_SIDEBAR_DEFAULT_WIDTH_PX = 304
const CHAT_SIDEBAR_VIEWPORT_MARGIN_PX = 16
const CHAT_SIDEBAR_COLLAPSED_BOTTOM_PX = 16
const CHARACTER_BUBBLE_VIEWPORT_MARGIN_PX = 8

const DEFAULT_CHATBOT_SETTINGS: ChatbotSettings = {
  isChatCollapsed: false,
  position: null,
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
): ChatbotPosition {
  const maxX = Math.max(0, window.innerWidth - element.offsetWidth)
  const maxY = Math.max(0, window.innerHeight - element.offsetHeight)

  return {
    x: Math.min(Math.max(0, position.x), maxX),
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
  displayState,
  isSendDisabled,
  messages,
  motionKey,
  motionTriggerId,
  onSendMessage,
  statusLabel,
}: VtuberChatbotProps): ReactElement {
  const chatbotRef = useRef<HTMLElement>(null)
  const characterBubbleRef = useRef<HTMLDivElement>(null)
  const messageListRef = useRef<HTMLDivElement>(null)
  const dragStateRef = useRef<DragState | null>(null)
  const removeDragListenersRef = useRef<(() => void) | null>(null)
  const [settings, setSettings] = useState<ChatbotSettings>(loadChatbotSettings)
  const [isDesktopViewport, setIsDesktopViewport] = useState(isDesktopDragViewport)
  const [isDragging, setIsDragging] = useState(false)
  const [characterRenderStatus, setCharacterRenderStatus] =
    useState<VtuberCharacterRenderStatus>('loading')
  const [isCharacterBubbleVisible, setIsCharacterBubbleVisible] = useState(true)
  const [characterBubbleNudgeX, setCharacterBubbleNudgeX] = useState(0)
  const [sidebarDockStyle, setSidebarDockStyle] = useState<CSSProperties | undefined>(undefined)
  const [message, setMessage] = useState('')
  const trimmedMessage = message.trim()
  const shouldUseCustomPosition = isDesktopViewport && settings.position !== null
  const visibleCharacterBubbleText = buildVisibleCharacterBubbleText({
    characterRenderStatus,
    displayState,
    fallbackText: characterBubbleText,
  })
  const characterBubbleStyle = {
    '--vtuber-bubble-nudge-x': `${characterBubbleNudgeX}px`,
  } as CSSProperties
  const chatbotStyle: CSSProperties | undefined = shouldUseCustomPosition
    ? {
        bottom: 'auto',
        left: settings.position?.x,
        right: 'auto',
        top: settings.position?.y,
      }
    : undefined

  useEffect(() => {
    window.localStorage.setItem(
      CHATBOT_SETTINGS_STORAGE_KEY,
      JSON.stringify(settings),
    )
  }, [settings])

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
    }, CHARACTER_BUBBLE_VISIBLE_MS)

    return () => window.clearTimeout(timerId)
  }, [characterBubbleSequence, visibleCharacterBubbleText])

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
    visibleCharacterBubbleText,
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
  }, [])

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

    const clampedPosition = clampChatbotPosition(settings.position, chatbotElement)

    if (
      clampedPosition.x !== settings.position.x ||
      clampedPosition.y !== settings.position.y
    ) {
      setSettings((currentSettings) => ({
        ...currentSettings,
        position: clampedPosition,
      }))
    }
  }, [settings.position, shouldUseCustomPosition])

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
        position: clampChatbotPosition(currentSettings.position, chatbotElement),
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
      stopDragging()
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

    if (!didMove) {
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
              data-display-state={displayState}
              data-is-visible={isCharacterBubbleVisible}
              aria-live="polite"
              style={characterBubbleStyle}
            >
              <p>{visibleCharacterBubbleText}</p>
              <span className="vtuber-sr-only" aria-live="polite">
                표시 상태: {statusLabel}. 준비된 동작: {actionsCount}개.
              </span>
            </div>

            <div
              className="vtuber-stage"
              aria-label={`${character.name} 캐릭터 영역`}
              onPointerDown={handleCharacterPointerDown}
              onPointerMove={handleDragPointerMove}
              onPointerUp={handleCharacterPointerUp}
              onPointerCancel={handleCharacterPointerCancel}
            >
              {character.renderMode === 'three3d' ? (
                <ThreeDCharacter
                  character={character}
                  displayState={displayState}
                  motionKey={motionKey}
                  motionTriggerId={motionTriggerId}
                  onRenderStatusChange={setCharacterRenderStatus}
                  statusLabel={statusLabel}
                />
              ) : (
                <Live2DCharacter
                  character={character}
                  displayState={displayState}
                  motionKey={motionKey}
                  motionTriggerId={motionTriggerId}
                  onRenderStatusChange={setCharacterRenderStatus}
                  statusLabel={statusLabel}
                />
              )}
            </div>
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
                <strong>{character.name}</strong>
                <span>쇼핑 도우미</span>
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
                    <p>{conversationMessage.text}</p>
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
                placeholder="굿즈를 물어보세요"
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
