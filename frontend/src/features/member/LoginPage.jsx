import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Button from '../../shared/components/Button'
import { loginMember, loginWithKakao } from './member'
import AccountFeedbackPopup from './AccountFeedbackPopup'
import PasswordVisibilityButton from './PasswordVisibilityButton'
import './LoginPage.css'

function getAuthError(location) {
  const params = new URLSearchParams(location.search)

  return location.state?.authError ?? params.get('authError') ?? ''
}

function safeReturnTo(value) {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')
    ? value
    : '/mypage'
}

function getReturnTo(location) {
  return safeReturnTo(location.state?.from ?? window.sessionStorage.getItem('project-cyan:login-return-to'))
}

function LoginPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProvider, setLoadingProvider] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState(() => getAuthError(location))
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  useEffect(() => {
    if (getAuthError(location)) {
      navigate('/login', { replace: true, state: null })
    }
  }, [location, navigate])

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
    setLoadingProvider('email')
    setMessage('')
    setError('')

    try {
      const result = await loginMember(form)
      setMessage(`${result.member.email} 계정으로 로그인되었습니다.`)
      const returnTo = getReturnTo(location)
      window.sessionStorage.removeItem('project-cyan:login-return-to')
      navigate(returnTo, { replace: true })
    } catch (loginError) {
      setError(loginError.message || '계정을 찾을 수 없습니다. 먼저 회원가입을 진행해 주세요.')
    } finally {
      setIsLoading(false)
      setLoadingProvider('')
    }
  }

  const handleKakaoLogin = async () => {
    setIsLoading(true)
    setLoadingProvider('kakao')
    setMessage('')
    setError('')

    try {
      window.sessionStorage.setItem('project-cyan:login-return-to', getReturnTo(location))
      await loginWithKakao()
    } catch (loginError) {
      setError(loginError.message)
      setIsLoading(false)
      setLoadingProvider('')
    }
  }

  return (
    <main className="login-page">
      <AccountFeedbackPopup message={error} onDone={() => setError('')} />

      <section className="login-card" aria-label="로그인">
        <Link className="site-brand-home" to="/" aria-label="Project Cyan 홈으로 이동">
          <img src="/favicon.svg" alt="" />
          <span>PROJECT CYAN</span>
        </Link>
        <h1 className="login-title">LOGIN</h1>

        <div className="login-content">
          <form className="login-form" onSubmit={handleSubmit}>
            {/* 일반 로그인도 Supabase Auth로 처리해 회원 UUID 기준을 통일합니다. */}
            <label className="login-field">
              <span>이메일</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="email@example.com"
                autoComplete="email"
                required
              />
            </label>

            <label className="login-field">
              <span>비밀번호</span>
              <div className="password-input">
                <input
                  type={isPasswordVisible ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="비밀번호를 입력하세요"
                  autoComplete="current-password"
                  required
                />
                <PasswordVisibilityButton
                  isVisible={isPasswordVisible}
                  onClick={() => setIsPasswordVisible((currentValue) => !currentValue)}
                />
              </div>
            </label>

            {message && (
              <p className="login-feedback login-feedback-success" role="status">
                {message}
              </p>
            )}

            <Button className="login-submit" fullWidth shape="pill" size="large" type="submit" disabled={isLoading}>
              {loadingProvider === 'email' ? '로그인 중...' : '로그인'}
            </Button>
          </form>

          <p className="login-help">
            <Link to="/forgot-password">비밀번호 찾기</Link>
          </p>

          <div className="login-social" aria-label="소셜 로그인">
            <p>소셜 계정으로 로그인</p>
            <div className="login-social-buttons">
              <button
                className="social-login-button social-button-kakao"
                type="button"
                aria-label="카카오 로그인"
                onClick={handleKakaoLogin}
                disabled={isLoading}
              >
                {loadingProvider === 'kakao'
                  ? '카카오로 이동 중...'
                  : '카카오톡으로 로그인하기'}
              </button>
            </div>
          </div>

          <p className="login-signup">
            계정이 없으신가요? <Link to="/signup">회원가입</Link>
          </p>
        </div>
      </section>
    </main>
  )
}

export default LoginPage
