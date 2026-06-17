import { createContext } from 'react'

export type CartGoodsInput = {
  goodsId: string | number
  name?: string | null
  price?: number | null
  imageUrl?: string | null
  artistName?: string | null
  categoryName?: string | null
  tags?: string[] | null
}

export type CartItem = {
  goodsId: string | number
  name: string
  price: number
  imageUrl: string | null
  artistName: string
  categoryName: string
  tags: string[]
  quantity: number
}

export type CartContextValue = {
  items: CartItem[]
  addCartItem: (goods: CartGoodsInput, quantity?: number) => void
  updateCartItemQuantity: (goodsId: CartItem['goodsId'], quantity: number) => void
  removeCartItem: (goodsId: CartItem['goodsId']) => void
  clearCart: () => void
}

export const CartContext = createContext<CartContextValue | null>(null)
