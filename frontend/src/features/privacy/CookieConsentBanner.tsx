import { useEffect, useState } from 'react'

import {
  getCookieConsent,
  saveCookieConsent,
} from './cookieConsent'
import './CookieConsentBanner.css'

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [hasSavedConsent, setHasSavedConsent] = useState(false)
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const syncFromStorage = () => {
      const savedConsent = getCookieConsent()
      setAnalyticsAllowed(savedConsent?.analytics ?? false)
      setHasSavedConsent(Boolean(savedConsent))
      setIsVisible(!savedConsent)
    }

    const openPreferences = () => {
      const savedConsent = getCookieConsent()
      setAnalyticsAllowed(savedConsent?.analytics ?? false)
      setIsExpanded(true)
      setIsVisible(true)
    }

    syncFromStorage()
    window.addEventListener('project-cyan:open-cookie-consent', openPreferences)
    return () => window.removeEventListener('project-cyan:open-cookie-consent', openPreferences)
  }, [])

  if (!isVisible) {
    return null
  }

  const saveAndClose = (analytics: boolean) => {
    saveCookieConsent(analytics)
    setHasSavedConsent(true)
    setIsVisible(false)
  }

  const reopenPreferences = () => {
    const savedConsent = getCookieConsent()
    setAnalyticsAllowed(savedConsent?.analytics ?? false)
    setIsExpanded(true)
    setIsVisible(true)
  }

  if (!isVisible && hasSavedConsent) {
    return (
      <button type="button" className="cookie-consent-reopen" onClick={reopenPreferences}>
        쿠키 설정
      </button>
    )
  }

  return (
    <section
      className="cookie-consent-banner"
      aria-label="쿠키 이용 동의"
      role="dialog"
      aria-modal="false"
    >
      <div className="cookie-consent-copy">
        <p className="cookie-consent-eyebrow">쿠키 이용 안내</p>
        <h2>서비스 운영에 필요한 쿠키를 사용합니다</h2>
        <p>
          로그인, 장바구니, 결제 보안처럼 필수 기능에 필요한 쿠키는 항상 사용됩니다.
          고객 이용 통계 쿠키는 동의한 경우에만 사용할 수 있도록 저장합니다.
        </p>
      </div>

      <div className="cookie-consent-controls">
        <button
          type="button"
          className="cookie-consent-link-button"
          onClick={() => setIsExpanded((value) => !value)}
          aria-expanded={isExpanded}
        >
          설정 {isExpanded ? '닫기' : '보기'}
        </button>
        <button type="button" onClick={() => saveAndClose(false)}>
          필수만 허용
        </button>
        <button type="button" className="cookie-consent-primary" onClick={() => saveAndClose(true)}>
          모두 동의
        </button>
      </div>

      {isExpanded && (
        <div className="cookie-consent-options">
          <label className="cookie-consent-option is-required">
            <input type="checkbox" checked disabled />
            <span>
              <strong>필수/보안 쿠키</strong>
              <small>로그인 상태, 장바구니, 결제 진행, 보안 제한처럼 서비스 운영에 필요한 항목입니다.</small>
            </span>
          </label>
          <label className="cookie-consent-option">
            <input
              type="checkbox"
              checked={analyticsAllowed}
              onChange={(event) => setAnalyticsAllowed(event.currentTarget.checked)}
            />
            <span>
              <strong>고객 이용 통계 쿠키</strong>
              <small>방문 흐름, 상품 조회, 검색 사용성을 집계해 화면 개선에 사용하는 선택 항목입니다.</small>
            </span>
          </label>
          <div className="cookie-consent-option-actions">
            <button type="button" className="cookie-consent-primary" onClick={() => saveAndClose(analyticsAllowed)}>
              선택 저장
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
