import { BrowserRouter, Route, Routes } from 'react-router-dom'

import ArtistPage from './features/artist/artist.tsx'
import GoodsDetailPage from './features/goods/GoodsDetailPage.jsx'
import GoodsPage from './features/goods/goods.jsx'
import LoginPage from './features/member/LoginPage.jsx'
import SignupPage from './features/member/SignupPage.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GoodsPage />} />
        <Route path="/goods" element={<GoodsPage />} />
        <Route path="/goods/:goodsId" element={<GoodsDetailPage />} />
        <Route path="/artists" element={<ArtistPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
