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
        <AsyncState kind="loading" title="Checking your login status..." />
      </main>
    )
  }

  if (!isAuthenticated) {
    return (
      <main className="cart-access-gate">
        <AsyncState
          actions={<Button variant="primary" onClick={() => requestCartLogin(navigate)}>Go to login</Button>}
          kind="info"
          message="Please log in to continue checkout."
          title="Login required"
        />
      </main>
    )
  }

  return children
}
