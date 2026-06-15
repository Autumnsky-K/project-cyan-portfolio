import { type FormEvent, type ReactElement, useState } from 'react'

import './VtuberChatbot.css'

function VtuberChatbot(): ReactElement {
  const [message, setMessage] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
  }

  return (
    <aside id="vtuber" className="vtuber-chatbot" aria-label="Live2D chatbot">
      <div className="vtuber-stage" aria-label="Live2D character placeholder">
        <div className="vtuber-avatar" aria-hidden="true">
          <span className="vtuber-avatar-face" />
        </div>
        <span className="vtuber-status">Standby</span>
      </div>

      <section className="vtuber-panel" aria-label="Chatbot conversation">
        <div className="vtuber-bubble" aria-live="polite">
          <strong>Cyan Assistant</strong>
          <p>필요한 굿즈를 찾을 때 여기에서 도와드릴게요.</p>
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
          <button type="submit" disabled aria-label="Send message">
            Send
          </button>
        </form>
      </section>
    </aside>
  )
}

export default VtuberChatbot
