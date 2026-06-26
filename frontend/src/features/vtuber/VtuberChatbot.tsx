import { type ReactElement, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { supabase } from '../../api/supabaseClient'
import { createVirtualChatSession } from '../../api/virtualChat'
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

function VtuberChatbot(): ReactElement {
  const navigate = useNavigate()
  const { authLoading, authUserId, isAuthenticated } = useCartAuthSession()
  const { addCartItem, items } = useCart()
  const executedActionBatchRef = useRef(0)
  const [isAwaitingResponse, setIsAwaitingResponse] = useState(false)
  const [speakingBatchId, setSpeakingBatchId] = useState(0)
  const [chatSessionId, setChatSessionId] = useState<number | null>(null)
  const [chatAccessToken, setChatAccessToken] = useState<string | null>(null)
  const { actionBatchId, actions, connectionStatus, latestText, sendText } =
    useVtuberWebSocket(INITIAL_BUBBLE_TEXT, items, chatSessionId, chatAccessToken)

  useEffect(() => {
    let active = true

    if (authLoading || !isAuthenticated) {
      window.setTimeout(() => {
        if (active && !isAuthenticated) {
          setChatSessionId(null)
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
    let active = true

    if (authLoading || !isAuthenticated || !supabase) {
      window.setTimeout(() => {
        if (active) {
          setChatAccessToken(null)
        }
      }, 0)
      return () => {
        active = false
      }
    }

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) {
        return
      }

      setChatAccessToken(data.session?.access_token ?? null)
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

    const speakingTimerId = window.setTimeout(() => {
      setSpeakingBatchId((currentBatchId) =>
        currentBatchId === actionBatchId ? 0 : currentBatchId,
      )
    }, SPEAKING_STATE_DURATION_MS)

    return () => window.clearTimeout(speakingTimerId)
  }, [actionBatchId])

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
      setIsAwaitingResponse(true)
      setSpeakingBatchId(0)
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
