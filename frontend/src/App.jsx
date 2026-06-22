import { BrowserRouter, Route, Routes } from 'react-router-dom'
import GoodsPage from './features/goods/goods'
import AuthCallbackPage from './features/member/AuthCallbackPage'
import ForgotPasswordPage from './features/member/ForgotPasswordPage'
import LikePage from './features/member/LikePage'
import LoginPage from './features/member/LoginPage'
import MyPage from './features/member/MyPage'
import ResetPasswordPage from './features/member/ResetPasswordPage'
import SignupPage from './features/member/SignupPage'

function App() {
  return (
    // BrowserRouter가 브라우저 주소를 읽고, Routes가 주소에 맞는 화면을 고릅니다.
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/like" element={<LikePage />} />
        <Route path="/likes/artists" element={<LikePage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/goods" element={<GoodsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
