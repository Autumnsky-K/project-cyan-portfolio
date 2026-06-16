import {
  type VtuberConnectionStatus,
  type VtuberDisplayState,
} from './types'

type DeriveVtuberDisplayStateOptions = {
  connectionStatus: VtuberConnectionStatus
  isAwaitingResponse: boolean
  isSpeaking: boolean
}

export const VTUBER_DISPLAY_STATE_LABELS: Record<VtuberDisplayState, string> = {
  idle: '대기',
  connecting: '연결 중',
  ready: '준비됨',
  thinking: '생각 중',
  speaking: '응답 중',
  error: '연결 대기',
}

export function deriveVtuberDisplayState({
  connectionStatus,
  isAwaitingResponse,
  isSpeaking,
}: DeriveVtuberDisplayStateOptions): VtuberDisplayState {
  if (connectionStatus === 'idle') {
    return 'idle'
  }

  if (connectionStatus === 'connecting') {
    return 'connecting'
  }

  if (connectionStatus === 'closed' || connectionStatus === 'error') {
    return 'error'
  }

  if (isAwaitingResponse) {
    return 'thinking'
  }

  if (isSpeaking) {
    return 'speaking'
  }

  return 'ready'
}
