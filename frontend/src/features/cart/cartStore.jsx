import { useEffect, useMemo, useState } from 'react'
import { CartContext } from './cartContext'

const CART_STORAGE_KEY = 'project-cyan-cart'

function readCartItems() {
  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function normalizeCartItem(goods, quantity = 1) {
  return {
    goodsId: goods.goodsId,
    name: goods.name,
    price: Number(goods.price ?? 0),
    imageUrl: goods.imageUrl ?? null,
    artistName: goods.artistName ?? 'SM Artist',
    categoryName: goods.categoryName ?? 'Goods',
    tags: goods.tags ?? [],
    quantity,
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readCartItems())

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const value = useMemo(
    () => ({
      items,
      addCartItem(goods, quantity = 1) {
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
      },
      updateCartItemQuantity(goodsId, quantity) {
        setItems((currentItems) =>
          currentItems
            .map((item) => (item.goodsId === goodsId ? { ...item, quantity } : item))
            .filter((item) => item.quantity > 0),
        )
      },
      removeCartItem(goodsId) {
        setItems((currentItems) => currentItems.filter((item) => item.goodsId !== goodsId))
      },
      clearCart() {
        setItems([])
      },
    }),
    [items],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
