import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import CartNavLink from '../../features/cart/CartNavLink'
import IconButton from './IconButton'
import './Header.css'

const NAV_ITEMS = [
  { label: 'Artists', to: '/artists' },
  { label: 'Goods', to: '/goods' },
  { label: 'Cart', to: '/cart' },
  { label: 'Mypage', to: '/mypage' },
]

function isCurrentPath(pathname: string, to: string) {
  if (to === '/') return pathname === '/'
  return pathname === to || pathname.startsWith(`${to}/`)
}

type HeaderProps = {
  tone?: 'surface' | 'immersive'
}

export default function Header({ tone = 'surface' }: HeaderProps) {
  const { pathname } = useLocation()
  const [openMenuPath, setOpenMenuPath] = useState<string | null>(null)
  const isMenuOpen = openMenuPath === pathname

  return (
    <header className="site-header" data-tone={tone}>
      <div className="site-header-inner">
        <div className="site-brand">
          <Link className="site-brand-home" to="/" aria-label="Project Cyan 홈으로 이동">
            <img src="/favicon.svg" alt="" />
            <span>PROJECT CYAN</span>
          </Link>
          {/* <p className="site-page-title">
            {currentItem?.label}
          </p> */}
        </div>
        <IconButton
          className="site-menu-button"
          aria-expanded={isMenuOpen}
          aria-controls="site-navigation"
          icon={<span className="site-menu-icon" />}
          label={isMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
          onClick={() => setOpenMenuPath((currentPath) => currentPath === pathname ? null : pathname)}
          size="medium"
        />
        <nav className="site-nav" id="site-navigation" data-open={isMenuOpen} aria-label="주요 메뉴">
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
      </div>
    </header>
  )
}
