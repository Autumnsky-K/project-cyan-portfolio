import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  addCartItem as addRemoteCartItem,
  clearCart as clearRemoteCart,
  removeCartItem as removeRemoteCartItem,
  updateCartItemQuantity as updateRemoteCartItemQuantity,
  type CartApiItem,
  type CartApiResponse,
} from '../../api/cart'
import { supabase } from '../../api/supabaseClient'
import { hasSpringApiSession } from '../../shared/api/springApiClient'
import { CartContext, type CartContextValue, type CartGoodsInput, type CartItem } from './cartContext'
import {
  addGuestCartItem,
  clearGuestCartItems,
  readGuestCartItems,
  removeGuestCartItem,
  saveGuestCartItems,
  updateGuestCartItemQuantity,
} from './guestCartStorage'
import { useCartAuthSession } from './useCartAuthSession'
import { mergeGuestCart, type GuestCartMergeResult } from './mergeGuestCart'

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
  const { authLoading, authUserId, isAuthenticated } = useCartAuthSession()
  const [items, setItems] = useState<CartItem[]>([])
  const [status, setStatus] = useState<CartContextValue['status']>('idle')
  const [error, setError] = useState('')
  const [isSignedIn, setIsSignedIn] = useState(false)
  const guestCartMergeRef = useRef<Promise<GuestCartMergeResult> | null>(null)

  const mergeGuestCartIntoRemoteCart = useCallback(async () => {
    if (guestCartMergeRef.current) {
      return guestCartMergeRef.current
    }

    const mergePromise = mergeGuestCart()

    guestCartMergeRef.current = mergePromise

    try {
      return await mergePromise
    } finally {
      guestCartMergeRef.current = null
    }
  }, [])

  const refreshCart = useCallback(async () => {
    if (!(await hasSpringApiSession())) {
      setItems(readGuestCartItems())
      setStatus('data')
      setError('')
      setIsSignedIn(false)
      return
    }

    setStatus((currentStatus) => (currentStatus === 'data' ? currentStatus : 'loading'))
    setError('')
    setIsSignedIn(true)

    try {
      const result = await mergeGuestCartIntoRemoteCart()
      setItems(toCartItems(result.cart))
      if (result.failedItems.length > 0) {
        setError('일부 비회원 카트 상품을 옮기지 못했습니다. 다시 로그인하면 재시도합니다.')
        setStatus('error')
      } else {
        setStatus('data')
      }
    } catch (cartError) {
      setError(getCartErrorMessage(cartError, '카트를 불러오지 못했습니다.'))
      setStatus('error')
    }
  }, [mergeGuestCartIntoRemoteCart])

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

  const addCartItem = useCallback(async (goods: CartGoodsInput, quantity = 1) => {
    setError('')

    if (!(await hasSpringApiSession())) {
      setIsSignedIn(false)
      setStatus('data')
      setItems((currentItems) => {
        const nextItems = addGuestCartItem(currentItems, goods, Math.max(1, quantity))
        saveGuestCartItems(nextItems)
        return nextItems
      })
      return
    }

    setIsSignedIn(true)

    try {
      const cart = await addRemoteCartItem(goods.goodsId, Math.max(1, quantity))
      setItems(toCartItems(cart))
      setStatus('data')
    } catch (cartError) {
      setError(getCartErrorMessage(cartError, '상품을 카트에 담지 못했습니다.'))
      setStatus('error')
      throw cartError
    }
  }, [])

  const updateCartItemQuantity = useCallback(async (cartItemKey: CartItem['cartItemKey'], quantity: number) => {
    setError('')

    if (!(await hasSpringApiSession())) {
      setIsSignedIn(false)
      setStatus('data')
      setItems((currentItems) => {
        const nextItems = updateGuestCartItemQuantity(currentItems, cartItemKey, quantity)
        saveGuestCartItems(nextItems)
        return nextItems
      })
      return
    }

    setIsSignedIn(true)

    if (quantity <= 0) {
      try {
        await removeRemoteCartItem(cartItemKey)
        await refreshCart()
      } catch (cartError) {
        setError(getCartErrorMessage(cartError, '카트 상품을 삭제하지 못했습니다.'))
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
      setError(getCartErrorMessage(cartError, '카트 상품 수량을 변경하지 못했습니다.'))
      setStatus('error')
      throw cartError
    }
  }, [refreshCart])

  const removeCartItem = useCallback(async (cartItemKey: CartItem['cartItemKey']) => {
    setError('')

    if (!(await hasSpringApiSession())) {
      setIsSignedIn(false)
      setStatus('data')
      setItems((currentItems) => {
        const nextItems = removeGuestCartItem(currentItems, cartItemKey)
        saveGuestCartItems(nextItems)
        return nextItems
      })
      return
    }

    setIsSignedIn(true)

    try {
      await removeRemoteCartItem(cartItemKey)
      await refreshCart()
    } catch (cartError) {
      setError(getCartErrorMessage(cartError, '카트 상품을 삭제하지 못했습니다.'))
      setStatus('error')
      throw cartError
    }
  }, [refreshCart])

  const clearCart = useCallback(async () => {
    setError('')

    if (!(await hasSpringApiSession())) {
      setIsSignedIn(false)
      setStatus('data')
      setItems(clearGuestCartItems())
      return
    }

    setIsSignedIn(true)

    try {
      await clearRemoteCart()
      setItems([])
      setStatus('data')
    } catch (cartError) {
      setError(getCartErrorMessage(cartError, '카트를 비우지 못했습니다.'))
      setStatus('error')
      throw cartError
    }
  }, [])

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
