import { type NavigateFunction } from 'react-router-dom'

import { fetchGoodsDetail } from '../../../api/goods'
import {
  type AddToCartAction,
  type HighlightAction,
  type NavigateAction,
  type VtuberAction,
} from '../types'

const HIGHLIGHT_CLASS_NAME = 'vtuber-action-highlight'
const HIGHLIGHT_DURATION_MS = 2200
const ROUTE_SETTLE_DELAY_MS = 160

type CartGoods = {
  goodsId: string | number
  name?: string
  price?: number
  imageUrl?: string | null
  artistName?: string
  categoryName?: string
  tags?: string[]
}

type ExecuteVtuberActionsOptions = {
  addCartItem: (goods: CartGoods, quantity?: number) => void
  actions: VtuberAction[]
  navigate: NavigateFunction
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isNavigateAction(action: VtuberAction): action is NavigateAction {
  return (
    action.type === 'navigate' &&
    typeof action.path === 'string' &&
    action.path.startsWith('/') &&
    !action.path.startsWith('//')
  )
}

function isHighlightAction(action: VtuberAction): action is HighlightAction {
  return action.type === 'highlight' && typeof action.selector === 'string' && action.selector.trim().length > 0
}

function isAddToCartAction(action: VtuberAction): action is AddToCartAction {
  return action.type === 'addToCart' && typeof action.goodsId === 'string' && action.goodsId.trim().length > 0
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function findAddToCartButton(goodsId: string): HTMLButtonElement | null {
  const buttons = document.querySelectorAll<HTMLButtonElement>('[data-add-to-cart]')

  for (const button of buttons) {
    if (button.getAttribute('data-add-to-cart') === goodsId) {
      return button
    }
  }

  return null
}

function highlightElement(selector: string): void {
  let target: Element | null = null

  try {
    target = document.querySelector(selector)
  } catch {
    return
  }

  if (!(target instanceof HTMLElement)) {
    return
  }

  target.classList.add(HIGHLIGHT_CLASS_NAME)
  target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })

  window.setTimeout(() => {
    target.classList.remove(HIGHLIGHT_CLASS_NAME)
  }, HIGHLIGHT_DURATION_MS)
}

async function addToCart(action: AddToCartAction, addCartItem: ExecuteVtuberActionsOptions['addCartItem']) {
  const goodsId = action.goodsId.trim()
  const button = findAddToCartButton(goodsId)

  if (button && !button.disabled) {
    button.click()
    return
  }

  try {
    const goods = await fetchGoodsDetail(goodsId)

    if (isRecord(goods) && (typeof goods.goodsId === 'string' || typeof goods.goodsId === 'number')) {
      addCartItem(goods as CartGoods)
    }
  } catch {
    return
  }
}

export async function executeVtuberActions({
  actions,
  addCartItem,
  navigate,
}: ExecuteVtuberActionsOptions): Promise<void> {
  for (const action of actions) {
    if (isNavigateAction(action)) {
      navigate(action.path)
      await delay(ROUTE_SETTLE_DELAY_MS)
      continue
    }

    if (isHighlightAction(action)) {
      highlightElement(action.selector)
      continue
    }

    if (isAddToCartAction(action)) {
      await addToCart(action, addCartItem)
    }
  }
}
