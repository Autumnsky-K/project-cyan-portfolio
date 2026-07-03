import { useNavigate } from 'react-router-dom'
import Button from '../../shared/components/Button'
import Header from '../../shared/components/Header'
import ErrorPage from './ErrorPage'

function ForbiddenPage() {
  const navigate = useNavigate()

  return (
    <>
      <Header />
      <ErrorPage
        code="403"
        title="접근 권한이 없습니다"
        message="이 페이지에 접근할 권한이 없습니다. 로그인 상태를 확인하거나 다른 계정으로 시도해 주세요."
      >
        <Button variant="primary" shape="pill" size="large" onClick={() => navigate('/')}>
          홈으로 가기
        </Button>
        <Button variant="outline" shape="pill" size="large" onClick={() => navigate('/login')}>
          로그인 페이지로 이동
        </Button>
      </ErrorPage>
    </>
  )
}

export default ForbiddenPage
