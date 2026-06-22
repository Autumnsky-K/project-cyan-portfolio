import { createContext } from 'react'

export type CartGoodsInput = {
  goodsId: string | number
  name?: string | null
  price?: number | null
  imageUrl?: string | null
  artistName?: string | null
  categoryName?: string | null
  tags?: string[] | null
  variantId?: string | number | null
  variantLabel?: string | null
  variantPrice?: number | null
  maxQuantity?: number | null
  shippingFee?: number | null
}

export type CartItem = {
  cartItemKey: string
  goodsId: string | number
  variantId: string | number | null
  variantLabel: string
  name: string
  price: number
  imageUrl: string | null
  artistName: string
  categoryName: string
  tags: string[]
  quantity: number
  maxQuantity: number | null
  shippingFee: number
}

export type CartContextValue = {
  items: CartItem[]
  addCartItem: (goods: CartGoodsInput, quantity?: number) => void
  updateCartItemQuantity: (cartItemKey: CartItem['cartItemKey'], quantity: number) => void
  removeCartItem: (cartItemKey: CartItem['cartItemKey']) => void
  clearCart: () => void
}

export const CartContext = createContext<CartContextValue | null>(null)
