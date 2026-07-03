import { apiFetch } from '../shared/api/springApiClient'
import { hasAnalyticsCookieConsent } from '../features/privacy/cookieConsent'

const ANALYTICS_ID_STORAGE_KEY = 'projectCyanAnalyticsId'
const ANALYTICS_SESSION_STORAGE_KEY = 'projectCyanAnalyticsSessionId'

function analyticsId() {
  const existingId = window.localStorage.getItem(ANALYTICS_ID_STORAGE_KEY)
  if (existingId) {
    return existingId
  }

  const nextId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  window.localStorage.setItem(ANALYTICS_ID_STORAGE_KEY, nextId)
  return nextId
}

function analyticsSessionId() {
  const existingId = window.sessionStorage.getItem(ANALYTICS_SESSION_STORAGE_KEY)
  if (existingId) {
    return existingId
  }

  const nextId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  window.sessionStorage.setItem(ANALYTICS_SESSION_STORAGE_KEY, nextId)
  return nextId
}

function currentUtmValue(key: string) {
  const value = new URLSearchParams(window.location.search).get(key)
  return value && value.trim() ? value : undefined
}

export async function recordPageView(pathname: string, routeName: string) {
  if (!hasAnalyticsCookieConsent()) {
    return
  }

  await apiFetch('/security/page-views', {
    method: 'POST',
    keepalive: true,
    headers: {
      'X-Project-Cyan-Fingerprint': analyticsId(),
      'X-Project-Cyan-Session': analyticsSessionId(),
    },
    body: JSON.stringify({
      path: pathname,
      routeName,
      pageTitle: document.title,
      referrer: document.referrer || undefined,
      utmSource: currentUtmValue('utm_source'),
      utmMedium: currentUtmValue('utm_medium'),
      utmCampaign: currentUtmValue('utm_campaign'),
      utmContent: currentUtmValue('utm_content'),
      utmTerm: currentUtmValue('utm_term'),
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
    }),
  })
}
