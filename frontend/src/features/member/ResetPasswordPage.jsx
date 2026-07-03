import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../shared/components/Button'
import { exchangeAuthCodeForSession, updateMemberPassword } from './member'
import AccountFeedbackPopup from './AccountFeedbackPopup'
import PasswordVisibilityButton from './PasswordVisibilityButton'
import './AccountPages.css'

function ResetPasswordPage() {
  const navigate = useNavigate()
  const hasCheckedCode = useRef(false)
  const [resetToken, setResetToken] = useState('')
  const [form, setForm] = useState({
    password: '',
    passwordConfirm: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [visiblePasswords, setVisiblePasswords] = useState({
    password: false,
    passwordConfirm: false,
  })

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
      const token = params.get('token') ?? ''

      if (providerError) {
        setError(providerError)
        return
      }

      if (token) {
        setResetToken(token)
        window.history.replaceState(window.history.state, '', '/reset-password')
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

  const togglePasswordVisibility = (name) => {
    setVisiblePasswords((currentVisiblePasswords) => ({
      ...currentVisiblePasswords,
      [name]: !currentVisiblePasswords[name],
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
      await updateMemberPassword(form.password, resetToken)
      setMessage('비밀번호가 변경되었습니다.')
      window.setTimeout(() => navigate('/login'), 900)
    } catch (resetError) {
      setError(resetError.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="account-page reset-password-page">
      <AccountFeedbackPopup message={error} onDone={() => setError('')} />
      <AccountFeedbackPopup
        message={message}
        type="success"
        onDone={() => setMessage('')}
      />

      <div className="account-shell">
        <nav className="account-topbar reset-password-topbar" aria-label="계정 이동">
          <button
            className="reset-password-back"
            type="button"
            aria-label="이전 화면으로 이동"
            onClick={() => navigate(-1)}
          />
        </nav>

        <section className="account-card account-panel reset-password-panel" aria-label="새 비밀번호 설정">
          <div className="account-heading">
            <p>비밀번호 재설정</p>
            <h1>새 비밀번호 설정</h1>
          </div>

          <form className="account-form reset-password-form" onSubmit={handleSubmit}>
            <label className="account-field">
              <span>새 비밀번호</span>
              <div className="password-input">
                <input
                  type={visiblePasswords.password ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="새 비밀번호를 입력하세요"
                  autoComplete="new-password"
                  required
                />
                <PasswordVisibilityButton
                  isVisible={visiblePasswords.password}
                  onClick={() => togglePasswordVisibility('password')}
                />
              </div>
            </label>

            <label className="account-field">
              <span>새 비밀번호 확인</span>
              <div className="password-input">
                <input
                  type={visiblePasswords.passwordConfirm ? 'text' : 'password'}
                  name="passwordConfirm"
                  value={form.passwordConfirm}
                  onChange={handleChange}
                  placeholder="새 비밀번호를 다시 입력하세요"
                  autoComplete="new-password"
                  required
                />
                <PasswordVisibilityButton
                  isVisible={visiblePasswords.passwordConfirm}
                  onClick={() => togglePasswordVisibility('passwordConfirm')}
                />
              </div>
            </label>

            <Button className="account-button" shape="pill" size="large" type="submit" disabled={isLoading}>
              {isLoading ? '변경 중...' : '비밀번호 변경'}
            </Button>
          </form>
        </section>
      </div>
    </main>
  )
}

export default ResetPasswordPage
