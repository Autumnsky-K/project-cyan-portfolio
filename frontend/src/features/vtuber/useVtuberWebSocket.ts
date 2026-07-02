import { useCallback, useEffect, useRef, useState } from 'react'

import {
  type VtuberClientCartItem,
  type VtuberAction,
  type VtuberAuthReason,
  type VtuberClientAuthMessage,
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
  latestText: string
  metadata: VtuberServerMetadata
  sendText: (text: string, accessTokenOverride?: string | null) => boolean
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

const VTUBER_AUTH_REASONS = new Set<VtuberAuthReason>([
  'accountPersonalization',
  'chatHistory',
  'persistence',
  'guestLimit',
])

function normalizeAuthReason(value: unknown): VtuberAuthReason | undefined {
  return typeof value === 'string' && VTUBER_AUTH_REASONS.has(value as VtuberAuthReason)
    ? value as VtuberAuthReason
    : undefined
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
    authRequired: value.authRequired === true ? true : undefined,
    authReason: normalizeAuthReason(value.authReason),
    loginPath: value.loginPath === '/login' ? '/login' : undefined,
  }
}

export function parseVtuberServerMessage(value: unknown): VtuberServerMessage | null {
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
  accessToken: string | null = null,
  currentPath: string | null = null,
): UseVtuberWebSocketResult {
  const socketRef = useRef<WebSocket | null>(null)
  const sentAccessTokenRef = useRef<string | null>(null)
  const recentRecommendationsRef = useRef<VtuberRecommendationMetadata[]>([])
  const closedByHookRef = useRef(false)
  const sawConnectionErrorRef = useRef(false)
  const [connectionStatus, setConnectionStatus] = useState<VtuberConnectionStatus>('idle')
  const [latestText, setLatestText] = useState(initialText)
  const [actions, setActions] = useState<VtuberAction[]>([])
  const [actionBatchId, setActionBatchId] = useState(0)
  const [metadata, setMetadata] = useState<VtuberServerMetadata>({})
  const hasAccessToken = Boolean(accessToken)

  useEffect(() => {
    closedByHookRef.current = false
    sawConnectionErrorRef.current = false
    setConnectionStatus('connecting')

    const socket = new WebSocket(buildVtuberWebSocketUrl())
    socketRef.current = socket
    sentAccessTokenRef.current = null

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
        setActions(message.actions)
        setMetadata(message.metadata ?? {})
        if (message.metadata?.recommendations?.length) {
          recentRecommendationsRef.current = message.metadata.recommendations
        }
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
      sentAccessTokenRef.current = null
    }
  }, [hasAccessToken])

  useEffect(() => {
    const socket = socketRef.current

    if (!accessToken) {
      sentAccessTokenRef.current = null
      return
    }

    if (
      connectionStatus !== 'open' ||
      socket?.readyState !== WebSocket.OPEN ||
      sentAccessTokenRef.current === accessToken
    ) {
      return
    }

    const authMessage: VtuberClientAuthMessage = {
      type: 'auth',
      accessToken,
    }

    socket.send(JSON.stringify(authMessage))
    sentAccessTokenRef.current = accessToken
  }, [accessToken, connectionStatus])

  const sendText = useCallback((text: string, accessTokenOverride: string | null = null) => {
    const trimmedText = text.trim()
    const socket = socketRef.current

    if (!trimmedText || socket?.readyState !== WebSocket.OPEN) {
      return false
    }

    if (accessTokenOverride && sentAccessTokenRef.current !== accessTokenOverride) {
      const authMessage: VtuberClientAuthMessage = {
        type: 'auth',
        accessToken: accessTokenOverride,
      }

      socket.send(JSON.stringify(authMessage))
      sentAccessTokenRef.current = accessTokenOverride
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
        recentRecommendations: recentRecommendationsRef.current.map((recommendation) => ({
          goodsId: recommendation.goodsId,
          rankOrder: recommendation.rankOrder,
        })),
        ...(currentPath ? { currentPath } : {}),
      },
    }

    if (sessionId !== null) {
      message.sessionId = sessionId
    }

    socket.send(JSON.stringify(message))
    return true
  }, [cartItems, currentPath, sessionId])

  return {
    actionBatchId,
    actions,
    connectionStatus,
    latestText,
    metadata,
    sendText,
  }
}
