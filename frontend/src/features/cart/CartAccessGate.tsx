import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../shared/components/Button'
import AsyncState from '../../shared/components/AsyncState'

import { requestCartLogin } from './requestCartLogin'
import { useCart } from './useCart'
import './cart-access-gate.css'

type CartAccessGateProps = {
  children: ReactNode
}

export default function CartAccessGate({ children }: CartAccessGateProps) {
  const navigate = useNavigate()
  const { authLoading, isAuthenticated } = useCart()

  if (authLoading) {
    return (
      <main className="cart-access-gate">
        <AsyncState kind="loading" title="로그인 상태를 확인하고 있습니다..." />
      </main>
    )
  }

  if (!isAuthenticated) {
    return (
      <main className="cart-access-gate">
        <AsyncState
          actions={<Button variant="primary" onClick={() => requestCartLogin(navigate)}>로그인하러 가기</Button>}
          kind="info"
          message="결제를 계속하려면 로그인해 주세요."
          title="로그인이 필요합니다"
        />
      </main>
    )
  }

  return children
}
