import { useEffect, useRef } from 'react'
import './AccountFeedbackPopup.css'

function AccountFeedbackPopup({
  message,
  onDone,
  type = 'error',
  duration = 2000,
}) {
  const onDoneRef = useRef(onDone)

  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  useEffect(() => {
    if (!message) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      onDoneRef.current?.()
    }, duration)

    return () => window.clearTimeout(timeoutId)
  }, [duration, message])

  if (!message) {
    return null
  }

  const isSuccess = type === 'success'

  return (
    <div className="account-feedback-popup-backdrop">
      <div
        className={`account-feedback-popup-dialog ${isSuccess ? 'is-success' : 'is-error'}`}
        role={isSuccess ? 'status' : 'alert'}
      >
        {message}
      </div>
    </div>
  )
}

export default AccountFeedbackPopup
