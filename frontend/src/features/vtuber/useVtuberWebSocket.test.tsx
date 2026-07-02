// @vitest-environment jsdom

import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useVtuberWebSocket } from './useVtuberWebSocket'

type Listener = (event: Event | MessageEvent<string>) => void

class FakeWebSocket {
  static OPEN = 1
  static instances: FakeWebSocket[] = []

  readyState = FakeWebSocket.OPEN
  sent: string[] = []
  listeners = new Map<string, Listener[]>()

  constructor(public url: string) {
    FakeWebSocket.instances.push(this)
  }

  addEventListener(type: string, listener: Listener) {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener])
  }

  send(value: string) {
    this.sent.push(value)
  }

  close() {
    this.readyState = 3
  }

  emit(type: string, event: Event | MessageEvent<string> = new Event(type)) {
    for (const listener of this.listeners.get(type) ?? []) listener(event)
  }
}

describe('useVtuberWebSocket', () => {
  beforeEach(() => {
    FakeWebSocket.instances = []
    vi.stubGlobal('WebSocket', FakeWebSocket)
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('returns normalized auth metadata from the latest full-text message', () => {
    const { result } = renderHook(() => useVtuberWebSocket('처음'))
    const socket = FakeWebSocket.instances[0]

    act(() => {
      socket.emit('open')
      socket.emit('message', new MessageEvent('message', {
        data: JSON.stringify({
          type: 'full-text',
          text: '로그인이 필요해요.',
          actions: [],
          metadata: {
            authRequired: true,
            authReason: 'chatHistory',
            loginPath: '/login',
          },
        }),
      }))
    })

    expect(result.current.metadata).toEqual({
      authRequired: true,
      authReason: 'chatHistory',
      loginPath: '/login',
      recommendations: undefined,
    })
  })

  it('does not resend the same auth token before every text message', () => {
    const { result } = renderHook(() => useVtuberWebSocket('처음', [], 7, 'token'))
    const socket = FakeWebSocket.instances[0]

    act(() => socket.emit('open'))
    act(() => {
      expect(result.current.sendText('안녕', 'token')).toBe(true)
    })

    expect(socket.sent.map((payload) => JSON.parse(payload).type)).toEqual([
      'auth',
      'text-input',
    ])
  })

  it('sends the last recommendations as follow-up selection context', () => {
    const { result } = renderHook(() => useVtuberWebSocket('처음'))
    const socket = FakeWebSocket.instances[0]

    act(() => {
      socket.emit('open')
      socket.emit('message', new MessageEvent('message', {
        data: JSON.stringify({
          type: 'full-text',
          text: '추천 결과',
          actions: [],
          metadata: {
            recommendations: [
              { goodsId: 42, rankOrder: 0 },
              { goodsId: 84, rankOrder: 1 },
            ],
          },
        }),
      }))
    })
    act(() => expect(result.current.sendText('첫번째 걸 담아줘')).toBe(true))

    expect(JSON.parse(socket.sent[0]).context.recentRecommendations).toEqual([
      { goodsId: 42, rankOrder: 0 },
      { goodsId: 84, rankOrder: 1 },
    ])
  })
})
