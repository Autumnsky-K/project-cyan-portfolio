// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import VtuberChatbot from './VtuberChatbot'

const mocks = vi.hoisted(() => ({
  authState: {
    authLoading: false,
    authUserId: null as string | null,
    isAuthenticated: false,
  },
  metadata: {} as Record<string, unknown>,
  getSession: vi.fn(),
}))

vi.mock('./useVtuberWebSocket', () => ({
  useVtuberWebSocket: () => ({
    actionBatchId: 0,
    actions: [],
    connectionStatus: 'open',
    latestText: '응답',
    metadata: mocks.metadata,
    sendText: vi.fn(() => true),
  }),
}))

vi.mock('../cart/useCartAuthSession', () => ({
  useCartAuthSession: () => mocks.authState,
}))

vi.mock('../cart/useCart', () => ({
  useCart: () => ({ addCartItem: vi.fn(), items: [] }),
}))

vi.mock('../../api/virtualChat', () => ({
  createVirtualChatSession: vi.fn(async () => ({ sessionId: 77 })),
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
  }: {
    authNotice?: { message: string; actionLabel: string; onAction: () => void } | null
  }) => (
    <div>
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
    mocks.metadata = {}
    mocks.getSession.mockResolvedValue({ data: { session: null }, error: null })
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
