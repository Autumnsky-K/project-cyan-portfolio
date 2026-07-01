import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

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
        <section aria-live="polite">
          <p>Checking your login status...</p>
        </section>
      </main>
    )
  }

  if (!isAuthenticated) {
    return (
      <main className="cart-access-gate">
        <section>
          <h1>Login required</h1>
          <p>Please log in to continue checkout.</p>
          <button type="button" onClick={() => requestCartLogin(navigate)}>
            Go to login
          </button>
        </section>
      </main>
    )
  }

  return children
}
