import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LoginPage from './features/member/LoginPage'

function App() {
  return (
    // BrowserRouter가 브라우저 주소를 읽고, Routes가 주소에 맞는 화면을 고릅니다.
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
