import { type ReactElement, useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { supabase } from '../../api/supabaseClient'
import { createVirtualChatSession } from '../../api/virtualChat'
import { useCartAuthSession } from '../cart/useCartAuthSession'
import VtuberChatbotShell from '../../shared/components/VtuberChatbotShell'
import { useCart } from '../cart/useCart'
import { executeVtuberActions } from './actions/executeVtuberActions'
import {
  DEFAULT_VTUBER_CHARACTER,
  DEFAULT_VTUBER_CHARACTER_ID,
  VTUBER_CHARACTERS,
  VTUBER_CHARACTER_OPTIONS,
  type VtuberCharacterId,
} from './characters'
import {
  deriveVtuberDisplayState,
  VTUBER_DISPLAY_STATE_LABELS,
} from './displayState'
import { useVtuberWebSocket } from './useVtuberWebSocket'
import {
  type VtuberAuthReason,
  type VtuberConversationMessage,
  type VtuberConversationRole,
} from './types'

const INITIAL_BUBBLE_TEXT = '필요한 굿즈를 찾을 때 여기에서 도와드릴게요.'
const SPEAKING_STATE_DURATION_MS = 2400
const DEFAULT_GUIDE_ID = 1
const TOKEN_REFRESH_SKEW_MS = 60_000
const AUTH_REQUIRED_MESSAGES: Record<VtuberAuthReason, string> = {
  accountPersonalization: '찜·구매 이력을 활용한 추천은 로그인 후 이용할 수 있어요.',
  chatHistory: '이전 대화를 이어보려면 로그인해 주세요.',
  persistence: '다음 접속에도 대화를 이어가려면 로그인해 주세요.',
  guestLimit: '게스트 채팅 이용 횟수를 모두 사용했어요. 로그인하고 계속 대화해 주세요.',
}

type ChatAuthStatus = 'anonymous' | 'checking' | 'ready' | 'reauthRequired'
type ChatSessionSnapshot = {
  access_token?: string | null
  expires_at?: number | null
} | null

type FreshChatTokenResult = {
  accessToken: string | null
  canSend: boolean
}

function sessionExpiresAtMs(session: ChatSessionSnapshot): number | null {
  return session?.expires_at ? session.expires_at * 1000 : null
}

function isSessionExpiring(session: ChatSessionSnapshot): boolean {
  const expiresAtMs = sessionExpiresAtMs(session)

  return expiresAtMs !== null && expiresAtMs <= Date.now() + TOKEN_REFRESH_SKEW_MS
}

function VtuberChatbot(): ReactElement {
  const location = useLocation()
  const navigate = useNavigate()
  const { authLoading, authUserId, isAuthenticated } = useCartAuthSession()
  const { addCartItem, items } = useCart()
  const conversationMessageIdRef = useRef(0)
  const executedActionBatchRef = useRef(0)
  const [isAwaitingResponse, setIsAwaitingResponse] = useState(false)
  const [speakingBatchId, setSpeakingBatchId] = useState(0)
  const [chatSessionId, setChatSessionId] = useState<number | null>(null)
  const [chatSessionOwnerId, setChatSessionOwnerId] = useState<string | null>(null)
  const [chatSessionErrorUserId, setChatSessionErrorUserId] = useState<string | null>(null)
  const [chatAccessToken, setChatAccessToken] = useState<string | null>(null)
  const [chatAuthStatus, setChatAuthStatus] = useState<ChatAuthStatus>('anonymous')
  const [chatTokenExpiresAt, setChatTokenExpiresAt] = useState<number | null>(null)
  const [characterBubbleText, setCharacterBubbleText] = useState('')
  const [characterBubbleSequence, setCharacterBubbleSequence] = useState(0)
  const [selectedCharacterId, setSelectedCharacterId] =
    useState<VtuberCharacterId>(DEFAULT_VTUBER_CHARACTER_ID)
  const [conversationMessages, setConversationMessages] = useState<VtuberConversationMessage[]>([
    {
      id: 'assistant-initial',
      role: 'assistant',
      text: INITIAL_BUBBLE_TEXT,
    },
  ])
  const { actionBatchId, actions, connectionStatus, latestText, metadata, sendText } =
    useVtuberWebSocket(
      INITIAL_BUBBLE_TEXT,
      items,
      chatSessionId,
      chatAccessToken,
      location.pathname,
    )

  const appendConversationMessage = useCallback((
    role: VtuberConversationRole,
    text: string,
  ) => {
    const trimmedText = text.trim()

    if (!trimmedText) {
      return
    }

    conversationMessageIdRef.current += 1
    setConversationMessages((currentMessages) => [
      ...currentMessages,
      {
        id: `${role}-${Date.now()}-${conversationMessageIdRef.current}`,
        role,
        text: trimmedText,
      },
    ])
  }, [])

  useEffect(() => {
    let active = true

    if (authLoading || !isAuthenticated) {
      window.setTimeout(() => {
        if (active && !isAuthenticated) {
          setChatSessionId(null)
          setChatSessionOwnerId(null)
          setChatSessionErrorUserId(null)
          setChatAccessToken(null)
        }
      }, 0)
      return () => {
        active = false
      }
    }

    void createVirtualChatSession({
      guideId: DEFAULT_GUIDE_ID,
      sourceScreen: window.location.pathname,
    })
      .then((session) => {
        if (!active) {
          return
        }

        setChatSessionId(session.sessionId)
        setChatSessionOwnerId(authUserId)
        setChatSessionErrorUserId(null)
      })
      .catch(() => {
        if (!active) {
          return
        }

        setChatSessionId(null)
        setChatSessionOwnerId(null)
        setChatSessionErrorUserId(authUserId)
      })

    return () => {
      active = false
    }
  }, [authLoading, authUserId, isAuthenticated])

  useEffect(() => {
    let active = true

    if (authLoading || !isAuthenticated || !supabase) {
      window.setTimeout(() => {
        if (active) {
          setChatAccessToken(null)
          setChatAuthStatus('anonymous')
          setChatTokenExpiresAt(null)
        }
      }, 0)
      return () => {
        active = false
      }
    }

    function applySession(session: ChatSessionSnapshot) {
      if (!active) return

      const accessToken = session?.access_token ?? null
      setChatAccessToken(accessToken)
      setChatTokenExpiresAt(sessionExpiresAtMs(session))
      setChatAuthStatus(accessToken ? 'ready' : 'reauthRequired')
    }

    async function refreshChatSession() {
      if (!active || !supabase) return

      setChatAuthStatus('checking')

      try {
        const { data: currentData, error: currentError } = await supabase.auth.getSession()

        if (currentError) {
          applySession(null)
          return
        }

        const currentSession = currentData.session
        if (!isSessionExpiring(currentSession)) {
          applySession(currentSession)
          return
        }

        const { data: refreshedData, error: refreshError } = await supabase.auth.refreshSession()
        applySession(refreshError ? null : refreshedData.session)
      } catch {
        applySession(null)
      }
    }

    void refreshChatSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return

      if (event === 'SIGNED_OUT') {
        applySession(null)
        return
      }

      if (session && !isSessionExpiring(session)) {
        applySession(session)
        return
      }

      void refreshChatSession()
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [authLoading, authUserId, isAuthenticated])

  useEffect(() => {
    let active = true

    if (
      !supabase ||
      chatAuthStatus !== 'ready' ||
      chatTokenExpiresAt === null
    ) {
      return () => {
        active = false
      }
    }

    const authClient = supabase.auth
    const delayMs = Math.max(0, chatTokenExpiresAt - Date.now() - TOKEN_REFRESH_SKEW_MS)
    const timerId = window.setTimeout(() => {
      if (!active) return

      void authClient.refreshSession().then(({ data, error }) => {
        if (!active) return

        const session = error ? null : data.session
        setChatAccessToken(session?.access_token ?? null)
        setChatTokenExpiresAt(sessionExpiresAtMs(session))
        setChatAuthStatus(session?.access_token ? 'ready' : 'reauthRequired')
      }).catch(() => {
        if (!active) return

        setChatAccessToken(null)
        setChatTokenExpiresAt(null)
        setChatAuthStatus('reauthRequired')
      })
    }, delayMs)

    return () => {
      active = false
      window.clearTimeout(timerId)
    }
  }, [chatAuthStatus, chatTokenExpiresAt])

  async function ensureFreshChatToken(): Promise<FreshChatTokenResult> {
    if (!isAuthenticated) {
      return { accessToken: null, canSend: true }
    }

    if (!supabase) {
      setChatAccessToken(null)
      setChatTokenExpiresAt(null)
      setChatAuthStatus('reauthRequired')
      return { accessToken: null, canSend: false }
    }

    try {
      setChatAuthStatus('checking')

      const { data: currentData, error: currentError } = await supabase.auth.getSession()

      if (currentError || !currentData.session) {
        setChatAccessToken(null)
        setChatTokenExpiresAt(null)
        setChatAuthStatus('reauthRequired')
        return { accessToken: null, canSend: false }
      }

      let nextSession: ChatSessionSnapshot = currentData.session

      if (isSessionExpiring(currentData.session)) {
        const { data, error } = await supabase.auth.refreshSession()
        if (error) {
          setChatAccessToken(null)
          setChatTokenExpiresAt(null)
          setChatAuthStatus('reauthRequired')
          return { accessToken: null, canSend: false }
        }
        nextSession = data.session
      }

      if (!nextSession?.access_token || isSessionExpiring(nextSession)) {
        setChatAccessToken(null)
        setChatTokenExpiresAt(null)
        setChatAuthStatus('reauthRequired')
        return { accessToken: null, canSend: false }
      }

      setChatAccessToken(nextSession.access_token)
      setChatTokenExpiresAt(sessionExpiresAtMs(nextSession))
      setChatAuthStatus('ready')
      return { accessToken: nextSession.access_token, canSend: true }
    } catch {
      setChatAccessToken(null)
      setChatTokenExpiresAt(null)
      setChatAuthStatus('reauthRequired')
      return { accessToken: null, canSend: false }
    }
  }

  useEffect(() => {
    if (connectionStatus !== 'open') {
      setIsAwaitingResponse(false)
      setSpeakingBatchId(0)
    }
  }, [connectionStatus])

  useEffect(() => {
    if (actionBatchId === 0) {
      return
    }

    setIsAwaitingResponse(false)
    setSpeakingBatchId(actionBatchId)
    setCharacterBubbleText(latestText)
    setCharacterBubbleSequence((currentSequence) => currentSequence + 1)
    appendConversationMessage('assistant', latestText)

    const speakingTimerId = window.setTimeout(() => {
      setSpeakingBatchId((currentBatchId) =>
        currentBatchId === actionBatchId ? 0 : currentBatchId,
      )
    }, SPEAKING_STATE_DURATION_MS)

    return () => window.clearTimeout(speakingTimerId)
  }, [actionBatchId, appendConversationMessage, latestText])

  useEffect(() => {
    if (actionBatchId === 0 || executedActionBatchRef.current === actionBatchId) {
      return
    }

    executedActionBatchRef.current = actionBatchId

    if (actions.length === 0) {
      return
    }

    void executeVtuberActions({ actions, addCartItem, navigate })
  }, [actionBatchId, actions, addCartItem, navigate])

  async function handleSendMessage(message: string): Promise<boolean> {
    const hasMemberChatSession =
      chatSessionId !== null && chatSessionOwnerId === authUserId

    if (isAuthenticated && !hasMemberChatSession) {
      return false
    }

    const freshToken = await ensureFreshChatToken()

    if (!freshToken.canSend) {
      return false
    }

    const trimmedMessage = message.trim()
    const didSend = sendText(trimmedMessage, freshToken.accessToken)

    if (didSend) {
      appendConversationMessage('user', trimmedMessage)
      setIsAwaitingResponse(true)
      setSpeakingBatchId(0)
    }

    return didSend
  }

  function handleReauthClick() {
    const returnTo = `${location.pathname}${location.search}${location.hash}`
    window.sessionStorage.setItem('project-cyan:login-return-to', returnTo)
    navigate('/login', { state: { from: returnTo } })
  }

  function handleCharacterChange(characterId: string) {
    if (characterId in VTUBER_CHARACTERS) {
      setSelectedCharacterId(characterId as VtuberCharacterId)
    }
  }

  const displayState = deriveVtuberDisplayState({
    connectionStatus,
    isAwaitingResponse,
    isSpeaking: speakingBatchId > 0,
  })
  const selectedCharacter =
    VTUBER_CHARACTERS[selectedCharacterId] ?? DEFAULT_VTUBER_CHARACTER
  const hasMemberChatSession =
    chatSessionId !== null && chatSessionOwnerId === authUserId
  const hasChatSessionError =
    isAuthenticated && chatSessionErrorUserId === authUserId
  const isChatSessionUnavailable =
    isAuthenticated && !hasMemberChatSession
  const inputPlaceholder = hasChatSessionError
    ? '대화 세션을 만들지 못했어요. 새로고침 후 다시 시도해 주세요.'
    : isChatSessionUnavailable
      ? '대화 세션을 준비하는 중이에요...'
      : '굿즈를 물어보세요'
  const motionKey = metadata.behavior?.motionKey ?? null
  const authRequiredMessage = metadata.authRequired && metadata.authReason
    ? AUTH_REQUIRED_MESSAGES[metadata.authReason]
    : null
  const authNotice = isAuthenticated && chatAuthStatus === 'reauthRequired'
    ? {
        actionLabel: '로그인',
        message: '채팅 저장 세션이 만료됐어요. 다시 로그인하면 대화와 추천을 저장할 수 있습니다.',
        onAction: handleReauthClick,
      }
    : authRequiredMessage
      ? {
          actionLabel: '로그인',
          message: authRequiredMessage,
          onAction: handleReauthClick,
        }
      : null

  return (
    <VtuberChatbotShell
      actionsCount={actions.length}
      authNotice={authNotice}
      characterBubbleText={characterBubbleText}
      characterBubbleSequence={characterBubbleSequence}
      character={selectedCharacter}
      characterOptions={VTUBER_CHARACTER_OPTIONS}
      displayState={displayState}
      inputPlaceholder={inputPlaceholder}
      isSendDisabled={
        connectionStatus !== 'open' ||
        isAwaitingResponse ||
        authLoading ||
        isChatSessionUnavailable
      }
      messages={conversationMessages}
      motionKey={motionKey}
      motionTriggerId={actionBatchId}
      onCharacterChange={handleCharacterChange}
      onSendMessage={handleSendMessage}
      selectedCharacterId={selectedCharacterId}
      statusLabel={VTUBER_DISPLAY_STATE_LABELS[displayState]}
    />
  )
}

export default VtuberChatbot
