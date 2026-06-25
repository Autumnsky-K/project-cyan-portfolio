import { useCallback, useEffect, useRef, useState } from 'react'

import {
  type VtuberClientCartItem,
  type VtuberAction,
  type VtuberClientTextInputMessage,
  type VtuberConnectionStatus,
  type VtuberRecommendationMetadata,
  type VtuberServerMessage,
  type VtuberServerMetadata,
} from './types'

const VTUBER_WS_PATH = '/client-ws'

type UseVtuberWebSocketResult = {
  actionBatchId: number
  actions: VtuberAction[]
  connectionStatus: VtuberConnectionStatus
  latestMetadata: VtuberServerMetadata
  latestText: string
  sendText: (text: string) => boolean
}

function buildVtuberWebSocketUrl(): string {
  const configuredUrl = import.meta.env.VITE_VTUBER_WS_URL

  if (configuredUrl) {
    return configuredUrl
  }

  const { host, protocol } = window.location
  const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:'

  return `${wsProtocol}//${host}${VTUBER_WS_PATH}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizeAction(value: unknown): VtuberAction | null {
  if (!isRecord(value) || typeof value.type !== 'string') {
    return null
  }

  return { ...value, type: value.type }
}

function normalizeRecommendation(value: unknown): VtuberRecommendationMetadata | null {
  if (!isRecord(value) || value.goodsId === undefined) {
    return null
  }

  return {
    goodsId: typeof value.goodsId === 'number' ? value.goodsId : String(value.goodsId),
    recommendationReason:
      typeof value.recommendationReason === 'string'
        ? value.recommendationReason
        : null,
    rankOrder:
      typeof value.rankOrder === 'number' && Number.isFinite(value.rankOrder)
        ? value.rankOrder
        : undefined,
  }
}

function normalizeMetadata(value: unknown): VtuberServerMetadata {
  if (!isRecord(value)) {
    return {}
  }

  return {
    ...value,
    recommendations: Array.isArray(value.recommendations)
      ? value.recommendations
        .map(normalizeRecommendation)
        .filter((recommendation): recommendation is VtuberRecommendationMetadata => (
          recommendation !== null
        ))
      : undefined,
  }
}

function parseVtuberServerMessage(value: unknown): VtuberServerMessage | null {
  if (
    !isRecord(value) ||
    typeof value.type !== 'string' ||
    typeof value.text !== 'string' ||
    !Array.isArray(value.actions)
  ) {
    return null
  }

  return {
    type: value.type,
    text: value.text,
    actions: value.actions
      .map(normalizeAction)
      .filter((action): action is VtuberAction => action !== null),
    metadata: normalizeMetadata(value.metadata),
  }
}

export function useVtuberWebSocket(
  initialText: string,
  cartItems: VtuberClientCartItem[] = [],
  sessionId: number | null = null,
): UseVtuberWebSocketResult {
  const socketRef = useRef<WebSocket | null>(null)
  const closedByHookRef = useRef(false)
  const sawConnectionErrorRef = useRef(false)
  const [connectionStatus, setConnectionStatus] = useState<VtuberConnectionStatus>('idle')
  const [latestText, setLatestText] = useState(initialText)
  const [latestMetadata, setLatestMetadata] = useState<VtuberServerMetadata>({})
  const [actions, setActions] = useState<VtuberAction[]>([])
  const [actionBatchId, setActionBatchId] = useState(0)

  useEffect(() => {
    closedByHookRef.current = false
    sawConnectionErrorRef.current = false
    setConnectionStatus('connecting')

    const socket = new WebSocket(buildVtuberWebSocketUrl())
    socketRef.current = socket

    socket.addEventListener('open', () => {
      setConnectionStatus('open')
    })

    socket.addEventListener('message', (event: MessageEvent<string>) => {
      try {
        const message = parseVtuberServerMessage(JSON.parse(event.data))

        if (!message) {
          return
        }

        setLatestText(message.text)
        setLatestMetadata(message.metadata ?? {})
        setActions(message.actions)
        setActionBatchId((currentId) => currentId + 1)
      } catch {
        return
      }
    })

    socket.addEventListener('error', () => {
      sawConnectionErrorRef.current = true
      setConnectionStatus('error')
    })

    socket.addEventListener('close', () => {
      if (closedByHookRef.current) {
        return
      }

      setConnectionStatus(sawConnectionErrorRef.current ? 'error' : 'closed')
    })

    return () => {
      closedByHookRef.current = true
      socket.close()
      socketRef.current = null
    }
  }, [])

  const sendText = useCallback((text: string) => {
    const trimmedText = text.trim()
    const socket = socketRef.current

    if (!trimmedText || socket?.readyState !== WebSocket.OPEN) {
      return false
    }

    const message: VtuberClientTextInputMessage = {
      type: 'text-input',
      text: trimmedText,
      context: {
        cartItems: cartItems.map((item) => ({
          goodsId: item.goodsId,
          name: item.name,
          quantity: item.quantity,
          tags: item.tags,
          artistName: item.artistName,
          categoryName: item.categoryName,
        })),
      },
    }

    if (sessionId !== null) {
      message.sessionId = sessionId
    }

    socket.send(JSON.stringify(message))
    return true
  }, [cartItems, sessionId])

  return {
    actionBatchId,
    actions,
    connectionStatus,
    latestMetadata,
    latestText,
    sendText,
  }
}
