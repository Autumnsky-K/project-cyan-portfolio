import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
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

const CART_STORAGE_KEY = 'project-cyan-cart'
const LOCAL_CART_ITEM_ID = 0
const LOCAL_CART_KEY_PREFIX = 'local:'

type CartProviderProps = {
  children: ReactNode
}

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
    typeof item.shippingFee === 'number' &&
    (
      item.cartIssue === undefined ||
      item.cartIssue === null ||
      (
        typeof item.cartIssue === 'object' &&
        typeof item.cartIssue.code === 'string' &&
        typeof item.cartIssue.message === 'string'
      )
    )
  )
}

function readLocalCartItems(): CartItem[] {
  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY)
    const parsed: unknown = stored ? JSON.parse(stored) : []
    return Array.isArray(parsed) ? parsed.filter(isCartItem) : []
  } catch {
    return []
  }
}

function writeLocalCartItems(items: CartItem[]) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
}

function normalizeLocalCartItem(goods: CartGoodsInput, quantity = 1): CartItem {
  const variantId = goods.variantId ?? null
  const maxQuantity = goods.maxQuantity == null ? null : Math.max(0, Number(goods.maxQuantity))
  const normalizedQuantity = Math.max(1, Math.min(quantity, maxQuantity ?? 99))

  return {
    cartItemId: LOCAL_CART_ITEM_ID,
    cartItemKey: `local:${goods.goodsId}:${variantId ?? 'default'}`,
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
    purchaseState: 'LOCAL',
    purchaseMessage: null,
    cartIssue: null,
  }
}

function addLocalCartItem(currentItems: CartItem[], goods: CartGoodsInput, quantity = 1): CartItem[] {
  const nextItem = normalizeLocalCartItem(goods, quantity)
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
}

function updateLocalCartItemQuantity(currentItems: CartItem[], cartItemKey: string, quantity: number): CartItem[] {
  return currentItems
    .map((item) =>
      item.cartItemKey === cartItemKey
        ? { ...item, quantity: Math.min(quantity, item.maxQuantity ?? 99) }
        : item,
    )
    .filter((item) => item.quantity > 0)
}

function removeLocalCartItem(currentItems: CartItem[], cartItemKey: string): CartItem[] {
  return currentItems.filter((item) => item.cartItemKey !== cartItemKey)
}

function isLocalCartItem(item: CartItem): boolean {
  return item.cartItemKey.startsWith(LOCAL_CART_KEY_PREFIX)
}

function withCartIssue(item: CartItem, error: unknown): CartItem {
  return {
    ...item,
    cartIssue: {
      code: 'MERGE_FAILED',
      message: getCartErrorMessage(error, '장바구니에 담을 수 없습니다. 수량을 수정하거나 삭제해 주세요.'),
    },
  }
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
    cartIssue: null,
  }
}

function toCartItems(cart: CartApiResponse): CartItem[] {
  return (cart.items ?? []).map(toCartItem)
}

function getCartErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([])
  const [status, setStatus] = useState<CartContextValue['status']>('idle')
  const [error, setError] = useState('')
  const [isSignedIn, setIsSignedIn] = useState(false)

  const replaceLocalItems = useCallback((nextItems: CartItem[]) => {
    writeLocalCartItems(nextItems)
    setItems(nextItems)
    setStatus('data')
    setError('')
    setIsSignedIn(false)
  }, [])

  const mergeLocalCartToServer = useCallback(async (): Promise<CartItem[]> => {
    const localItems = readLocalCartItems()
    let latestCart: CartApiResponse | null = null
    const failedItems: CartItem[] = []

    for (const item of localItems) {
      try {
        latestCart = await addRemoteCartItem(item.goodsId, Math.max(1, item.quantity))
      } catch (cartError) {
        failedItems.push(withCartIssue(item, cartError))
      }
    }

    writeLocalCartItems(failedItems)

    const serverCart = latestCart ?? await fetchCart()
    return [...toCartItems(serverCart), ...failedItems]
  }, [])

  const refreshCart = useCallback(async () => {
    if (!(await hasSpringApiSession())) {
      setItems(readLocalCartItems())
      setStatus('data')
      setError('')
      setIsSignedIn(false)
      return
    }

    setStatus((currentStatus) => (currentStatus === 'data' ? currentStatus : 'loading'))
    setError('')
    setIsSignedIn(true)

    try {
      setItems(await mergeLocalCartToServer())
      setStatus('data')
    } catch (cartError) {
      setError(getCartErrorMessage(cartError, 'Failed to load cart.'))
      setStatus('error')
    }
  }, [mergeLocalCartToServer])

  useEffect(() => {
    void refreshCart()
  }, [refreshCart])

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === CART_STORAGE_KEY && !isSignedIn) {
        setItems(readLocalCartItems())
        setStatus('data')
        setError('')
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [isSignedIn])

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
    if (!(await hasSpringApiSession())) {
      const nextItems = addLocalCartItem(readLocalCartItems(), goods, Math.max(1, quantity))
      replaceLocalItems(nextItems)
      return
    }

    setError('')
    setIsSignedIn(true)

    try {
      const cart = await addRemoteCartItem(goods.goodsId, Math.max(1, quantity))
      setItems([...toCartItems(cart), ...readLocalCartItems()])
      setStatus('data')
    } catch (cartError) {
      setError(getCartErrorMessage(cartError, 'Failed to add cart item.'))
      setStatus('error')
      throw cartError
    }
  }, [replaceLocalItems])

  const updateCartItemQuantity = useCallback(async (cartItemKey: CartItem['cartItemKey'], quantity: number) => {
    if (!(await hasSpringApiSession())) {
      const nextItems = updateLocalCartItemQuantity(readLocalCartItems(), cartItemKey, quantity)
      replaceLocalItems(nextItems)
      return
    }

    setError('')
    setIsSignedIn(true)

    if (String(cartItemKey).startsWith(LOCAL_CART_KEY_PREFIX)) {
      const localItems = readLocalCartItems()
      const targetItem = localItems.find((item) => item.cartItemKey === cartItemKey)

      if (!targetItem) {
        await refreshCart()
        return
      }

      if (quantity <= 0) {
        writeLocalCartItems(removeLocalCartItem(localItems, cartItemKey))
        await refreshCart()
        return
      }

      try {
        const cart = await addRemoteCartItem(targetItem.goodsId, Math.max(1, quantity))
        const nextLocalItems = removeLocalCartItem(localItems, cartItemKey)
        writeLocalCartItems(nextLocalItems)
        setItems([...toCartItems(cart), ...nextLocalItems])
        setStatus('data')
      } catch (cartError) {
        const nextLocalItems = localItems.map((item) =>
          item.cartItemKey === cartItemKey
            ? withCartIssue({ ...item, quantity: Math.max(1, quantity) }, cartError)
            : item,
        )
        writeLocalCartItems(nextLocalItems)
        setItems((currentItems) => [
          ...currentItems.filter((item) => !isLocalCartItem(item)),
          ...nextLocalItems,
        ])
        setStatus('data')
      }
      return
    }

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
  }, [refreshCart, replaceLocalItems])

  const removeCartItem = useCallback(async (cartItemKey: CartItem['cartItemKey']) => {
    if (!(await hasSpringApiSession())) {
      const nextItems = removeLocalCartItem(readLocalCartItems(), cartItemKey)
      replaceLocalItems(nextItems)
      return
    }

    setError('')
    setIsSignedIn(true)

    if (String(cartItemKey).startsWith(LOCAL_CART_KEY_PREFIX)) {
      writeLocalCartItems(removeLocalCartItem(readLocalCartItems(), cartItemKey))
      await refreshCart()
      return
    }

    try {
      await removeRemoteCartItem(cartItemKey)
      await refreshCart()
    } catch (cartError) {
      setError(getCartErrorMessage(cartError, 'Failed to remove cart item.'))
      setStatus('error')
      throw cartError
    }
  }, [refreshCart, replaceLocalItems])

  const clearCart = useCallback(async () => {
    if (!(await hasSpringApiSession())) {
      replaceLocalItems([])
      return
    }

    setError('')
    setIsSignedIn(true)

    try {
      await clearRemoteCart()
      writeLocalCartItems([])
      setItems([])
      setStatus('data')
    } catch (cartError) {
      setError(getCartErrorMessage(cartError, 'Failed to clear cart.'))
      setStatus('error')
      throw cartError
    }
  }, [replaceLocalItems])

  const hasBlockingIssue = useMemo(() => items.some((item) => Boolean(item.cartIssue)), [items])

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      status,
      error,
      isSignedIn,
      hasBlockingIssue,
      refreshCart,
      addCartItem,
      updateCartItemQuantity,
      removeCartItem,
      clearCart,
    }),
    [
      addCartItem,
      clearCart,
      error,
      hasBlockingIssue,
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
