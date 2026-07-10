// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import VtuberChatbot from './VtuberChatbot'

const LEGACY_SERVER_GREETING_TEXT =
  '안녕하세요. 필요한 굿즈를 찾을 때 여기에서 도와드릴게요.\n원하시는 상품이 있으면 말씀해주세요.\n추천과 카트 담기까지 도와드릴게요.'

const mocks = vi.hoisted(() => ({
  authState: {
    authLoading: false,
    authUserId: null as string | null,
    isAuthenticated: false,
  },
  actionBatchId: 0,
  latestText: '응답',
  metadata: {} as Record<string, unknown>,
  createVirtualChatSession: vi.fn(),
  getSession: vi.fn(),
  sendText: vi.fn(() => true),
}))

vi.mock('./useVtuberWebSocket', () => ({
  useVtuberWebSocket: () => ({
    actionBatchId: mocks.actionBatchId,
    actions: [],
    connectionStatus: 'open',
    latestText: mocks.latestText,
    metadata: mocks.metadata,
    sendText: mocks.sendText,
  }),
}))

vi.mock('../cart/useCartAuthSession', () => ({
  useCartAuthSession: () => mocks.authState,
}))

vi.mock('../cart/useCart', () => ({
  useCart: () => ({ addCartItem: vi.fn(), items: [] }),
}))

vi.mock('../../api/virtualChat', () => ({
  createVirtualChatSession: mocks.createVirtualChatSession,
}))

vi.mock('../../api/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: mocks.getSession,
      refreshSession: vi.fn(async () => ({ data: { session: null }, error: null })),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  },
}))

vi.mock('../../shared/components/VtuberChatbotShell', () => ({
  default: ({
    authNotice,
    characterBubbleText,
    characterOptions,
    inputPlaceholder,
    isSendDisabled,
    messages,
    motionKey,
    motionTriggerId,
    onCharacterChange,
    onReadyGreeting,
    onSendMessage,
    readyGreetingText,
    selectedCharacterId,
  }: {
    authNotice?: { message: string; actionLabel: string; onAction: () => void } | null
    characterBubbleText: string
    characterOptions?: ReadonlyArray<{ id: string; name: string }>
    inputPlaceholder: string
    isSendDisabled: boolean
    messages?: Array<{ role: string; text: string }>
    motionKey?: string | null
    motionTriggerId?: number
    onCharacterChange?: (characterId: string) => void
    onReadyGreeting?: (message: string) => void
    onSendMessage: (message: string) => boolean | Promise<boolean>
    readyGreetingText?: string
    selectedCharacterId?: string
  }) => (
    <div>
      <p aria-label="mock character bubble">{characterBubbleText}</p>
      <p aria-label="mock input placeholder">{inputPlaceholder}</p>
      <p aria-label="mock motion key">{motionKey ?? 'none'}</p>
      <p aria-label="mock motion trigger">{motionTriggerId ?? 0}</p>
      <p aria-label="mock selected character">{selectedCharacterId ?? 'none'}</p>
      <div aria-label="mock character switcher">
        {characterOptions?.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-label={`switch ${option.name}`}
            onClick={() => onCharacterChange?.(option.id)}
          >
            {option.name}
          </button>
        ))}
      </div>
      <div aria-label="mock conversation messages">
        {messages?.map((message) => (
          <p key={`${message.role}:${message.text}`}>
            {message.role}:{message.text}
          </p>
        ))}
      </div>
      <button
        type="button"
        aria-label="mock send message"
        disabled={isSendDisabled}
        onClick={() => {
          void onSendMessage('테스트 질문')
        }}
      >
        Send mock
      </button>
      <button
        type="button"
        aria-label="mock ready greeting"
        onClick={() => onReadyGreeting?.(readyGreetingText ?? '')}
      >
        Ready mock
      </button>
      {authNotice && (
        <div>
          <p>{authNotice.message}</p>
          <button type="button" onClick={authNotice.onAction}>{authNotice.actionLabel}</button>
        </div>
      )}
    </div>
  ),
}))

function renderChatbot() {
  return render(
    <MemoryRouter initialEntries={['/goods/42?tab=details#reviews']}>
      <Routes>
        <Route path="*" element={<VtuberChatbot />} />
        <Route path="/login" element={<p>로그인 페이지</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('VtuberChatbot auth notice', () => {
  afterEach(cleanup)

  beforeEach(() => {
    window.sessionStorage.clear()
    mocks.authState = {
      authLoading: false,
      authUserId: null,
      isAuthenticated: false,
    }
    mocks.actionBatchId = 0
    mocks.latestText = '응답'
    mocks.metadata = {}
    mocks.createVirtualChatSession.mockReset()
    mocks.createVirtualChatSession.mockResolvedValue({ sessionId: 77 })
    mocks.getSession.mockResolvedValue({ data: { session: null }, error: null })
    mocks.sendText.mockClear()
    mocks.sendText.mockReturnValue(true)
  })

  it('starts without a default assistant message and appends sent user messages', async () => {
    renderChatbot()

    expect(
      screen.queryByText('assistant:필요한 굿즈를 찾을 때 여기에서 도와드릴게요.'),
    ).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'mock send message' }))

    await waitFor(() => {
      expect(screen.getByText('user:테스트 질문')).toBeTruthy()
    })
    expect(mocks.sendText).toHaveBeenCalledWith('테스트 질문', null)
  })

  it('adds the default guide when the character ready greeting fires', async () => {
    renderChatbot()

    expect(
      screen.queryByText('assistant:필요한 굿즈를 찾을 때 여기에서 도와드릴게요.'),
    ).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'mock ready greeting' }))

    await waitFor(() => {
      expect(
        screen.getAllByText('assistant:필요한 굿즈를 찾을 때 여기에서 도와드릴게요.'),
      ).toHaveLength(1)
    })
  })

  it('does not append the legacy connection greeting as a chat reply', () => {
    mocks.actionBatchId = 1
    mocks.latestText = LEGACY_SERVER_GREETING_TEXT

    renderChatbot()

    expect(
      screen.queryByText(`assistant:${LEGACY_SERVER_GREETING_TEXT}`),
    ).toBeNull()
    expect(
      screen.queryByText('assistant:필요한 굿즈를 찾을 때 여기에서 도와드릴게요.'),
    ).toBeNull()
  })

  it('removes empty response lines before showing assistant messages', async () => {
    mocks.actionBatchId = 1
    mocks.latestText = '추천드릴게요.\n\n- 아크릴 키링 — 14,000원\n\n\n- 포토카드 — 10,000원\n\n원하시면 다시 골라드릴게요.'

    renderChatbot()

    await waitFor(() => {
      expect(screen.getByLabelText('mock character bubble').textContent).toBe(
        '추천드릴게요.\n- 아크릴 키링 — 14,000원\n- 포토카드 — 10,000원\n원하시면 다시 골라드릴게요.',
      )
      expect(
        screen.getByLabelText('mock conversation messages').textContent,
      ).toContain(
        'assistant:추천드릴게요.\n- 아크릴 키링 — 14,000원\n- 포토카드 — 10,000원\n원하시면 다시 골라드릴게요.',
      )
    })
  })

  it('uses hard-coded character intro text when switching characters', async () => {
    renderChatbot()

    expect(screen.getByLabelText('mock character bubble').textContent).toBe(
      '안녕하세요, Manase입니다. 차분하게 취향에 맞는 굿즈를 찾아드릴게요.',
    )

    fireEvent.click(screen.getByRole('button', { name: 'switch Hiena' }))

    await waitFor(() => {
      expect(screen.getByLabelText('mock selected character').textContent).toBe('hiena')
      expect(screen.getByLabelText('mock character bubble').textContent).toBe(
        '안녕하세요, Hiena입니다. 필요한 굿즈를 빠르게 찾아보고 추천까지 도와드릴게요.',
      )
    })

    fireEvent.click(screen.getByRole('button', { name: 'switch Rikane 10K' }))

    await waitFor(() => {
      expect(screen.getByLabelText('mock selected character').textContent).toBe('rikane')
      expect(screen.getByLabelText('mock character bubble').textContent).toBe(
        '안녕하세요, Rikane입니다. 분위기에 맞는 굿즈를 함께 살펴보고 안내해드릴게요.',
      )
    })
  })

  it('keeps member chat sending disabled until the chat session is ready', async () => {
    mocks.authState = {
      authLoading: false,
      authUserId: 'member-1',
      isAuthenticated: true,
    }
    mocks.getSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'fresh-token',
          expires_at: Math.floor(Date.now() / 1000) + 3600,
        },
      },
      error: null,
    })
    mocks.createVirtualChatSession.mockReturnValue(new Promise(() => {}))

    renderChatbot()

    await waitFor(() => {
      expect(screen.getByLabelText('mock input placeholder').textContent).toBe(
        '대화 세션을 준비하는 중이에요...',
      )
    })
    const sendButton = screen.getByRole('button', {
      name: 'mock send message',
    }) as HTMLButtonElement
    expect(sendButton.disabled).toBe(true)

    fireEvent.click(sendButton)

    expect(mocks.sendText).not.toHaveBeenCalled()
  })

  it('keeps member chat sending disabled when chat session creation fails', async () => {
    mocks.authState = {
      authLoading: false,
      authUserId: 'member-1',
      isAuthenticated: true,
    }
    mocks.createVirtualChatSession.mockRejectedValue(new Error('session failed'))

    renderChatbot()

    await waitFor(() => {
      expect(screen.getByLabelText('mock input placeholder').textContent).toBe(
        '대화 세션을 만들지 못했어요. 새로고침 후 다시 시도해 주세요.',
      )
    })
    const sendButton = screen.getByRole('button', {
      name: 'mock send message',
    }) as HTMLButtonElement
    expect(sendButton.disabled).toBe(true)

    fireEvent.click(sendButton)

    expect(mocks.sendText).not.toHaveBeenCalled()
  })

  it('sends the same assistant response to the character bubble and chat history', async () => {
    const recommendationText = '1. 디지털 굿즈 테스트는 루루 보이스와 잘 맞아요. 2. Hiena Voice Pack도 함께 추천드릴게요.'
    mocks.actionBatchId = 1
    mocks.latestText = recommendationText
    renderChatbot()

    await waitFor(() => {
      expect(screen.getByLabelText('mock character bubble').textContent).toBe(recommendationText)
    })
    expect(screen.getByText(`assistant:${recommendationText}`)).toBeTruthy()
  })

  it('passes response behavior motion metadata to the shell', async () => {
    mocks.actionBatchId = 2
    mocks.latestText = '장바구니에 담았어요.'
    mocks.metadata = {
      behavior: {
        motionKey: 'cart-add',
        source: 'llm',
      },
    }
    renderChatbot()

    await waitFor(() => {
      expect(screen.getByLabelText('mock motion key').textContent).toBe('cart-add')
    })
    expect(screen.getByLabelText('mock motion trigger').textContent).toBe('2')
  })

  it.each([
    ['accountPersonalization', '찜·구매 이력을 활용한 추천은 로그인 후 이용할 수 있어요.'],
    ['chatHistory', '이전 대화를 이어보려면 로그인해 주세요.'],
    ['persistence', '다음 접속에도 대화를 이어가려면 로그인해 주세요.'],
    ['guestLimit', '게스트 채팅 이용 횟수를 모두 사용했어요. 로그인하고 계속 대화해 주세요.'],
  ])('shows the %s CTA and stores the complete return path', (authReason, message) => {
    mocks.metadata = {
      authRequired: true,
      authReason,
      loginPath: '/login',
    }
    renderChatbot()

    expect(screen.getByText(message)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '로그인' }))

    expect(window.sessionStorage.getItem('project-cyan:login-return-to')).toBe(
      '/goods/42?tab=details#reviews',
    )
    expect(screen.getByText('로그인 페이지')).toBeTruthy()
  })

  it('prioritizes an expired member session over a guest CTA', async () => {
    mocks.authState = {
      authLoading: false,
      authUserId: 'member-1',
      isAuthenticated: true,
    }
    mocks.metadata = {
      authRequired: true,
      authReason: 'guestLimit',
      loginPath: '/login',
    }
    renderChatbot()

    await waitFor(() => {
      expect(screen.getByText(/채팅 저장 세션이 만료됐어요/)).toBeTruthy()
    })
    expect(screen.queryByText(/게스트 채팅 이용 횟수/)).toBeNull()
  })
})
