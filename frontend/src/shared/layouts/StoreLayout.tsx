import { Outlet, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import './StoreLayout.css'

export default function StoreLayout() {
  const { pathname } = useLocation()

  const pageClassName =
    pathname === '/cart'
      ? 'cart-page'
      : pathname === '/mypage'
        ? 'account-page mypage-page'
        : 'goods-page'

  return (
    <div className="store-shell">
      <Header />
      <main className={`store-main ${pageClassName}`}>
        <Outlet />
      </main>
    </div>
  )
}
