import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { exchangeAuthCodeForSession, updateMemberPassword } from './member'
import './AccountPages.css'

function ResetPasswordPage() {
  const navigate = useNavigate()
  const hasCheckedCode = useRef(false)
  const [form, setForm] = useState({
    password: '',
    passwordConfirm: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function exchangeRecoveryCode() {
      if (hasCheckedCode.current) {
        return
      }

      hasCheckedCode.current = true

      const params = new URLSearchParams(window.location.search)
      const providerError =
        params.get('error_description') ?? params.get('error') ?? ''
      const code = params.get('code')

      if (providerError) {
        setError(providerError)
        return
      }

      if (!code) {
        return
      }

      setIsLoading(true)

      try {
        await exchangeAuthCodeForSession(code)
        window.history.replaceState(window.history.state, '', '/reset-password')
      } catch (recoveryError) {
        setError(recoveryError.message)
      } finally {
        setIsLoading(false)
      }
    }

    exchangeRecoveryCode()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')

    if (form.password !== form.passwordConfirm) {
      setError('비밀번호가 서로 다릅니다.')
      return
    }

    setIsLoading(true)

    try {
      await updateMemberPassword(form.password)
      setMessage('비밀번호가 변경되었습니다.')
      window.setTimeout(() => navigate('/login'), 900)
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
          <Link to="/mypage">마이페이지</Link>
        </nav>

        <section className="account-card account-panel" aria-label="새 비밀번호 설정">
          <div className="account-heading">
            <p>비밀번호 재설정</p>
            <h1>새 비밀번호 설정</h1>
          </div>

          <form className="account-form" onSubmit={handleSubmit}>
            <label className="account-field">
              <span>새 비밀번호</span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="새 비밀번호를 입력하세요"
                autoComplete="new-password"
                required
              />
            </label>

            <label className="account-field">
              <span>새 비밀번호 확인</span>
              <input
                type="password"
                name="passwordConfirm"
                value={form.passwordConfirm}
                onChange={handleChange}
                placeholder="새 비밀번호를 다시 입력하세요"
                autoComplete="new-password"
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
              {isLoading ? '변경 중...' : '비밀번호 변경'}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}

export default ResetPasswordPage
