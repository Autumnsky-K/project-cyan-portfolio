export type VtuberConnectionStatus = 'idle' | 'connecting' | 'open' | 'closed' | 'error'

export type VtuberDisplayState =
  | 'idle'
  | 'connecting'
  | 'ready'
  | 'thinking'
  | 'speaking'
  | 'error'

export type VtuberCharacterConfig = {
  id: string
  name: string
  modelUrl: string
}

export type VtuberClientTextInputMessage = {
  type: 'text-input'
  text: string
  context?: {
    cartItems?: VtuberClientCartItem[]
  }
}

export type VtuberClientCartItem = {
  goodsId: string | number
  name: string
  quantity: number
  tags: string[]
  artistName: string
  categoryName: string
}

export type NavigateAction = {
  type: 'navigate'
  path: string
}

export type HighlightAction = {
  type: 'highlight'
  selector: string
}

export type AddToCartAction = {
  type: 'addToCart'
  goodsId: string
}

export type UnknownVtuberAction = {
  type: string
  [key: string]: unknown
}

export type VtuberAction =
  | NavigateAction
  | HighlightAction
  | AddToCartAction
  | UnknownVtuberAction

export type VtuberServerMessage = {
  type: string
  text: string
  actions: VtuberAction[]
}
