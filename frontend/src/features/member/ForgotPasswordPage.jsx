import { useState } from 'react'
import { Link } from 'react-router-dom'
import { sendPasswordResetEmail } from './member'
import AccountFeedbackPopup from './AccountFeedbackPopup'
import './AccountPages.css'

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')
    setIsLoading(true)

    try {
      await sendPasswordResetEmail(email)
      setMessage('비밀번호 수정 가능한 링크가 발송되었습니다.')
    } catch (resetError) {
      setError(resetError.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="account-page account-auth-page">
      <AccountFeedbackPopup message={error} onDone={() => setError('')} />
      <AccountFeedbackPopup
        message={message}
        type="success"
        onDone={() => setMessage('')}
      />

      <div className="account-shell account-auth-shell">
        <section className="account-card account-panel" aria-label="비밀번호 찾기">
          <div className="account-heading">
            <h1>비밀번호 찾기</h1>
          </div>

          <form className="account-form" onSubmit={handleSubmit}>
            <label className="account-field">
              <span>이메일</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="email@example.com"
                autoComplete="email"
                required
              />
            </label>

            <button className="account-button" type="submit" disabled={isLoading}>
              {isLoading ? '메일 발송 중...' : '재설정 링크 받기'}
            </button>
          </form>

          <nav className="account-card-links" aria-label="계정 이동">
            <p>
              이미 계정이 있으신가요? <Link to="/login">로그인하기</Link>
            </p>
            <p>
              아직 계정이 없으신가요? <Link to="/signup">회원가입하기</Link>
            </p>
          </nav>
        </section>
      </div>
    </main>
  )
}

export default ForgotPasswordPage
