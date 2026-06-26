import { apiFetch, parseApiResponse } from '../shared/api/springApiClient'

export type VirtualChatSession = {
  sessionId: number
  guideId: number
  title: string | null
  sourceScreen: string | null
  startedAt: string
  endedAt: string | null
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
