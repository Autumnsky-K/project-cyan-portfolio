import { type FormEvent, type ReactElement, useState } from 'react'

import './VtuberChatbot.css'

type VtuberChatbotProps = {
  actionsCount: number
  bubbleText: string
  isSendDisabled: boolean
  onSendMessage: (message: string) => boolean
  statusLabel: string
}

function VtuberChatbotShell({
  actionsCount,
  bubbleText,
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
    <aside id="vtuber" className="vtuber-chatbot" aria-label="Live2D chatbot">
      <div className="vtuber-stage" aria-label="Live2D character placeholder">
        <div className="vtuber-avatar" aria-hidden="true">
          <span className="vtuber-avatar-face" />
        </div>
        <span className="vtuber-status">{statusLabel}</span>
      </div>

      <section className="vtuber-panel" aria-label="Chatbot conversation">
        <div className="vtuber-bubble" aria-live="polite">
          <strong>Cyan Assistant</strong>
          <p>{bubbleText}</p>
          <span className="vtuber-sr-only" aria-live="polite">
            Prepared actions: {actionsCount}
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
