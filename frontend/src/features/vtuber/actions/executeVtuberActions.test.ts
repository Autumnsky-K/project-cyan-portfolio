// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'

import { executeVtuberActions } from './executeVtuberActions'

describe('executeVtuberActions navigation allow-list', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it.each(['/goods', '/goods/42', '/cart'])('navigates to allowed shopping path %s', async (path) => {
    vi.useFakeTimers()
    const navigate = vi.fn()
    const execution = executeVtuberActions({
      actions: [{ type: 'navigate', path }],
      addCartItem: vi.fn(),
      navigate,
    })

    await vi.runAllTimersAsync()
    await execution

    expect(navigate).toHaveBeenCalledWith(path)
  })

  it.each(['https://evil.example', '/admin', '/goods/not-a-number'])(
    'ignores unsafe navigation path %s',
    async (path) => {
      const navigate = vi.fn()

      await executeVtuberActions({
        actions: [{ type: 'navigate', path }],
        addCartItem: vi.fn(),
        navigate,
      })

      expect(navigate).not.toHaveBeenCalled()
    },
  )

  it('opens an exact recommendation result for multiple goods', async () => {
    vi.useFakeTimers()
    const navigate = vi.fn()
    const execution = executeVtuberActions({
      actions: [{ type: 'showRecommendations', goodsIds: ['42', '84'] }],
      addCartItem: vi.fn(),
      navigate,
    })

    await vi.runAllTimersAsync()
    await execution

    expect(navigate).toHaveBeenCalledWith('/goods?recommendations=42%2C84')
  })

  it.each([
    ['42'],
    ['42', '42'],
    ['42', '../admin'],
  ])('ignores invalid recommendation goods IDs %j', async (goodsIds) => {
    const navigate = vi.fn()

    await executeVtuberActions({
      actions: [{ type: 'showRecommendations', goodsIds }],
      addCartItem: vi.fn(),
      navigate,
    })

    expect(navigate).not.toHaveBeenCalled()
  })
})
