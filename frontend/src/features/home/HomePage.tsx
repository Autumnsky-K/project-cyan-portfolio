import { type CSSProperties, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { fetchCmsPage, type CmsPage } from '../../api/cms'
import CartNavLink from '../cart/CartNavLink'
import { applyPreviewTheme, previewTypographyStyle } from '../theme/previewTheme'
import './home.css'

const defaultHomePage: CmsPage = {
  pageKey: 'home',
  eyebrow: 'Project Cyan',
  title: 'AI Vtuber Store',
  summaryTitle: 'Full-page shopping experience',
  summaryBody: 'Scroll like a presentation to move through artists, goods, chatbot, and member flows.',
  primaryColor: '#111111',
  accentColor: '#2f6f64',
  backgroundColor: '#ffffff',
  heroImageUrl: null,
}

function HomePage() {
  const [cmsPage, setCmsPage] = useState<CmsPage>(defaultHomePage)

  useEffect(() => {
    const controller = new AbortController()

    async function loadCmsPage() {
      try {
        setCmsPage(await fetchCmsPage('home', { signal: controller.signal }))
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setCmsPage(defaultHomePage)
        }
      }
    }

    loadCmsPage()

    return () => {
      controller.abort()
    }
  }, [])

  const previewPage = applyPreviewTheme(cmsPage)

  const pageStyle = {
    '--home-ink': previewPage.primaryColor,
    '--home-accent': previewPage.accentColor,
    '--home-bg': previewPage.backgroundColor,
    ...previewTypographyStyle(),
  } as CSSProperties

  const heroStyle = previewPage.heroImageUrl
    ? {
        backgroundImage: `linear-gradient(90deg, ${previewPage.backgroundColor} 0%, rgba(255,255,255,.82) 48%, rgba(255,255,255,.18) 100%), url("${previewPage.heroImageUrl}")`,
      }
    : undefined

  return (
    <main className="home-snap-page home-shell-breakout" style={pageStyle}>
      <nav className="home-floating-nav" aria-label="Home navigation">
        <Link to="/" aria-current="page">Home</Link>
        <Link to="/artists">Artists</Link>
        <Link to="/goods">Goods</Link>
        <CartNavLink />
      </nav>

      <section className="home-slide home-hero-slide" style={heroStyle}>
        <div className="home-slide-inner">
          <p>{previewPage.eyebrow}</p>
          <h1>{previewPage.title}</h1>
          <span>{previewPage.summaryBody}</span>
          <div className="home-actions">
            <Link to="/goods">굿즈 보러가기</Link>
            <Link to="/artists">아티스트 탐색</Link>
          </div>
        </div>
      </section>

      <section className="home-slide home-grid-slide">
        <div className="home-slide-inner">
          <p>Artist Universe</p>
          <h2>아티스트를 카드처럼 넘겨보는 팬덤 화면</h2>
          <div className="home-card-grid">
            {['Debut Focus', 'Live Goods', 'Fan Pick'].map((label) => (
              <article key={label}>
                <strong>{label}</strong>
                <span>아티스트 이미지와 소개를 풀페이지 섹션 안에서 보여줍니다.</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-slide home-goods-slide">
        <div className="home-slide-inner">
          <p>Store Preview</p>
          <h2>{previewPage.summaryTitle}</h2>
          <div className="home-product-strip">
            {['Photocard', 'Acrylic Stand', 'Voice Pack', 'Concert Kit'].map((name) => (
              <article key={name}>
                <div>{name}</div>
                <strong>KRW 35,000</strong>
                <span>NEW</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-slide home-ai-slide">
        <div className="home-slide-inner">
          <p>AI Chatbot</p>
          <h2>챗봇이 페이지 이동과 상품 행동을 유도하는 영역</h2>
          <div className="home-ai-panel">
            <strong>추천 상품 보여줘</strong>
            <span>상품 상세 이동, 하이라이트, 장바구니 담기 같은 행동을 연결합니다.</span>
          </div>
        </div>
      </section>
    </main>
  )
}

export default HomePage
