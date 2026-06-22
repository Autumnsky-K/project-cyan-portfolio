import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { CartContext, type CartContextValue, type CartGoodsInput, type CartItem } from './cartContext'

const CART_STORAGE_KEY = 'project-cyan-cart'

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const item = value as Partial<CartItem>
  return (
    typeof item.cartItemKey === 'string' &&
    (typeof item.goodsId === 'string' || typeof item.goodsId === 'number') &&
    typeof item.name === 'string' &&
    typeof item.price === 'number' &&
    typeof item.artistName === 'string' &&
    typeof item.categoryName === 'string' &&
    Array.isArray(item.tags) &&
    typeof item.quantity === 'number' &&
    (item.maxQuantity === null || typeof item.maxQuantity === 'number') &&
    typeof item.shippingFee === 'number'
  )
}

function readCartItems(): CartItem[] {
  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY)
    const parsed: unknown = stored ? JSON.parse(stored) : []
    return Array.isArray(parsed) ? parsed.filter(isCartItem) : []
  } catch {
    return []
  }
}

function normalizeCartItem(goods: CartGoodsInput, quantity = 1): CartItem {
  const variantId = goods.variantId ?? null
  const maxQuantity = goods.maxQuantity == null ? null : Math.max(0, Number(goods.maxQuantity))
  const normalizedQuantity = Math.max(1, Math.min(quantity, maxQuantity ?? 99))
  return {
    cartItemKey: `${goods.goodsId}:${variantId ?? 'default'}`,
    goodsId: goods.goodsId,
    variantId,
    variantLabel: goods.variantLabel ?? '',
    name: goods.name ?? `Goods #${goods.goodsId}`,
    price: Number(goods.variantPrice ?? goods.price ?? 0),
    imageUrl: goods.imageUrl ?? null,
    artistName: goods.artistName ?? 'SM Artist',
    categoryName: goods.categoryName ?? 'Goods',
    tags: goods.tags ?? [],
    quantity: normalizedQuantity,
    maxQuantity,
    shippingFee: Number(goods.shippingFee ?? 0),
  }
}

type CartProviderProps = {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState(() => readCartItems())

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  }, [items])

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === CART_STORAGE_KEY) {
        setItems(readCartItems())
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const addCartItem = useCallback((goods: CartGoodsInput, quantity = 1) => {
    setItems((currentItems) => {
      const nextItem = normalizeCartItem(goods, Math.max(1, quantity))
      const existingItem = currentItems.find((item) => item.cartItemKey === nextItem.cartItemKey)

      if (!existingItem) {
        return [...currentItems, nextItem]
      }

      return currentItems.map((item) =>
        item.cartItemKey === nextItem.cartItemKey
          ? {
              ...item,
              quantity: Math.min(item.quantity + nextItem.quantity, item.maxQuantity ?? 99),
            }
          : item,
      )
    })
  }, [])

  const updateCartItemQuantity = useCallback((cartItemKey: CartItem['cartItemKey'], quantity: number) => {
    setItems((currentItems) =>
      currentItems
        .map((item) =>
          item.cartItemKey === cartItemKey
            ? { ...item, quantity: Math.min(quantity, item.maxQuantity ?? 99) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }, [])

  const removeCartItem = useCallback((cartItemKey: CartItem['cartItemKey']) => {
    setItems((currentItems) => currentItems.filter((item) => item.cartItemKey !== cartItemKey))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      addCartItem,
      updateCartItemQuantity,
      removeCartItem,
      clearCart,
    }),
    [addCartItem, clearCart, items, removeCartItem, updateCartItemQuantity],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
