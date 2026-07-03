import { useNavigate } from 'react-router-dom'
import Button from '../../shared/components/Button'
import Header from '../../shared/components/Header'
import ErrorPage from './ErrorPage'

function ServerErrorPage() {
  const navigate = useNavigate()

  return (
    <>
      <Header />
      <ErrorPage
        code="500"
        title="일시적인 오류가 발생했습니다"
        message="서버에 문제가 발생해 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요."
      >
        <Button variant="primary" shape="pill" size="large" onClick={() => window.location.reload()}>
          새로고침
        </Button>
        <Button variant="outline" shape="pill" size="large" onClick={() => navigate('/')}>
          홈으로 가기
        </Button>
      </ErrorPage>
    </>
  )
}

export default ServerErrorPage
