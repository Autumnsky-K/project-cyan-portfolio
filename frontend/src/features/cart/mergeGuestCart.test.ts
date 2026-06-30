// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { CartApiResponse } from '../../api/cart'
import { addGuestCartItem, readGuestCartItems, saveGuestCartItems } from './guestCartStorage'
import { mergeGuestCart } from './mergeGuestCart'

const EMPTY_REMOTE_CART: CartApiResponse = {
  cartId: 1,
  items: [],
  totalQuantity: 0,
  totalPrice: 0,
}

describe('mergeGuestCart', () => {
  beforeEach(() => window.localStorage.clear())

  it('removes each success immediately and retains only failed items for retry', async () => {
    const first = addGuestCartItem([], { goodsId: 101, name: '성공 상품' }, 2)
    const items = addGuestCartItem(first, { goodsId: 202, name: '실패 상품' }, 1)
    saveGuestCartItems(items)

    const addItem = vi.fn(async (goodsId: string | number) => {
      if (goodsId === 202) throw new Error('temporary failure')
      return EMPTY_REMOTE_CART
    })
    const fetchRemoteCart = vi.fn(async () => EMPTY_REMOTE_CART)

    const firstResult = await mergeGuestCart({ addItem, fetchRemoteCart })

    expect(addItem.mock.calls).toEqual([[101, 2], [202, 1]])
    expect(firstResult.failedItems.map((item) => item.goodsId)).toEqual([202])
    expect(readGuestCartItems().map((item) => item.goodsId)).toEqual([202])
    expect(fetchRemoteCart).toHaveBeenCalledTimes(1)

    await mergeGuestCart({ addItem, fetchRemoteCart })

    expect(addItem.mock.calls).toEqual([[101, 2], [202, 1], [202, 1]])
    expect(fetchRemoteCart).toHaveBeenCalledTimes(2)
  })
})
