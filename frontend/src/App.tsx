import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import CartAccessGate from './features/cart/CartAccessGate'
import { CartProvider } from './features/cart/cartStore'
import { setGlobalNavigate } from './shared/api/errorNavigation'

import { recordPageView } from './api/security'
import AuthCallbackPage from './features/member/AuthCallbackPage'
import ArtistPage from './features/artist/artist'
import CustomerInfoPage from './features/customer/CustomerInfoPage'
import ForgotPasswordPage from './features/member/ForgotPasswordPage'
import DigitalLibraryPage from './features/member/DigitalLibraryPage'
import GoodsDetailPage from './features/goods/GoodsDetailPage'
import GoodsLikesPage from './features/member/GoodsLikesPage'
import GoodsPage from './features/goods/goods'
import HomePage from './features/home/HomePage'
import CookieConsentBanner from './features/privacy/CookieConsentBanner'
import LikePage from './features/member/LikePage'
import LoginPage from './features/member/LoginPage.jsx'
import PaymentCancel from './pages/PaymentCancel.jsx'
import PaymentFail from './pages/PaymentFail.jsx'
import PaymentSuccess from './pages/PaymentSuccess.jsx'
import Store from './pages/Store.jsx'
import MyPage from './features/member/MyPage'
import ResetPasswordPage from './features/member/ResetPasswordPage'
import SignupPage from './features/member/SignupPage.jsx'
import SiteFooter from './shared/components/SiteFooter'
import VtuberChatbot from './features/vtuber/VtuberChatbot'
import { isVtuberVisiblePath } from './features/vtuber/visibility'
import ForbiddenPage from './pages/errors/ForbiddenPage'
import NotFoundPage from './pages/errors/NotFoundPage'
import ServerErrorPage from './pages/errors/ServerErrorPage'
import ErrorBoundary from './shared/components/ErrorBoundary'
import ImmersiveLayout from './shared/layouts/ImmersiveLayout'
import StoreLayout from './shared/layouts/StoreLayout'

function getPageName(pathname: string) {
  if (pathname.startsWith('/goods/')) return '상품 상세'
  if (pathname === '/goods') return '상품'
  if (pathname === '/likes/goods') return '찜한 굿즈'
  if (pathname === '/likes/artists' || pathname === '/like') return '찜한 아티스트'
  if (pathname === '/artists') return '아티스트'
  if (pathname === '/cart') return '장바구니'
  if (pathname === '/checkout' || pathname === '/store') return '결제'
  if (pathname === '/mypage') return '마이페이지'
  if (pathname === '/mypage/digital-library') return '디지털 보관함'
  if (pathname === '/login') return '로그인'
  if (pathname === '/signup') return '회원가입'
  if (pathname === '/support') return '고객센터'
  if (pathname === '/faq') return 'FAQ'
  if (pathname === '/terms') return '이용약관'
  if (pathname === '/privacy') return '개인정보 처리방침'
  if (pathname === '/partnership') return '제휴 문의'
  if (pathname === '/403') return '접근 제한'
  if (pathname === '/500') return '서버 오류'
  return '스토어'
}

function isArtistPath(pathname: string) {
  return pathname === '/artists' || pathname.startsWith('/artists/')
}

function AppShell() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const showVtuber = isVtuberVisiblePath(pathname)
  const isHomePath = pathname === '/'
  const showCookieConsent = isHomePath || pathname === '/goods' || pathname.startsWith('/goods/')
  const showSiteFooter = !isHomePath && !isArtistPath(pathname)

  useEffect(() => {
    setGlobalNavigate(navigate)
    return () => setGlobalNavigate(null)
  }, [navigate])

  useEffect(() => {
    document.title = `Project Cyan Store - ${getPageName(pathname)}`
  }, [pathname])

  useEffect(() => {
    const sendPageView = () => {
      void recordPageView(pathname, getPageName(pathname)).catch(() => undefined)
    }

    sendPageView()
    const handleConsentChange = () => sendPageView()
    window.addEventListener('project-cyan:cookie-consent-changed', handleConsentChange)
    return () => window.removeEventListener('project-cyan:cookie-consent-changed', handleConsentChange)
  }, [pathname])

  return (
    <>
      <div id="content">
        <Routes>
          <Route element={<ImmersiveLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/artists" element={<ArtistPage />} />
          </Route>
          <Route element={<StoreLayout />}>
            <Route path="/goods" element={<GoodsPage />} />
            <Route path="/goods/:goodsId" element={<GoodsDetailPage />} />
            <Route path="/cart" element={<Store mode="cart" />} />
            <Route
              path="/store"
              element={(
                <CartAccessGate>
                  <Store mode="checkout" />
                </CartAccessGate>
              )}
            />
            <Route
              path="/checkout"
              element={(
                <CartAccessGate>
                  <Store mode="checkout" />
                </CartAccessGate>
              )}
            />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/mypage/digital-library" element={<DigitalLibraryPage />} />
            <Route path="/like" element={<LikePage />} />
            <Route path="/likes/goods" element={<GoodsLikesPage />} />
            <Route path="/likes/artists" element={<LikePage />} />
            <Route path="/support" element={<CustomerInfoPage kind="support" />} />
            <Route path="/faq" element={<CustomerInfoPage kind="faq" />} />
            <Route path="/terms" element={<CustomerInfoPage kind="terms" />} />
            <Route path="/privacy" element={<CustomerInfoPage kind="privacy" />} />
            <Route path="/partnership" element={<CustomerInfoPage kind="partnership" />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />
          <Route path="/payment/fail" element={<PaymentFail />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/403" element={<ForbiddenPage />} />
          <Route path="/500" element={<ServerErrorPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
      {showSiteFooter && <SiteFooter />}
      {showVtuber && <VtuberChatbot />}
      {showCookieConsent && <CookieConsentBanner />}
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <CartProvider>
          <AppShell />
        </CartProvider>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App
