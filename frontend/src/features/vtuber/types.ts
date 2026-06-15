export type VtuberConnectionStatus = 'idle' | 'connecting' | 'open' | 'closed' | 'error'

export type VtuberClientTextInputMessage = {
  type: 'text-input'
  text: string
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
