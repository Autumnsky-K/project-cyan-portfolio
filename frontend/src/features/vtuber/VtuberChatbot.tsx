import { type ReactElement, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  createVirtualChatMessage,
  createVirtualChatSession,
  type VirtualRecommendationInput,
} from '../../api/virtualChat'
import { useCartAuthSession } from '../cart/useCartAuthSession'
import VtuberChatbotShell from '../../shared/components/VtuberChatbotShell'
import { useCart } from '../cart/useCart'
import { executeVtuberActions } from './actions/executeVtuberActions'
import { DEFAULT_VTUBER_CHARACTER } from './characters'
import {
  deriveVtuberDisplayState,
  VTUBER_DISPLAY_STATE_LABELS,
} from './displayState'
import { useVtuberWebSocket } from './useVtuberWebSocket'

const INITIAL_BUBBLE_TEXT = '필요한 굿즈를 찾을 때 여기에서 도와드릴게요.'
const SPEAKING_STATE_DURATION_MS = 2400
const DEFAULT_GUIDE_ID = 1

function goodsIdFromAction(action: { type: string; [key: string]: unknown }): number | null {
  if (action.type === 'addToCart' && typeof action.goodsId === 'string') {
    const goodsId = Number(action.goodsId)
    return Number.isInteger(goodsId) && goodsId > 0 ? goodsId : null
  }

  if (action.type === 'navigate' && typeof action.path === 'string') {
    const match = action.path.match(/^\/goods\/(\d+)$/)
    const goodsId = match ? Number(match[1]) : Number.NaN
    return Number.isInteger(goodsId) && goodsId > 0 ? goodsId : null
  }

  if (action.type === 'highlight' && typeof action.selector === 'string') {
    const match = action.selector.match(/data-goods-id=['"](\d+)['"]/)
    const goodsId = match ? Number(match[1]) : Number.NaN
    return Number.isInteger(goodsId) && goodsId > 0 ? goodsId : null
  }

  return null
}

function recommendationsFromActions(
  actions: { type: string; [key: string]: unknown }[],
  requestText: string,
): VirtualRecommendationInput[] {
  const goodsIds: number[] = []

  for (const action of actions) {
    const goodsId = goodsIdFromAction(action)

    if (goodsId !== null && !goodsIds.includes(goodsId)) {
      goodsIds.push(goodsId)
    }
  }

  return goodsIds.map((goodsId, index) => ({
    goodsId,
    requestText,
    recommendationReason: null,
    rankOrder: index,
  }))
}

function VtuberChatbot(): ReactElement {
  const navigate = useNavigate()
  const { authLoading, authUserId, isAuthenticated } = useCartAuthSession()
  const { addCartItem, items } = useCart()
  const executedActionBatchRef = useRef(0)
  const pendingUserMessageRef = useRef('')
  const [isAwaitingResponse, setIsAwaitingResponse] = useState(false)
  const [speakingBatchId, setSpeakingBatchId] = useState(0)
  const [chatSessionId, setChatSessionId] = useState<number | null>(null)
  const { actionBatchId, actions, connectionStatus, latestText, sendText } =
    useVtuberWebSocket(INITIAL_BUBBLE_TEXT, items, chatSessionId)

  useEffect(() => {
    let active = true

    if (authLoading || !isAuthenticated) {
      window.setTimeout(() => {
        if (active && !isAuthenticated) {
          setChatSessionId(null)
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
      })
      .catch(() => {
        if (!active) {
          return
        }

        setChatSessionId(null)
      })

    return () => {
      active = false
    }
  }, [authLoading, authUserId, isAuthenticated])

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

    if (chatSessionId !== null && pendingUserMessageRef.current) {
      const requestText = pendingUserMessageRef.current
      pendingUserMessageRef.current = ''

      void createVirtualChatMessage(chatSessionId, {
        speaker: 'ASSISTANT',
        messageText: latestText,
        action: actions[0]?.type ?? null,
        actions,
        recommendations: recommendationsFromActions(actions, requestText),
      }).catch(() => undefined)
    }

    const speakingTimerId = window.setTimeout(() => {
      setSpeakingBatchId((currentBatchId) =>
        currentBatchId === actionBatchId ? 0 : currentBatchId,
      )
    }, SPEAKING_STATE_DURATION_MS)

    return () => window.clearTimeout(speakingTimerId)
  }, [actionBatchId, actions, chatSessionId, latestText])

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

  function handleSendMessage(message: string): boolean {
    const didSend = sendText(message)

    if (didSend) {
      pendingUserMessageRef.current = message
      setIsAwaitingResponse(true)
      setSpeakingBatchId(0)

      if (chatSessionId !== null) {
        void createVirtualChatMessage(chatSessionId, {
          speaker: 'USER',
          messageText: message,
        }).catch(() => undefined)
      }
    }

    return didSend
  }

  const displayState = deriveVtuberDisplayState({
    connectionStatus,
    isAwaitingResponse,
    isSpeaking: speakingBatchId > 0,
  })

  return (
    <VtuberChatbotShell
      actionsCount={actions.length}
      bubbleText={latestText}
      character={DEFAULT_VTUBER_CHARACTER}
      displayState={displayState}
      isSendDisabled={
        connectionStatus !== 'open' || isAwaitingResponse || authLoading
      }
      onSendMessage={handleSendMessage}
      statusLabel={VTUBER_DISPLAY_STATE_LABELS[displayState]}
    />
  )
}

export default VtuberChatbot
