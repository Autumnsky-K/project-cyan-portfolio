import { useCallback, useEffect, useRef, useState } from 'react'

import {
  type VtuberClientCartItem,
  type VtuberAction,
  type VtuberClientTextInputMessage,
  type VtuberConnectionStatus,
  type VtuberServerMessage,
} from './types'

const VTUBER_WS_PATH = '/client-ws'

type UseVtuberWebSocketResult = {
  actionBatchId: number
  actions: VtuberAction[]
  connectionStatus: VtuberConnectionStatus
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
  }
}

export function useVtuberWebSocket(
  initialText: string,
  cartItems: VtuberClientCartItem[] = [],
): UseVtuberWebSocketResult {
  const socketRef = useRef<WebSocket | null>(null)
  const closedByHookRef = useRef(false)
  const sawConnectionErrorRef = useRef(false)
  const [connectionStatus, setConnectionStatus] = useState<VtuberConnectionStatus>('idle')
  const [latestText, setLatestText] = useState(initialText)
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

    socket.send(JSON.stringify(message))
    return true
  }, [cartItems])

  return {
    actionBatchId,
    actions,
    connectionStatus,
    latestText,
    sendText,
  }
}
