import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { exchangeAuthCodeForSession, getCurrentMember } from './member'
import './LoginPage.css'

let isExchangingAuthCode = false

function getLoginUrlWithError(message) {
  const params = new URLSearchParams()
  params.set('authError', message)

  return `/login?${params.toString()}`
}

function getReturnTo() {
  const storedReturnTo = window.sessionStorage.getItem('project-cyan:login-return-to')
  window.sessionStorage.removeItem('project-cyan:login-return-to')

  return typeof storedReturnTo === 'string' && storedReturnTo.startsWith('/') && !storedReturnTo.startsWith('//')
    ? storedReturnTo
    : '/like'
}

function AuthCallbackPage() {
  const navigate = useNavigate()
  const hasStarted = useRef(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function completeLogin() {
      if (hasStarted.current || isExchangingAuthCode) {
        return
      }

      hasStarted.current = true
      isExchangingAuthCode = true

      const params = new URLSearchParams(window.location.search)
      const providerError =
        params.get('error_description') ?? params.get('error') ?? ''
      const code = params.get('code')

      try {
        if (providerError) {
          throw new Error(providerError)
        }

        if (code) {
          await exchangeAuthCodeForSession(code)
          navigate(getReturnTo(), { replace: true })
          return
        }

        const member = await getCurrentMember()

        if (member) {
          navigate(getReturnTo(), { replace: true })
          return
        }

        throw new Error('카카오 로그인 인증 코드가 없습니다.')
      } catch (callbackError) {
        const message =
          callbackError instanceof Error
            ? callbackError.message
            : '카카오 로그인에 실패했습니다.'

        setError(message)
        navigate(getLoginUrlWithError(message), {
          replace: true,
          state: { authError: message },
        })
      } finally {
        isExchangingAuthCode = false
      }
    }

    completeLogin()
  }, [navigate])

  return (
    <main className="login-page">
      <section className="login-card" aria-label="카카오 로그인 처리">
        <div className="login-header">
          <div className="login-logo" aria-hidden="true"></div>
        </div>

        <div className="login-form">
          {error ? (
            <p className="login-feedback login-feedback-error" role="alert">
              {error}
            </p>
          ) : (
            <p className="login-feedback login-feedback-success" role="status">
              카카오 로그인을 완료하는 중입니다.
            </p>
          )}
        </div>
      </section>
    </main>
  )
}

export default AuthCallbackPage
