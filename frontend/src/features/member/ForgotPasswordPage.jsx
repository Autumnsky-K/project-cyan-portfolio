import { useState } from 'react'
import { Link } from 'react-router-dom'
import { sendPasswordResetEmail } from './member'
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
      setMessage('비밀번호 재설정 링크를 이메일로 보냈습니다.')
    } catch (resetError) {
      setError(resetError.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="account-page">
      <div className="account-shell">
        <nav className="account-topbar" aria-label="계정 이동">
          <Link to="/login">로그인</Link>
          <Link to="/signup">회원가입</Link>
        </nav>

        <section className="account-card account-panel" aria-label="비밀번호 찾기">
          <div className="account-heading">
            <p>Supabase Auth</p>
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

            {error && (
              <p className="account-feedback account-feedback-error" role="alert">
                {error}
              </p>
            )}

            {message && (
              <p className="account-feedback account-feedback-success" role="status">
                {message}
              </p>
            )}

            <button className="account-button" type="submit" disabled={isLoading}>
              {isLoading ? '메일 발송 중...' : '재설정 링크 받기'}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}

export default ForgotPasswordPage
