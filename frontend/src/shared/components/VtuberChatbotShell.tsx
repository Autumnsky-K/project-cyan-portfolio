import {
  type CSSProperties,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  type VtuberCharacterConfig,
  type VtuberDisplayState,
} from '../../features/vtuber/types'
import Live2DCharacter from '../../features/vtuber/Live2DCharacter'
import './VtuberChatbot.css'

type VtuberChatbotProps = {
  actionsCount: number
  authNotice?: {
    actionLabel: string
    message: string
    onAction: () => void
  } | null
  bubbleText: string
  character: VtuberCharacterConfig
  displayState: VtuberDisplayState
  isSendDisabled: boolean
  onSendMessage: (message: string) => boolean | Promise<boolean>
  statusLabel: string
}

type ChatbotPosition = {
  x: number
  y: number
}

type ChatbotSettings = {
  isHidden: boolean
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

const DEFAULT_CHATBOT_SETTINGS: ChatbotSettings = {
  isHidden: false,
  position: null,
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
    const parsedPosition = parsedSettings.position
    const hasValidPosition =
      parsedPosition &&
      Number.isFinite(parsedPosition.x) &&
      Number.isFinite(parsedPosition.y)

    return {
      isHidden: parsedSettings.isHidden === true,
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

function isDragExcludedTarget(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    Boolean(target.closest('button, input, textarea, select, a'))
  )
}

function VtuberChatbotShell({
  actionsCount,
  authNotice = null,
  bubbleText,
  character,
  displayState,
  isSendDisabled,
  onSendMessage,
  statusLabel,
}: VtuberChatbotProps): ReactElement {
  const chatbotRef = useRef<HTMLElement>(null)
  const dragStateRef = useRef<DragState | null>(null)
  const removeDragListenersRef = useRef<(() => void) | null>(null)
  const shouldSuppressRestoreClickRef = useRef(false)
  const [settings, setSettings] = useState<ChatbotSettings>(loadChatbotSettings)
  const [isDesktopViewport, setIsDesktopViewport] = useState(isDesktopDragViewport)
  const [isDragging, setIsDragging] = useState(false)
  const [message, setMessage] = useState('')
  const trimmedMessage = message.trim()
  const shouldUseCustomPosition = isDesktopViewport && settings.position !== null
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

  function handleHideClick() {
    setSettings((currentSettings) => ({ ...currentSettings, isHidden: true }))
  }

  function showChatbot() {
    const chatbotElement = chatbotRef.current

    if (!chatbotElement) {
      setSettings((currentSettings) => ({ ...currentSettings, isHidden: false }))
      return
    }

    setSettings((currentSettings) => {
      if (!currentSettings.position || !isDesktopViewport) {
        return { ...currentSettings, isHidden: false }
      }

      return {
        ...currentSettings,
        isHidden: false,
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

    if (didMove) {
      shouldSuppressRestoreClickRef.current = true
    }

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

  function handleDragPointerDown(event: ReactPointerEvent<HTMLElement>) {
    if (settings.isHidden || isDragExcludedTarget(event.target)) {
      return
    }

    startDragging(event)
  }

  function handleDragPointerMove(event: ReactPointerEvent<HTMLElement>) {
    if (!isDragging || !dragStateRef.current) {
      return
    }

    updateChatbotPosition(event.nativeEvent)
  }

  function handleDragPointerUp(event: ReactPointerEvent<HTMLElement>) {
    if (!isDragging) {
      return
    }

    stopDragging()

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  function handleRestorePointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    event.stopPropagation()
    startDragging(event, { preventDefault: false })
  }

  function handleRestorePointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    event.stopPropagation()
    handleDragPointerMove(event)
  }

  function handleRestorePointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
    event.stopPropagation()

    if (isDragging) {
      stopDragging()
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  function handleRestorePointerCancel(event: ReactPointerEvent<HTMLButtonElement>) {
    event.stopPropagation()

    if (!isDragging) {
      return
    }

    stopDragging()

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  function handleRestoreClick(event: ReactMouseEvent<HTMLButtonElement>) {
    if (shouldSuppressRestoreClickRef.current) {
      shouldSuppressRestoreClickRef.current = false
      event.preventDefault()
      return
    }

    showChatbot()
  }

  return (
    <aside
      ref={chatbotRef}
      id="vtuber"
      className={`vtuber-chatbot${isDragging ? ' is-dragging' : ''}`}
      aria-label="Live2D chatbot"
      data-character-id={character.id}
      data-display-state={displayState}
      data-is-hidden={settings.isHidden}
      data-model-url={character.modelUrl}
      data-position-mode={shouldUseCustomPosition ? 'custom' : 'default'}
      onPointerDown={handleDragPointerDown}
      onPointerMove={handleDragPointerMove}
      onPointerUp={handleDragPointerUp}
      onPointerCancel={handleDragPointerUp}
      style={chatbotStyle}
    >
      {settings.isHidden ? (
        <div className="vtuber-controls" aria-label="Chatbot controls">
          <button
            className="vtuber-restore-button"
            type="button"
            onClick={handleRestoreClick}
            onPointerDown={handleRestorePointerDown}
            onPointerMove={handleRestorePointerMove}
            onPointerUp={handleRestorePointerUp}
            onPointerCancel={handleRestorePointerCancel}
            aria-label="Show chatbot"
            title="챗봇 보기"
          >
            <span aria-hidden="true" />
          </button>
        </div>
      ) : (
        <>
          <div className="vtuber-controls" aria-label="Chatbot controls">
            <button
              className="vtuber-hide-button"
              type="button"
              onClick={handleHideClick}
              aria-label="Hide chatbot"
              title="챗봇 숨기기"
            >
              <span aria-hidden="true" />
            </button>
          </div>

          <div
            className="vtuber-stage"
            aria-label={`${character.name} Live2D character stage`}
          >
            <Live2DCharacter
              character={character}
              displayState={displayState}
              statusLabel={statusLabel}
            />
          </div>

          <section className="vtuber-panel" aria-label="Chatbot conversation">
            <div
              className="vtuber-bubble"
              data-display-state={displayState}
              aria-live="polite"
            >
              <strong>{character.name}</strong>
              <p>{bubbleText}</p>
              <span className="vtuber-sr-only" aria-live="polite">
                Display state: {statusLabel}. Prepared actions: {actionsCount}.
              </span>
            </div>

            {authNotice ? (
              <div className="vtuber-auth-notice" role="status">
                <p>{authNotice.message}</p>
                <button type="button" onClick={authNotice.onAction}>
                  {authNotice.actionLabel}
                </button>
              </div>
            ) : null}

            <form className="vtuber-form" onSubmit={handleSubmit}>
              <label className="vtuber-sr-only" htmlFor="vtuber-message">
                Chat message
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
                type="submit"
                disabled={isSendDisabled || trimmedMessage.length === 0}
                aria-label="Send message"
              >
                Send
              </button>
            </form>
          </section>
        </>
      )}
    </aside>
  )
}

export default VtuberChatbotShell
