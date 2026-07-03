import { useNavigate } from 'react-router-dom'
import Button from '../../shared/components/Button'
import Header from '../../shared/components/Header'
import ErrorPage from './ErrorPage'

function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <>
      <Header />
      <ErrorPage
        code="404"
        title="페이지를 찾을 수 없습니다"
        message="요청하신 주소가 삭제되었거나 잘못 입력되었을 수 있습니다."
      >
        <Button variant="primary" shape="pill" size="large" onClick={() => navigate('/')}>
          홈으로 가기
        </Button>
        <Button variant="outline" shape="pill" size="large" onClick={() => navigate('/goods')}>
          상품 보러가기
        </Button>
      </ErrorPage>
    </>
  )
}

export default NotFoundPage
