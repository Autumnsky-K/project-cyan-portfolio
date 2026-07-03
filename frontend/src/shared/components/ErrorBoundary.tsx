import { Component, type ErrorInfo, type ReactNode } from 'react'
import Button from './Button'
import ErrorPage from '../../pages/errors/ErrorPage'

type ErrorBoundaryProps = {
  children: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled render error', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorPage
          code="500"
          title="일시적인 오류가 발생했습니다"
          message="예기치 못한 문제로 화면을 표시하지 못했습니다. 새로고침해도 문제가 계속되면 잠시 후 다시 시도해 주세요."
        >
          <Button variant="primary" shape="pill" size="large" onClick={() => window.location.reload()}>
            새로고침
          </Button>
          <Button variant="outline" shape="pill" size="large" onClick={() => { window.location.href = '/' }}>
            홈으로 가기
          </Button>
        </ErrorPage>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
