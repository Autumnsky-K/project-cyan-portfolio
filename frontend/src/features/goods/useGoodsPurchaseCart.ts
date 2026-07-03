import { useEffect, useRef, useState } from 'react'
import type { GoodsDetail } from '../../api/goods'
import { useCart } from '../cart/useCart'

export function useGoodsPurchaseCart(goods: GoodsDetail) {
  const { addCartItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [feedback, setFeedback] = useState('')
  const [isAddingCart, setIsAddingCart] = useState(false)
  const feedbackTimerRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (feedbackTimerRef.current !== null) window.clearTimeout(feedbackTimerRef.current)
    },
    [],
  )

  const maxQuantity = goods.stockCount ?? 0
  const isDigitalGoods = goods.fulfillmentType === 'DIGITAL'
  const purchaseLimit = isDigitalGoods ? 1 : maxQuantity
  const selectedQuantity = Math.max(1, Math.min(quantity, purchaseLimit || 1))
  const purchasingAvailable = goods.purchaseState === 'AVAILABLE'
  const canAdd = purchasingAvailable && (isDigitalGoods || purchaseLimit > 0)
  const unitPrice = Number(goods.price ?? 0)

  function showFeedback(message: string) {
    setFeedback(message)
    if (feedbackTimerRef.current !== null) window.clearTimeout(feedbackTimerRef.current)
    feedbackTimerRef.current = window.setTimeout(() => setFeedback(''), 1800)
  }

  function updateQuantity(nextQuantity: number) {
    if (!Number.isFinite(nextQuantity)) return
    setQuantity(Math.max(1, Math.min(Math.trunc(nextQuantity), purchaseLimit || 1)))
  }

  async function addSelectedQuantityToCart() {
    if (!canAdd) return

    setIsAddingCart(true)
    try {
      await addCartItem(
        {
          ...goods,
          variantPrice: unitPrice,
          maxQuantity: purchaseLimit,
          fulfillmentType: goods.fulfillmentType,
          shippingFee: 0,
        },
        selectedQuantity,
      )
      showFeedback('장바구니에 담았습니다.')
    } catch (cartError) {
      showFeedback(cartError instanceof Error ? cartError.message : '장바구니에 담지 못했습니다.')
    } finally {
      setIsAddingCart(false)
    }
  }

  return {
    addSelectedQuantityToCart,
    canAdd,
    feedback,
    isAddingCart,
    maxQuantity: purchaseLimit,
    selectedQuantity,
    unitPrice,
    updateQuantity,
  }
}
