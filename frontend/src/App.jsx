import { BrowserRouter, Route, Routes } from 'react-router-dom'
import GoodsPage from './features/goods/goods'
import LoginPage from './features/member/LoginPage'
import SignupPage from './features/member/SignupPage'

function App() {
  return (
    // BrowserRouter가 브라우저 주소를 읽고, Routes가 주소에 맞는 화면을 고릅니다.
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/goods" element={<GoodsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
