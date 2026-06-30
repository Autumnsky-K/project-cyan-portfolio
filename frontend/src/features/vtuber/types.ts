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
  renderMode?: 'live2d' | 'three3d'
  threeModelUrl?: string
  threeTextureUrl?: string
}

export type VtuberClientTextInputMessage = {
  type: 'text-input'
  text: string
  sessionId?: number
  context?: {
    cartItems?: VtuberClientCartItem[]
  }
}

export type VtuberClientAuthMessage = {
  type: 'auth'
  accessToken: string
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

export type VtuberRecommendationMetadata = {
  goodsId: string | number
  recommendationReason?: string | null
  rankOrder?: number
}

export type VtuberAuthReason =
  | 'accountPersonalization'
  | 'chatHistory'
  | 'persistence'
  | 'guestLimit'

export type VtuberServerMetadata = {
  recommendations?: VtuberRecommendationMetadata[]
  authRequired?: boolean
  authReason?: VtuberAuthReason
  loginPath?: '/login'
  [key: string]: unknown
}

export type VtuberServerMessage = {
  type: string
  text: string
  actions: VtuberAction[]
  metadata?: VtuberServerMetadata
}
