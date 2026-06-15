import { useState } from 'react'
import { Link } from 'react-router-dom'
import { loginMember } from './member'
import './LoginPage.css'

function LoginPage() {
  const [form, setForm] = useState({
    loginId: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    setMessage('')
    setError('')

    try {
      const result = await loginMember(form)
      setMessage(`${result.member.loginId} 계정으로 로그인되었습니다.`)
    } catch (loginError) {
      setError(loginError.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-label="로그인">
        <div className="login-header">
          <div className="login-logo" aria-hidden="true"></div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {/* 백엔드 연동 전까지 member.js의 가짜 로그인 API를 호출합니다. */}
          <label className="login-field">
            <span>아이디</span>
            <input
              type="text"
              name="loginId"
              value={form.loginId}
              onChange={handleChange}
              placeholder="아이디를 입력하세요"
              autoComplete="username"
              required
            />
          </label>

          <label className="login-field">
            <span>비밀번호</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="비밀번호를 입력하세요"
              autoComplete="current-password"
              required
            />
          </label>

          {error && (
            <p className="login-feedback login-feedback-error" role="alert">
              {error}
            </p>
          )}

          {message && (
            <p className="login-feedback login-feedback-success" role="status">
              {message}
            </p>
          )}

          <button className="login-submit" type="submit" disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="login-social" aria-label="소셜 로그인">
          <p>소셜 계정으로 로그인</p>
          <div className="login-social-buttons">
            <button
              className="social-button social-button-kakao"
              type="button"
              aria-label="카카오 로그인"
            >
              카
            </button>
            <button
              className="social-button social-button-naver"
              type="button"
              aria-label="네이버 로그인"
            >
              N
            </button>
            <button
              className="social-button social-button-google"
              type="button"
              aria-label="구글 로그인"
            >
              G
            </button>
            <button
              className="social-button social-button-apple"
              type="button"
              aria-label="애플 로그인"
            >
              A
            </button>
          </div>
        </div>

        <p className="login-signup">
          계정이 없으신가요? <Link to="/signup">회원가입</Link>
        </p>
      </section>
    </main>
  )
}

export default LoginPage
