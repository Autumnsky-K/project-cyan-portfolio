import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'

import ArtistPage from './features/artist/artist.tsx'
import CartPage from './features/cart/CartPage'
import { CartProvider } from './features/cart/cartStore'
import GoodsDetailPage from './features/goods/GoodsDetailPage'
import GoodsPage from './features/goods/goods'
import LoginPage from './features/member/LoginPage.jsx'
import SignupPage from './features/member/SignupPage.jsx'
import VtuberChatbot from './features/vtuber/VtuberChatbot.tsx'
import PaymentCancel from './pages/PaymentCancel.jsx'
import PaymentFail from './pages/PaymentFail.jsx'
import PaymentSuccess from './pages/PaymentSuccess.jsx'
import Store from './pages/Store.jsx'

function AppShell() {
  const { pathname } = useLocation()
  const hideVtuber = pathname === '/login' || pathname === '/signup'

  return (
    <>
      <div id="content">
        <Routes>
          <Route path="/" element={<GoodsPage />} />
          <Route path="/goods" element={<GoodsPage />} />
          <Route path="/goods/:goodsId" element={<GoodsDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/artists" element={<ArtistPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/store" element={<Store />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />
          <Route path="/payment/fail" element={<PaymentFail />} />
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
