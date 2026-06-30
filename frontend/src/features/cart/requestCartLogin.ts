import type { NavigateFunction } from 'react-router-dom'

const LOGIN_NOTICE_DEDUPLICATION_MS = 1500
const LOGIN_RETURN_TO_KEY = 'project-cyan:login-return-to'

let lastNoticeAt = 0

export function requestCartLogin(navigate: NavigateFunction, returnTo?: string): void {
  const fallbackReturnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`
  const nextReturnTo = returnTo || fallbackReturnTo
  window.sessionStorage.setItem(LOGIN_RETURN_TO_KEY, nextReturnTo)

  const now = Date.now()
  if (now - lastNoticeAt >= LOGIN_NOTICE_DEDUPLICATION_MS) {
    lastNoticeAt = now
    window.alert('결제를 계속하려면 로그인해 주세요.')
  }

  navigate('/login', {
    state: {
      from: nextReturnTo,
    },
  })
}
