import { apiFetch, parseApiResponse } from '../shared/api/springApiClient'
import { type VtuberAction } from '../features/vtuber/types'

export type VirtualChatSession = {
  sessionId: number
  guideId: number
  title: string | null
  sourceScreen: string | null
  startedAt: string
  endedAt: string | null
}

export type VirtualChatSpeaker = 'USER' | 'ASSISTANT' | 'SYSTEM'

export type VirtualRecommendationInput = {
  goodsId: number
  requestText?: string | null
  recommendationReason?: string | null
  rankOrder?: number
}

export type VirtualChatMessageInput = {
  speaker: VirtualChatSpeaker
  messageText: string
  action?: string | null
  actions?: VtuberAction[] | null
  metadata?: Record<string, unknown> | null
  recommendations?: VirtualRecommendationInput[]
}

export type VirtualChatMessage = {
  messageId: number
  sessionId: number
  speaker: VirtualChatSpeaker
  messageText: string
  action: string | null
  actions: VtuberAction[]
  metadata: Record<string, unknown>
  createdAt: string
}

export async function createVirtualChatSession(
  input: {
    guideId?: number
    title?: string
    sourceScreen?: string
  } = {},
): Promise<VirtualChatSession> {
  const response = await apiFetch('/virtual-chat/sessions', {
    method: 'POST',
    body: JSON.stringify(input),
  })

  return await parseApiResponse<VirtualChatSession>(
    response,
    'Failed to create chat session.',
  ) as VirtualChatSession
}

export async function createVirtualChatMessage(
  sessionId: number,
  input: VirtualChatMessageInput,
): Promise<VirtualChatMessage> {
  const response = await apiFetch(`/virtual-chat/sessions/${sessionId}/messages`, {
    method: 'POST',
    body: JSON.stringify(input),
  })

  return await parseApiResponse<VirtualChatMessage>(
    response,
    'Failed to save chat message.',
  ) as VirtualChatMessage
}
