import { BrowserRouter, Route, Routes } from 'react-router-dom'

import LoginPage from './features/member/LoginPage.jsx'
import SignupPage from './features/member/SignupPage.jsx'
import { useEffect, useState } from 'react.jsx'
import ArtistPage from './features/artist/artist.tsx'
import GoodsPage from './features/goods/goods.jsx'

function getCurrentPage() {
  return window.location.hash === '#artists' ? 'artists' : 'goods'
}

function App() {
  return (
    // BrowserRouter가 브라우저 주소를 읽고, Routes가 주소에 맞는 화면을 고릅니다.
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/goods" element={<GoodsPage />} />
        <Route path="/artists" element={<ArtistPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
