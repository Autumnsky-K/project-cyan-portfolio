import { type ReactElement, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import VtuberChatbotShell from '../../shared/components/VtuberChatbotShell'
import { useCart } from '../cart/useCart'
import { executeVtuberActions } from './actions/executeVtuberActions'
import { useVtuberWebSocket } from './useVtuberWebSocket'
import { type VtuberConnectionStatus } from './types'

const INITIAL_BUBBLE_TEXT = '필요한 굿즈를 찾을 때 여기에서 도와드릴게요.'

const CONNECTION_STATUS_LABELS: Record<VtuberConnectionStatus, string> = {
  idle: '연결 전',
  connecting: '연결 중',
  open: '연결됨',
  closed: '연결 전',
  error: '오류',
}

function VtuberChatbot(): ReactElement {
  const navigate = useNavigate()
  const { addCartItem } = useCart()
  const executedActionBatchRef = useRef(0)
  const { actionBatchId, actions, connectionStatus, latestText, sendText } =
    useVtuberWebSocket(INITIAL_BUBBLE_TEXT)

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

  return (
    <VtuberChatbotShell
      actionsCount={actions.length}
      bubbleText={latestText}
      isSendDisabled={connectionStatus !== 'open'}
      onSendMessage={sendText}
      statusLabel={CONNECTION_STATUS_LABELS[connectionStatus]}
    />
  )
}

export default VtuberChatbot
