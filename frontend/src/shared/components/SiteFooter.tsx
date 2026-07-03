import { Link } from 'react-router-dom'

import './SiteFooter.css'

const footerSections = [
  {
    title: 'Shop',
    links: [
      { label: '전체 굿즈', to: '/goods' },
      { label: '인기 굿즈', to: '/goods?sort=viewCount%2Cdesc' },
      { label: '장바구니', to: '/cart' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: '로그인', to: '/login' },
      { label: '마이페이지', to: '/mypage' },
      { label: '찜한 굿즈', to: '/likes/goods' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: '고객센터', to: '/support' },
      { label: 'FAQ', to: '/faq' },
      { label: '이용약관', to: '/terms' },
      { label: '제휴 문의', to: '/partnership' },
    ],
  },
  {
    title: 'Policy',
    links: [
      { label: '개인정보 처리방침', to: '/privacy' },
      { label: '상품 목록', to: '/goods' },
      { label: '처음으로', to: '/' },
    ],
  },
]

export default function SiteFooter() {
  return (
    <footer className="site-footer" aria-label="Site footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <Link className="site-footer-title" to="/">Project Cyan Shop</Link>
          <p>공식 굿즈와 고객 안내</p>
          <span>주문, 결제, 배송, 약관 정보를 한 곳에서 확인할 수 있습니다.</span>
        </div>

        <nav className="site-footer-columns" aria-label="Footer navigation">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h2>{section.title}</h2>
              {section.links.map((link) => (
                <Link key={`${section.title}-${link.to}-${link.label}`} to={link.to}>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="site-footer-bottom">
          <span>CYAN PRODUCTION</span>
          <span>Customer information updated 2026.07.03</span>
        </div>
      </div>
    </footer>
  )
}
