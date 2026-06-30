import {
  addCartItem as addRemoteCartItem,
  fetchCart,
  type CartApiResponse,
} from '../../api/cart'
import {
  readGuestCartItems,
  removeStoredGuestCartItem,
} from './guestCartStorage'
import type { CartItem } from './cartContext'

type MergeGuestCartDependencies = {
  addItem: typeof addRemoteCartItem
  fetchRemoteCart: typeof fetchCart
}

export type GuestCartMergeResult = {
  cart: CartApiResponse
  failedItems: CartItem[]
}

const DEFAULT_DEPENDENCIES: MergeGuestCartDependencies = {
  addItem: addRemoteCartItem,
  fetchRemoteCart: fetchCart,
}

export async function mergeGuestCart(
  dependencies: MergeGuestCartDependencies = DEFAULT_DEPENDENCIES,
): Promise<GuestCartMergeResult> {
  const failedItems: CartItem[] = []

  for (const item of readGuestCartItems()) {
    try {
      await dependencies.addItem(item.goodsId, item.quantity)
      removeStoredGuestCartItem(item.cartItemKey)
    } catch {
      failedItems.push(item)
    }
  }

  return {
    cart: await dependencies.fetchRemoteCart(),
    failedItems,
  }
}
