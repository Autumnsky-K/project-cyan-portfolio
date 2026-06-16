import { type FormEvent, type ReactElement, useState } from 'react'

import {
  type VtuberCharacterConfig,
  type VtuberDisplayState,
} from '../../features/vtuber/types'
import './VtuberChatbot.css'

type VtuberChatbotProps = {
  actionsCount: number
  bubbleText: string
  character: VtuberCharacterConfig
  displayState: VtuberDisplayState
  isSendDisabled: boolean
  onSendMessage: (message: string) => boolean
  statusLabel: string
}

function VtuberChatbotShell({
  actionsCount,
  bubbleText,
  character,
  displayState,
  isSendDisabled,
  onSendMessage,
  statusLabel,
}: VtuberChatbotProps): ReactElement {
  const [message, setMessage] = useState('')
  const trimmedMessage = message.trim()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (onSendMessage(trimmedMessage)) {
      setMessage('')
    }
  }

  return (
    <aside
      id="vtuber"
      className="vtuber-chatbot"
      aria-label="Live2D chatbot"
      data-character-id={character.id}
      data-display-state={displayState}
      data-model-url={character.modelUrl}
    >
      <div
        className="vtuber-stage"
        aria-label={`${character.name} Live2D character placeholder`}
      >
        <div className="vtuber-avatar" data-display-state={displayState} aria-hidden="true">
          <span className="vtuber-avatar-face" />
          {displayState === 'thinking' ? (
            <span className="vtuber-thinking-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          ) : null}
        </div>
        <span className="vtuber-status">{statusLabel}</span>
      </div>

      <section className="vtuber-panel" aria-label="Chatbot conversation">
        <div className="vtuber-bubble" data-display-state={displayState} aria-live="polite">
          <strong>{character.name}</strong>
          <p>{bubbleText}</p>
          <span className="vtuber-sr-only" aria-live="polite">
            Display state: {statusLabel}. Prepared actions: {actionsCount}.
          </span>
        </div>

        <form className="vtuber-form" onSubmit={handleSubmit}>
          <label className="vtuber-sr-only" htmlFor="vtuber-message">
            Chat message
          </label>
          <input
            id="vtuber-message"
            type="text"
            value={message}
            placeholder="굿즈를 물어보세요"
            autoComplete="off"
            disabled={isSendDisabled}
            onChange={(event) => setMessage(event.target.value)}
          />
          <button
            type="submit"
            disabled={isSendDisabled || trimmedMessage.length === 0}
            aria-label="Send message"
          >
            Send
          </button>
        </form>
      </section>
    </aside>
  )
}

export default VtuberChatbotShell
