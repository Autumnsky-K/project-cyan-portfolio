import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { CartProvider } from './features/cart/cartStore'

import AuthCallbackPage from './features/member/AuthCallbackPage'
import ArtistPage from './features/artist/artist'
import ForgotPasswordPage from './features/member/ForgotPasswordPage'
import CartPage from './features/cart/CartPage'
import GoodsDetailPage from './features/goods/GoodsDetailPage'
import GoodsPage from './features/goods/goods'
import LikePage from './features/member/LikePage'
import LoginPage from './features/member/LoginPage.jsx'
import PaymentCancel from './pages/PaymentCancel.jsx'
import PaymentFail from './pages/PaymentFail.jsx'
import PaymentSuccess from './pages/PaymentSuccess.jsx'
import Store from './pages/Store.jsx'
import MyPage from './features/member/MyPage'
import ResetPasswordPage from './features/member/ResetPasswordPage'
import SignupPage from './features/member/SignupPage.jsx'
import VtuberChatbot from './features/vtuber/VtuberChatbot'

function AppShell() {
  const { pathname } = useLocation()
  const hideVtuber = pathname === '/login' || pathname === '/signup'

  useEffect(() => {
    const pageName = pathname.startsWith('/goods/')
      ? '상품 상세'
      : pathname === '/goods'
        ? '상품'
        : pathname === '/artists'
          ? '아티스트'
          : pathname === '/cart'
            ? '장바구니'
            : pathname === '/login'
              ? '로그인'
              : pathname === '/signup'
                ? '회원가입'
                : '스토어'
    document.title = `Project Cyan Store - ${pageName}`
  }, [pathname])

  return (
    <>
      <div id="content">
        <Routes>
          <Route path="/" element={<Navigate replace to="/goods" />} />
          <Route path="/goods" element={<GoodsPage />} />
          <Route path="/goods/:goodsId" element={<GoodsDetailPage />} />
          <Route path="/cart" element={<Store />} />
          <Route path="/artists" element={<ArtistPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/store" element={<Store />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />
          <Route path="/payment/fail" element={<PaymentFail />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/like" element={<LikePage />} />
          <Route path="/likes/artists" element={<LikePage />} />
          <Route path="/mypage" element={<MyPage />} />
        </Routes>
      </div>
      {!hideVtuber && <VtuberChatbot />}
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <AppShell />
      </CartProvider>
    </BrowserRouter>
  )
}

export default App
