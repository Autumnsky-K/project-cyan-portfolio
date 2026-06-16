import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { CartContext, type CartContextValue, type CartGoodsInput, type CartItem } from './cartContext'

const CART_STORAGE_KEY = 'project-cyan-cart'

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const item = value as Partial<CartItem>
  return (
    (typeof item.goodsId === 'string' || typeof item.goodsId === 'number') &&
    typeof item.name === 'string' &&
    typeof item.price === 'number' &&
    typeof item.artistName === 'string' &&
    typeof item.categoryName === 'string' &&
    Array.isArray(item.tags) &&
    typeof item.quantity === 'number'
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
  return {
    goodsId: goods.goodsId,
    name: goods.name ?? `Goods #${goods.goodsId}`,
    price: Number(goods.price ?? 0),
    imageUrl: goods.imageUrl ?? null,
    artistName: goods.artistName ?? 'SM Artist',
    categoryName: goods.categoryName ?? 'Goods',
    tags: goods.tags ?? [],
    quantity,
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

  const addCartItem = useCallback((goods: CartGoodsInput, quantity = 1) => {
    setItems((currentItems) => {
      const nextItem = normalizeCartItem(goods, Math.max(1, quantity))
      const existingItem = currentItems.find((item) => item.goodsId === nextItem.goodsId)

      if (!existingItem) {
        return [...currentItems, nextItem]
      }

      return currentItems.map((item) =>
        item.goodsId === nextItem.goodsId ? { ...item, quantity: item.quantity + nextItem.quantity } : item,
      )
    })
  }, [])

  const updateCartItemQuantity = useCallback((goodsId: CartItem['goodsId'], quantity: number) => {
    setItems((currentItems) =>
      currentItems
        .map((item) => (item.goodsId === goodsId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0),
    )
  }, [])

  const removeCartItem = useCallback((goodsId: CartItem['goodsId']) => {
    setItems((currentItems) => currentItems.filter((item) => item.goodsId !== goodsId))
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
