// @vitest-environment jsdom

import { act, cleanup, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { CartProvider } from './cartStore'

const mocks = vi.hoisted(() => ({
  authCallback: null as null | (() => void),
  mergeGuestCart: vi.fn(),
}))

vi.mock('../../api/cart', () => ({
  addCartItem: vi.fn(),
  clearCart: vi.fn(),
  removeCartItem: vi.fn(),
  updateCartItemQuantity: vi.fn(),
}))

vi.mock('../../shared/api/springApiClient', () => ({
  hasSpringApiSession: vi.fn(async () => true),
}))

vi.mock('./useCartAuthSession', () => ({
  useCartAuthSession: () => ({
    authLoading: false,
    authUserId: 'member-1',
    isAuthenticated: true,
  }),
}))

vi.mock('../../api/supabaseClient', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn((callback: () => void) => {
        mocks.authCallback = callback
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      }),
    },
  },
}))

vi.mock('./mergeGuestCart', () => ({
  mergeGuestCart: mocks.mergeGuestCart,
}))

describe('CartProvider guest merge', () => {
  afterEach(cleanup)

  beforeEach(() => {
    mocks.authCallback = null
    mocks.mergeGuestCart.mockReset()
  })

  it('shares one in-flight merge across repeated auth events', async () => {
    let resolveMerge: ((value: unknown) => void) | null = null
    mocks.mergeGuestCart.mockImplementation(() => new Promise((resolve) => {
      resolveMerge = resolve
    }))

    render(<CartProvider><div>cart child</div></CartProvider>)

    await waitFor(() => expect(mocks.mergeGuestCart).toHaveBeenCalledTimes(1))
    act(() => mocks.authCallback?.())
    expect(mocks.mergeGuestCart).toHaveBeenCalledTimes(1)

    await act(async () => {
      resolveMerge?.({
        cart: { cartId: 1, items: [], totalQuantity: 0, totalPrice: 0 },
        failedItems: [],
      })
    })
  })
})
