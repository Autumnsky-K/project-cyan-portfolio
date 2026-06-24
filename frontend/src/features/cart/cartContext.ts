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
  cartItemId: number
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
  purchaseState?: string | null
  purchaseMessage?: string | null
}

export type CartContextValue = {
  items: CartItem[]
  status: 'idle' | 'loading' | 'data' | 'error' | 'signedOut'
  error: string
  isSignedIn: boolean
  refreshCart: () => Promise<void>
  addCartItem: (goods: CartGoodsInput, quantity?: number) => Promise<void>
  updateCartItemQuantity: (cartItemKey: CartItem['cartItemKey'], quantity: number) => Promise<void>
  removeCartItem: (cartItemKey: CartItem['cartItemKey']) => Promise<void>
  clearCart: () => Promise<void>
}

export const CartContext = createContext<CartContextValue | null>(null)
