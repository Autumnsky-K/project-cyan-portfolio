import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import CartNavLink from '../../features/cart/CartNavLink'
import './Header.css'

const NAV_ITEMS = [
  { label: 'Artists', to: '/artists' },
  { label: 'Goods', to: '/goods' },
  { label: 'Cart', to: '/cart' },
  { label: 'Mypage', to: '/mypage' },
]

function isCurrentPath(pathname: string, to: string) {
  return pathname === to || pathname.startsWith(`${to}/`)
}

export default function Header() {
  const { pathname } = useLocation()
  const currentItem = NAV_ITEMS.find((item) => isCurrentPath(pathname, item.to))
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  return (
    <header className="site-header">
      <div>
        <p className="site-eyebrow">Cyan</p>
        <h1>
          {currentItem?.to === '/goods' ? (
            <Link className="site-title-link" to="/goods" state={{ resetGoodsList: Date.now() }}>Goods</Link>
          ) : (
            currentItem?.label ?? 'Store'
          )}
        </h1>
      </div>
      <button
        className="site-menu-button"
        type="button"
        aria-label={isMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
        aria-expanded={isMenuOpen}
        aria-controls="site-navigation"
        onClick={() => setIsMenuOpen((value) => !value)}
      >
        <span aria-hidden="true" />
      </button>
      <nav className="site-nav" id="site-navigation" data-open={isMenuOpen} aria-label="Store navigation">
        {NAV_ITEMS.map((item) => {
          const isCurrent = isCurrentPath(pathname, item.to)

          if (item.to === '/cart') {
            return <CartNavLink key={item.to} current={isCurrent} />
          }

          return (
            <Link key={item.to} aria-current={isCurrent ? 'page' : undefined} to={item.to}>
              {item.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
