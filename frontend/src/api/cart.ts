import { apiFetch, parseApiResponse } from '../shared/api/springApiClient'

export type CartApiItem = {
  cartItemId: number
  goodsId: number
  name: string
  price: number
  imageUrl: string | null
  tags: string[]
  artistId?: number | null
  artistName?: string | null
  categoryId?: number | null
  categoryName?: string | null
  salesStatus?: string | null
  stockCount?: number | null
  quantity: number
  subtotal: number
  purchaseState?: string | null
  purchaseMessage?: string | null
}

export type CartApiResponse = {
  cartId: number | null
  items: CartApiItem[]
  totalQuantity: number
  totalPrice: number
}

export async function fetchCart(): Promise<CartApiResponse> {
  const response = await apiFetch('/cart')
  return await parseApiResponse<CartApiResponse>(response, '카트를 불러오지 못했습니다.') ?? {
    cartId: null,
    items: [],
    totalQuantity: 0,
    totalPrice: 0,
  }
}

export async function addCartItem(goodsId: string | number, quantity = 1): Promise<CartApiResponse> {
  const response = await apiFetch('/cart/items', {
    method: 'POST',
    body: JSON.stringify({
      goodsId: Number(goodsId),
      quantity,
    }),
  })

  return await parseApiResponse<CartApiResponse>(response, '상품을 카트에 담지 못했습니다.') ?? {
    cartId: null,
    items: [],
    totalQuantity: 0,
    totalPrice: 0,
  }
}

export async function updateCartItemQuantity(
  cartItemId: string | number,
  quantity: number,
): Promise<CartApiResponse> {
  const response = await apiFetch(`/cart/items/${cartItemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  })

  return await parseApiResponse<CartApiResponse>(response, '카트 상품 수량을 변경하지 못했습니다.') ?? {
    cartId: null,
    items: [],
    totalQuantity: 0,
    totalPrice: 0,
  }
}

export async function removeCartItem(cartItemId: string | number): Promise<void> {
  const response = await apiFetch(`/cart/items/${cartItemId}`, { method: 'DELETE' })
  await parseApiResponse(response, '카트 상품을 삭제하지 못했습니다.')
}

export async function clearCart(): Promise<void> {
  const response = await apiFetch('/cart/items', { method: 'DELETE' })
  await parseApiResponse(response, '카트를 비우지 못했습니다.')
}
