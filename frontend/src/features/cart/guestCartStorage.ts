import type { CartGoodsInput, CartItem } from './cartContext'

const GUEST_CART_STORAGE_KEY = 'project-cyan-guest-cart'

function clampQuantity(quantity: number, maxQuantity: number | null): number {
  const safeQuantity = Number.isFinite(quantity) ? Math.max(1, Math.floor(quantity)) : 1
  return maxQuantity === null ? safeQuantity : Math.min(safeQuantity, Math.max(1, maxQuantity))
}

function toGuestCartItem(goods: CartGoodsInput, quantity: number): CartItem {
  const goodsId = Number(goods.goodsId)
  const variantId = goods.variantId ?? null
  const cartItemKey = `guest:${goods.goodsId}:${variantId ?? 'base'}`
  const maxQuantity = goods.maxQuantity == null ? null : Math.max(0, Number(goods.maxQuantity))
  const price = Number(goods.variantPrice ?? goods.price ?? 0)

  return {
    cartItemId: Number.isFinite(goodsId) ? -Math.abs(goodsId) : 0,
    cartItemKey,
    goodsId: goods.goodsId,
    variantId,
    variantLabel: goods.variantLabel ?? '',
    name: goods.name ?? `Goods #${goods.goodsId}`,
    price: Number.isFinite(price) ? price : 0,
    imageUrl: goods.imageUrl ?? null,
    artistName: goods.artistName ?? 'SM Artist',
    categoryName: goods.categoryName ?? 'Goods',
    tags: goods.tags ?? [],
    quantity: clampQuantity(quantity, maxQuantity),
    maxQuantity,
    shippingFee: Number(goods.shippingFee ?? 0),
    purchaseState: null,
    purchaseMessage: null,
  }
}

function sanitizeCartItem(item: Partial<CartItem>): CartItem | null {
  if (!item || item.goodsId == null || !item.cartItemKey) {
    return null
  }

  const maxQuantity = item.maxQuantity == null ? null : Math.max(0, Number(item.maxQuantity))
  const price = Number(item.price ?? 0)
  const shippingFee = Number(item.shippingFee ?? 0)

  return {
    cartItemId: Number(item.cartItemId ?? 0),
    cartItemKey: String(item.cartItemKey),
    goodsId: item.goodsId,
    variantId: item.variantId ?? null,
    variantLabel: item.variantLabel ?? '',
    name: item.name ?? `Goods #${item.goodsId}`,
    price: Number.isFinite(price) ? price : 0,
    imageUrl: item.imageUrl ?? null,
    artistName: item.artistName ?? 'SM Artist',
    categoryName: item.categoryName ?? 'Goods',
    tags: Array.isArray(item.tags) ? item.tags : [],
    quantity: clampQuantity(Number(item.quantity ?? 1), maxQuantity),
    maxQuantity,
    shippingFee: Number.isFinite(shippingFee) ? shippingFee : 0,
    purchaseState: item.purchaseState ?? null,
    purchaseMessage: item.purchaseMessage ?? null,
  }
}

export function readGuestCartItems(): CartItem[] {
  try {
    const rawCart = window.localStorage.getItem(GUEST_CART_STORAGE_KEY)
    if (!rawCart) return []

    const parsed = JSON.parse(rawCart)
    if (!Array.isArray(parsed)) {
      window.localStorage.removeItem(GUEST_CART_STORAGE_KEY)
      return []
    }

    return parsed.flatMap((item) => {
      const cartItem = sanitizeCartItem(item)
      return cartItem ? [cartItem] : []
    })
  } catch {
    window.localStorage.removeItem(GUEST_CART_STORAGE_KEY)
    return []
  }
}

export function saveGuestCartItems(items: CartItem[]): void {
  window.localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(items))
}

export function addGuestCartItem(items: CartItem[], goods: CartGoodsInput, quantity = 1): CartItem[] {
  const nextItem = toGuestCartItem(goods, quantity)
  const existingItem = items.find((item) => item.cartItemKey === nextItem.cartItemKey)

  if (!existingItem) {
    return [...items, nextItem]
  }

  return items.map((item) => {
    if (item.cartItemKey !== nextItem.cartItemKey) return item
    return {
      ...item,
      quantity: clampQuantity(item.quantity + quantity, item.maxQuantity),
    }
  })
}

export function updateGuestCartItemQuantity(items: CartItem[], cartItemKey: CartItem['cartItemKey'], quantity: number): CartItem[] {
  if (quantity <= 0) {
    return removeGuestCartItem(items, cartItemKey)
  }

  return items.map((item) => {
    if (item.cartItemKey !== cartItemKey) return item
    return {
      ...item,
      quantity: clampQuantity(quantity, item.maxQuantity),
    }
  })
}

export function removeGuestCartItem(items: CartItem[], cartItemKey: CartItem['cartItemKey']): CartItem[] {
  return items.filter((item) => item.cartItemKey !== cartItemKey)
}

export function clearGuestCartItems(): CartItem[] {
  window.localStorage.removeItem(GUEST_CART_STORAGE_KEY)
  return []
}
