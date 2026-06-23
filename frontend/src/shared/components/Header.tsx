import { Link, useLocation } from 'react-router-dom'
import CartNavLink from '../../features/cart/CartNavLink'
import './Header.css'

const NAV_ITEMS = [
  { label: 'Artists', to: '/artists' },
  { label: 'Goods', to: '/goods' },
  { label: 'Cart', to: '/cart' },
]

function isCurrentPath(pathname: string, to: string) {
  return pathname === to || pathname.startsWith(`${to}/`)
}

export default function Header() {
  const { pathname } = useLocation()
  const currentItem = NAV_ITEMS.find((item) => isCurrentPath(pathname, item.to))

  return (
    <header className="site-header">
      <div>
        <p className="site-eyebrow">Cyan</p>
        <h1>{currentItem?.label ?? 'Store'}</h1>
      </div>
      <nav className="site-nav" aria-label="Store navigation">
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
