// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest'

import {
  COOKIE_CONSENT_COOKIE_NAME,
  COOKIE_CONSENT_STORAGE_KEY,
  COOKIE_CONSENT_VERSION,
  clearCookieConsent,
  getCookieConsent,
  hasAnalyticsCookieConsent,
  saveCookieConsent,
} from './cookieConsent'

describe('cookie consent preferences', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.cookie = `${COOKIE_CONSENT_COOKIE_NAME}=; Max-Age=0; Path=/`
  })

  it('returns null before the visitor chooses a preference', () => {
    expect(getCookieConsent()).toBeNull()
    expect(hasAnalyticsCookieConsent()).toBe(false)
  })

  it('stores optional analytics consent separately from required cookies', () => {
    const savedConsent = saveCookieConsent(true)

    expect(savedConsent).toMatchObject({
      version: COOKIE_CONSENT_VERSION,
      necessary: true,
      analytics: true,
    })
    expect(getCookieConsent()?.analytics).toBe(true)
    expect(hasAnalyticsCookieConsent()).toBe(true)
    expect(window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)).toContain('"analytics":true')
    expect(document.cookie).toContain(`${COOKIE_CONSENT_COOKIE_NAME}=analytics`)
  })

  it('can reject optional analytics cookies while keeping required operation consent', () => {
    saveCookieConsent(false)

    expect(getCookieConsent()).toMatchObject({
      necessary: true,
      analytics: false,
    })
    expect(hasAnalyticsCookieConsent()).toBe(false)
    expect(document.cookie).toContain(`${COOKIE_CONSENT_COOKIE_NAME}=necessary`)
  })

  it('ignores stale or malformed stored consent', () => {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify({
      version: 'old-version',
      necessary: true,
      analytics: true,
      updatedAt: new Date().toISOString(),
    }))

    expect(getCookieConsent()).toBeNull()
  })

  it('clears saved consent and the consent cookie', () => {
    saveCookieConsent(true)
    clearCookieConsent()

    expect(getCookieConsent()).toBeNull()
    expect(window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)).toBeNull()
  })
})
