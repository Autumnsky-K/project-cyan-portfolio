import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'

import AdminGoodsPage from './features/admin/AdminGoodsPage.jsx'
import ArtistPage from './features/artist/artist.tsx'
import CartPage from './features/cart/CartPage.jsx'
import { CartProvider } from './features/cart/cartStore.jsx'
import GoodsDetailPage from './features/goods/GoodsDetailPage.jsx'
import GoodsPage from './features/goods/goods.jsx'
import LoginPage from './features/member/LoginPage.jsx'
import SignupPage from './features/member/SignupPage.jsx'
import VtuberChatbot from './features/vtuber/VtuberChatbot.tsx'

function AppShell() {
  const { pathname } = useLocation()
  const hideVtuber = pathname === '/login' || pathname === '/signup' || pathname.startsWith('/admin')

  return (
    <>
      <div id='content'>
        <Routes>
          <Route path="/" element={<GoodsPage />} />
          <Route path="/goods" element={<GoodsPage />} />
          <Route path="/goods/:goodsId" element={<GoodsDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/artists" element={<ArtistPage />} />
          <Route path="/admin" element={<Navigate to="/admin/goods" replace />} />
          <Route path="/admin/goods" element={<AdminGoodsPage />} />
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
