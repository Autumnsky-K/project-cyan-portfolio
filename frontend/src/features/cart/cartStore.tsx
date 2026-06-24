import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  addCartItem as addRemoteCartItem,
  clearCart as clearRemoteCart,
  fetchCart,
  removeCartItem as removeRemoteCartItem,
  updateCartItemQuantity as updateRemoteCartItemQuantity,
  type CartApiItem,
  type CartApiResponse,
} from '../../api/cart'
import { supabase } from '../../api/supabaseClient'
import { hasSpringApiSession } from '../../shared/api/springApiClient'
import { CartContext, type CartContextValue, type CartGoodsInput, type CartItem } from './cartContext'
import { requestCartLogin } from './requestCartLogin'
import { useCartAuthSession } from './useCartAuthSession'

type CartProviderProps = {
  children: ReactNode
}

function toCartItem(item: CartApiItem): CartItem {
  return {
    cartItemId: item.cartItemId,
    cartItemKey: String(item.cartItemId),
    goodsId: item.goodsId,
    variantId: null,
    variantLabel: '',
    name: item.name ?? `Goods #${item.goodsId}`,
    price: Number(item.price ?? 0),
    imageUrl: item.imageUrl ?? null,
    artistName: item.artistName ?? 'SM Artist',
    categoryName: item.categoryName ?? 'Goods',
    tags: item.tags ?? [],
    quantity: Number(item.quantity ?? 0),
    maxQuantity: item.stockCount == null ? null : Math.max(0, Number(item.stockCount)),
    shippingFee: 0,
    purchaseState: item.purchaseState ?? null,
    purchaseMessage: item.purchaseMessage ?? null,
  }
}

function toCartItems(cart: CartApiResponse): CartItem[] {
  return (cart.items ?? []).map(toCartItem)
}

function getCartErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

export function CartProvider({ children }: CartProviderProps) {
  const navigate = useNavigate()
  const { authLoading, authUserId, isAuthenticated } = useCartAuthSession()
  const [items, setItems] = useState<CartItem[]>([])
  const [status, setStatus] = useState<CartContextValue['status']>('idle')
  const [error, setError] = useState('')
  const [isSignedIn, setIsSignedIn] = useState(false)

  const refreshCart = useCallback(async () => {
    if (!(await hasSpringApiSession())) {
      setItems([])
      setStatus('signedOut')
      setError('')
      setIsSignedIn(false)
      return
    }

    setStatus((currentStatus) => (currentStatus === 'data' ? currentStatus : 'loading'))
    setError('')
    setIsSignedIn(true)

    try {
      const cart = await fetchCart()
      setItems(toCartItems(cart))
      setStatus('data')
    } catch (cartError) {
      setError(getCartErrorMessage(cartError, 'Failed to load cart.'))
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void refreshCart()
    }, 0)

    return () => window.clearTimeout(timerId)
  }, [refreshCart])

  useEffect(() => {
    if (!supabase) {
      return undefined
    }

    const { data } = supabase.auth.onAuthStateChange(() => {
      void refreshCart()
    })

    return () => data.subscription.unsubscribe()
  }, [refreshCart])

  const requireSignedIn = useCallback(async () => {
    if (await hasSpringApiSession()) {
      setIsSignedIn(true)
      return
    }

    setIsSignedIn(false)
    setStatus('signedOut')
    setError('Login required.')
    requestCartLogin(navigate)
    throw new Error('Login required.')
  }, [navigate])

  const addCartItem = useCallback(async (goods: CartGoodsInput, quantity = 1) => {
    await requireSignedIn()
    setError('')

    try {
      const cart = await addRemoteCartItem(goods.goodsId, Math.max(1, quantity))
      setItems(toCartItems(cart))
      setStatus('data')
    } catch (cartError) {
      setError(getCartErrorMessage(cartError, 'Failed to add cart item.'))
      setStatus('error')
      throw cartError
    }
  }, [requireSignedIn])

  const updateCartItemQuantity = useCallback(async (cartItemKey: CartItem['cartItemKey'], quantity: number) => {
    await requireSignedIn()
    setError('')

    if (quantity <= 0) {
      try {
        await removeRemoteCartItem(cartItemKey)
        await refreshCart()
      } catch (cartError) {
        setError(getCartErrorMessage(cartError, 'Failed to remove cart item.'))
        setStatus('error')
        throw cartError
      }
      return
    }

    try {
      const cart = await updateRemoteCartItemQuantity(cartItemKey, quantity)
      setItems(toCartItems(cart))
      setStatus('data')
    } catch (cartError) {
      setError(getCartErrorMessage(cartError, 'Failed to update cart item.'))
      setStatus('error')
      throw cartError
    }
  }, [refreshCart, requireSignedIn])

  const removeCartItem = useCallback(async (cartItemKey: CartItem['cartItemKey']) => {
    await requireSignedIn()
    setError('')

    try {
      await removeRemoteCartItem(cartItemKey)
      await refreshCart()
    } catch (cartError) {
      setError(getCartErrorMessage(cartError, 'Failed to remove cart item.'))
      setStatus('error')
      throw cartError
    }
  }, [refreshCart, requireSignedIn])

  const clearCart = useCallback(async () => {
    await requireSignedIn()
    setError('')

    try {
      await clearRemoteCart()
      setItems([])
      setStatus('data')
    } catch (cartError) {
      setError(getCartErrorMessage(cartError, 'Failed to clear cart.'))
      setStatus('error')
      throw cartError
    }
  }, [requireSignedIn])

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      status,
      error,
      isSignedIn,
      authLoading,
      isAuthenticated,
      authUserId,
      refreshCart,
      addCartItem,
      updateCartItemQuantity,
      removeCartItem,
      clearCart,
    }),
    [
      addCartItem,
      authLoading,
      authUserId,
      clearCart,
      error,
      isAuthenticated,
      isSignedIn,
      items,
      refreshCart,
      removeCartItem,
      status,
      updateCartItemQuantity,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
