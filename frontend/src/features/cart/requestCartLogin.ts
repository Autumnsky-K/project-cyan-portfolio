import type { NavigateFunction } from 'react-router-dom'

const LOGIN_NOTICE_DEDUPLICATION_MS = 1500
const LOGIN_RETURN_TO_KEY = 'project-cyan:login-return-to'

let lastNoticeAt = 0

export function requestCartLogin(navigate: NavigateFunction): void {
  const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`
  window.sessionStorage.setItem(LOGIN_RETURN_TO_KEY, returnTo)

  const now = Date.now()
  if (now - lastNoticeAt >= LOGIN_NOTICE_DEDUPLICATION_MS) {
    lastNoticeAt = now
    window.alert('Cart and checkout are available after login.')
  }

  navigate('/login', {
    state: {
      from: returnTo,
    },
  })
}
