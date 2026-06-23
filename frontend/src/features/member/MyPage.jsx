import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getMyPageSummary, logoutMember } from './member'
import './AccountPages.css'

const SECTION_PAGE_SIZE = 4

function maskAddress(address) {
  if (!address) {
    return '등록된 주소가 없습니다.'
  }

  const addressWords = address.trim().split(/\s+/)

  if (addressWords.length <= 2) {
    return `${addressWords[0]} **`
  }

  return `${addressWords.slice(0, 2).join(' ')} **`
}

function formatPrice(price) {
  if (typeof price !== 'number') {
    return null
  }

  return `${price.toLocaleString('ko-KR')}원`
}

function getItemMeta(item) {
  return formatPrice(item.price) ?? item.status ?? ''
}

function DashboardItemCard({ item }) {
  return (
    <article className="mypage-item-card">
      <div className="mypage-item-image" aria-hidden="true">
        이미지
      </div>
      <div className="mypage-item-body">
        <h3>{item.name}</h3>
        {getItemMeta(item) && <p className="mypage-item-meta">{getItemMeta(item)}</p>}
        <p>{item.description}</p>
      </div>
    </article>
  )
}

function DashboardSection({ title, items, pageIndex, onNext, onPrevious, onMore }) {
  const startIndex = pageIndex * SECTION_PAGE_SIZE
  const visibleItems = items.slice(startIndex, startIndex + SECTION_PAGE_SIZE)
  const canGoPrevious = pageIndex > 0
  const canGoNext = startIndex + SECTION_PAGE_SIZE < items.length

  return (
    <section className="account-panel mypage-section" aria-label={title}>
      <div className="mypage-section-heading">
        <h2>{title}</h2>
        <button className="mypage-more-button" type="button" onClick={onMore}>
          더보기
        </button>
      </div>

      <div className="mypage-carousel">
        {canGoPrevious && (
          <button
            className="mypage-arrow mypage-arrow-left"
            type="button"
            aria-label={`${title} 이전 항목`}
            onClick={onPrevious}
          >
            ‹
          </button>
        )}

        <div className="mypage-card-row">
          {visibleItems.map((item) => (
            <DashboardItemCard item={item} key={item.orderId ?? item.goodsId ?? item.artistId} />
          ))}
        </div>

        {canGoNext && (
          <button
            className="mypage-arrow mypage-arrow-right"
            type="button"
            aria-label={`${title} 다음 항목`}
            onClick={onNext}
          >
            ›
          </button>
        )}
      </div>
    </section>
  )
}

function SectionModal({ section, onClose }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  if (!section) {
    return null
  }

  return (
    <div
      className="mypage-modal-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="mypage-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mypage-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mypage-modal-heading">
          <h2 id="mypage-modal-title">{section.title}</h2>
          <button type="button" onClick={onClose} aria-label="닫기">
            닫기
          </button>
        </div>
        <div className="mypage-modal-grid">
          {section.items.map((item) => (
            <DashboardItemCard item={item} key={item.orderId ?? item.goodsId ?? item.artistId} />
          ))}
        </div>
      </section>
    </div>
  )
}

function MyPage() {
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [sectionPages, setSectionPages] = useState({})
  const [selectedSection, setSelectedSection] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadSummary() {
      try {
        const myPageSummary = await getMyPageSummary()

        if (!myPageSummary) {
          navigate('/login')
          return
        }

        if (isMounted) {
          setSummary(myPageSummary)
        }
      } catch (loadError) {
        console.error(loadError)

        if (isMounted) {
          setError('마이페이지 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadSummary()

    return () => {
      isMounted = false
    }
  }, [navigate])

  const handleEditProfile = () => {
    setError('')
    setMessage('프로필 수정 기능은 준비 중입니다.')
  }

  const handleWithdraw = () => {
    setError('')
    setMessage('회원 탈퇴 기능은 준비 중입니다.')
  }

  const handleLogout = async () => {
    setMessage('')
    setError('')

    try {
      await logoutMember()
      navigate('/login')
    } catch (logoutError) {
      console.error(logoutError)
      setError('로그아웃하지 못했습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  const handleSectionMove = (sectionId, direction) => {
    setSectionPages((currentPages) => ({
      ...currentPages,
      [sectionId]: Math.max(0, (currentPages[sectionId] ?? 0) + direction),
    }))
  }

  if (isLoading) {
    return (
      <main className="account-page">
        <section className="account-shell account-card account-panel">
          <p className="mypage-empty">마이페이지 정보를 불러오는 중입니다.</p>
        </section>
      </main>
    )
  }

  if (!summary) {
    return null
  }

  const dashboardSections = [
    {
      id: 'orders',
      title: '구매내역',
      items: summary.orders,
    },
    {
      id: 'recentlyViewedGoods',
      title: '최근본상품',
      items: summary.recentlyViewedGoods,
    },
    {
      id: 'favoriteArtists',
      title: '관심 아티스트',
      items: summary.favoriteArtists,
    },
    {
      id: 'likedGoods',
      title: '찜한상품',
      items: summary.likedGoods,
    },
  ]

  return (
    <main className="account-page">
      <div className="account-shell">
        <nav className="account-topbar" aria-label="마이페이지 이동">
          <Link to="/likes/artists">관심 아티스트</Link>
          <Link to="/goods">굿즈</Link>
        </nav>

        <section className="account-card">
          <div className="account-panel">
            <div className="mypage-profile">
              <div className="mypage-avatar" aria-hidden="true">
                {summary.member.grade}
              </div>
              <div className="mypage-profile-text">
                <h1>{summary.member.name}님</h1>
                <p>{summary.member.grade} 등급</p>
              </div>
              <button
                className="mypage-edit-link"
                type="button"
                onClick={handleEditProfile}
              >
                수정하기
              </button>
              <button
                className="mypage-edit-link"
                type="button"
                onClick={handleLogout}
              >
                로그아웃
              </button>
            </div>

            {error && (
              <p className="account-feedback account-feedback-error" role="alert">
                {error}
              </p>
            )}

            {message && (
              <p className="account-feedback account-feedback-success" role="status">
                {message}
              </p>
            )}

            <dl className="mypage-profile-list">
              <div>
                <dt>이메일</dt>
                <dd>{summary.member.email ?? '이메일 정보 없음'}</dd>
              </div>
              <div>
                <dt>비밀번호 변경일</dt>
                <dd>{summary.member.passwordUpdatedAt ?? '변경 이력 없음'}</dd>
              </div>
              <div>
                <dt>주소</dt>
                <dd>{maskAddress(summary.member.address)}</dd>
              </div>
            </dl>
          </div>

          {dashboardSections.map((section) => (
            <DashboardSection
              key={section.id}
              title={section.title}
              items={section.items}
              pageIndex={sectionPages[section.id] ?? 0}
              onPrevious={() => handleSectionMove(section.id, -1)}
              onNext={() => handleSectionMove(section.id, 1)}
              onMore={() => setSelectedSection(section)}
            />
          ))}
        </section>
        <div className="mypage-withdraw">
          <button type="button" onClick={handleWithdraw}>
            탈퇴하기
          </button>
        </div>
      </div>
      <SectionModal section={selectedSection} onClose={() => setSelectedSection(null)} />
    </main>
  )
}

export default MyPage
