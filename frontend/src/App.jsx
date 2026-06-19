import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'

import ArtistPage from './features/artist/artist.tsx'
import CartPage from './features/cart/CartPage'
import { CartProvider } from './features/cart/cartStore'
import GoodsDetailPage from './features/goods/GoodsDetailPage'
import GoodsPage from './features/goods/goods'
import LoginPage from './features/member/LoginPage.jsx'
import SignupPage from './features/member/SignupPage.jsx'
import VtuberChatbot from './features/vtuber/VtuberChatbot.tsx'

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
      <div id='content'>
        <Routes>
          <Route path="/" element={<Navigate replace to="/goods" />} />
          <Route path="/goods" element={<GoodsPage />} />
          <Route path="/goods/:goodsId" element={<GoodsDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/artists" element={<ArtistPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
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
