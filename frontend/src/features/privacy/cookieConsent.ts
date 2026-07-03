export const COOKIE_CONSENT_STORAGE_KEY = 'projectCyanCookieConsent'
export const COOKIE_CONSENT_COOKIE_NAME = 'project_cyan_cookie_consent'
export const COOKIE_CONSENT_VERSION = '2026-07-03'

export type CookieConsentPreferences = {
  version: string
  necessary: true
  analytics: boolean
  updatedAt: string
}

function isCookieConsentPreferences(value: unknown): value is CookieConsentPreferences {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<CookieConsentPreferences>
  return (
    candidate.version === COOKIE_CONSENT_VERSION
    && candidate.necessary === true
    && typeof candidate.analytics === 'boolean'
    && typeof candidate.updatedAt === 'string'
  )
}

function writeConsentCookie(preferences: CookieConsentPreferences) {
  if (typeof document === 'undefined') {
    return
  }

  const value = preferences.analytics ? 'analytics' : 'necessary'
  const secureFlag = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${COOKIE_CONSENT_COOKIE_NAME}=${value}; Max-Age=15552000; Path=/; SameSite=Lax${secureFlag}`
}

export function getCookieConsent(): CookieConsentPreferences | null {
  try {
    const rawValue = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)
    if (!rawValue) {
      return null
    }

    const parsedValue: unknown = JSON.parse(rawValue)
    return isCookieConsentPreferences(parsedValue) ? parsedValue : null
  } catch {
    return null
  }
}

export function saveCookieConsent(analytics: boolean): CookieConsentPreferences {
  const preferences: CookieConsentPreferences = {
    version: COOKIE_CONSENT_VERSION,
    necessary: true,
    analytics,
    updatedAt: new Date().toISOString(),
  }

  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(preferences))
  writeConsentCookie(preferences)
  window.dispatchEvent(new CustomEvent('project-cyan:cookie-consent-changed', {
    detail: preferences,
  }))
  return preferences
}

export function hasAnalyticsCookieConsent() {
  return getCookieConsent()?.analytics === true
}

export function clearCookieConsent() {
  window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY)
  document.cookie = `${COOKIE_CONSENT_COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax`
  window.dispatchEvent(new Event('project-cyan:cookie-consent-cleared'))
}
