import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { removeGoodsLike } from '../../api/goods'
import {
  getArtistOptions,
  getMyPageSummary,
  logoutMember,
  saveFavoriteArtists,
  updateMemberProfile,
  withdrawMember,
} from './member'
import AccountFeedbackPopup from './AccountFeedbackPopup'
import { openKakaoPostcode } from './kakaoPostcode'
import './AccountPages.css'

const SECTION_PAGE_SIZE = 4

function isSameArtistId(firstArtistId, secondArtistId) {
  return String(firstArtistId) === String(secondArtistId)
}

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

function getDeliveryLabel(item) {
  if (item.status?.includes('배송 완료')) {
    return '배송완료'
  }

  if (item.status?.includes('배송중')) {
    return '배송중'
  }

  return '준비중'
}

function formatPhoneNumber(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11)

  if (digits.length <= 3) {
    return digits
  }

  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
}

function getDashboardItemKey(item) {
  return item.orderId ?? item.goodsId ?? item.artistId ?? item.paymentId ?? item.refundId ?? item.inquiryId
}

function isSameGoodsId(firstGoodsId, secondGoodsId) {
  return String(firstGoodsId) === String(secondGoodsId)
}

function DashboardItemCard({ item, isLikedGoods = false, isLikeSelected = true, onToggleLike }) {
  const canToggleLike = isLikedGoods && typeof onToggleLike === 'function'

  return (
    <article className={`mypage-item-card ${isLikedGoods ? 'is-liked-goods' : ''}`}>
      <div className="mypage-item-image">
        {canToggleLike && (
          <button
            className="mypage-like-toggle"
            type="button"
            aria-label={isLikeSelected ? `${item.name} 찜 해제` : `${item.name} 찜 유지`}
            aria-pressed={isLikeSelected}
            onClick={(event) => {
              event.stopPropagation()
              onToggleLike?.(item.goodsId)
            }}
          >
            <span className="mypage-heart-icon" data-filled={isLikeSelected} aria-hidden="true" />
          </button>
        )}
        {item.imageUrl ? (
          <img src={item.imageUrl} alt="" />
        ) : (
          <span aria-hidden="true">이미지</span>
        )}
      </div>
      <div className="mypage-item-body">
        <h3>{item.name}</h3>
        {getItemMeta(item) && <p className="mypage-item-meta">{getItemMeta(item)}</p>}
        <p>{item.description}</p>
      </div>
    </article>
  )
}

function OrderHistoryCard({ item }) {
  return (
    <article className="mypage-item-card mypage-order-card">
      <div className="mypage-item-image" aria-hidden="true">
        {item.imageUrl ? <img src={item.imageUrl} alt="" /> : '이미지'}
      </div>
      <div className="mypage-item-body">
        <h3>{item.name}</h3>
        {item.status && <p className="mypage-item-meta">{item.status}</p>}
        <p>{item.description}</p>
        <div className="mypage-order-actions" aria-label={`${item.name} 구매 작업`}>
          <button type="button">{getDeliveryLabel(item)}</button>
          <button type="button">{item.confirmAction ?? '구매확정'}</button>
          <button type="button">{item.reviewAction ?? '리뷰작성'}</button>
        </div>
      </div>
    </article>
  )
}

function PaymentHistoryRow({ payment, isExpanded, onToggle }) {
  return (
    <article className={`mypage-payment-row ${isExpanded ? 'is-expanded' : ''}`}>
      <button
        className="mypage-payment-summary"
        type="button"
        aria-expanded={isExpanded}
        onClick={onToggle}
      >
        <span>
          <strong>결제 금액</strong>
          {formatPrice(payment.price)}
        </span>
        <span>
          <strong>결제 수단</strong>
          {payment.method}
        </span>
        <span>
          <strong>영수증</strong>
          {payment.receipt}
        </span>
        <span>
          <strong>환불 내역</strong>
          {payment.refundHistory}
        </span>
      </button>

      {isExpanded && (
        <div className="mypage-payment-products">
          {payment.products?.map((product) => (
            <article className="mypage-payment-product" key={product.goodsId}>
              <div className="mypage-payment-product-image" aria-hidden="true">
                이미지
              </div>
              <div>
                <h3>{product.name}</h3>
                <p>{formatPrice(product.price)} · {product.quantity}개</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </article>
  )
}

function PaymentHistorySection({ title, items, expandedPaymentIds, onTogglePayment, onMore, actionLabel = '더보기' }) {
  return (
    <section className="account-panel mypage-section" aria-label={title}>
      <div className="mypage-section-heading">
        <h2>{title}</h2>
        <button className="mypage-more-button" type="button" onClick={onMore}>
          {actionLabel}
        </button>
      </div>

      <div className="mypage-payment-list">
        {items.length > 0 ? (
          items.map((payment) => (
            <PaymentHistoryRow
              payment={payment}
              isExpanded={expandedPaymentIds.has(payment.paymentId)}
              key={payment.paymentId}
              onToggle={() => onTogglePayment(payment.paymentId)}
            />
          ))
        ) : (
          <p className="mypage-empty">표시할 항목이 없습니다.</p>
        )}
      </div>
    </section>
  )
}

function DashboardSection({ id, title, items, onMore, actionLabel = '더보기', expandedPaymentIds, onTogglePayment }) {
  if (id === 'payments') {
    return (
      <PaymentHistorySection
        title={title}
        items={items}
        expandedPaymentIds={expandedPaymentIds}
        onMore={onMore}
        onTogglePayment={onTogglePayment}
        actionLabel={actionLabel}
      />
    )
  }

  const startIndex = 0
  const visibleItems = items.slice(startIndex, startIndex + SECTION_PAGE_SIZE)
  return (
    <section className="account-panel mypage-section" aria-label={title}>
      <div className="mypage-section-heading">
        <h2>{title}</h2>
        <button className="mypage-more-button" type="button" onClick={onMore}>
          {actionLabel}
        </button>
      </div>

      <div className="mypage-carousel">
        <div className="mypage-card-row">
          {visibleItems.length > 0 ? (
            visibleItems.map((item) => (
              id === 'orders' ? (
                <OrderHistoryCard item={item} key={item.orderId} />
              ) : (
                <DashboardItemCard
                  item={item}
                  isLikedGoods={id === 'likedGoods'}
                  key={getDashboardItemKey(item)}
                />
              )
            ))
          ) : (
            <p className="mypage-empty">표시할 항목이 없습니다.</p>
          )}
        </div>
      </div>
    </section>
  )
}

function SectionModal({
  allArtistOptions,
  draftFavoriteArtistIds,
  draftUnlikedGoodsIds,
  isSavingFavorites,
  onClose,
  onSaveFavoriteArtists,
  onToggleFavoriteArtist,
  onToggleLikedGoods,
  section,
}) {
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

  const isFavoriteArtistSection = section.id === 'favoriteArtists'
  const isLikedGoodsSection = section.id === 'likedGoods'

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
          <button
            type="button"
            onClick={isFavoriteArtistSection ? onSaveFavoriteArtists : onClose}
            aria-label={isFavoriteArtistSection ? '저장' : '닫기'}
            disabled={isSavingFavorites}
          >
            {isFavoriteArtistSection && isSavingFavorites
              ? '저장 중...'
              : isFavoriteArtistSection
                ? '저장하기'
                : '닫기'}
          </button>
        </div>
        {isFavoriteArtistSection ? (
          <div className="mypage-artist-edit-grid">
            {allArtistOptions.map((artist) => {
              const isSelected = draftFavoriteArtistIds.some((artistId) =>
                isSameArtistId(artistId, artist.artistId),
              )

              return (
                <button
                  className={`mypage-item-card mypage-artist-edit-card ${isSelected ? 'is-selected' : ''}`}
                  type="button"
                  key={artist.artistId}
                  onClick={() => onToggleFavoriteArtist(artist.artistId)}
                  aria-pressed={isSelected}
                >
                  <div className="mypage-item-image" aria-hidden="true">
                    이미지
                  </div>
                  <div className="mypage-item-body">
                    <h3>{artist.name}</h3>
                    <p className="mypage-item-meta">
                      {isSelected ? '선택됨' : '선택 가능'}
                    </p>
                    <p>{artist.name} 공식 굿즈와 새 소식을 모아볼 수 있습니다.</p>
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="mypage-modal-grid">
            {section.items.map((item) => (
              <DashboardItemCard
                item={item}
                isLikedGoods={isLikedGoodsSection}
                isLikeSelected={
                  !isLikedGoodsSection ||
                  !draftUnlikedGoodsIds.has(String(item.goodsId))
                }
                key={getDashboardItemKey(item)}
                onToggleLike={isLikedGoodsSection ? onToggleLikedGoods : undefined}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function ProfileEditModal({
  form,
  isSaving,
  mode,
  onChange,
  onAddressSearch,
  onClose,
  onConfirmWithdraw,
  isWithdrawing,
  onShowEdit,
  onSubmit,
  onShowWithdraw,
  onChangePassword,
}) {
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

  if (!form) {
    return null
  }

  if (mode === 'withdraw') {
    return (
      <div
        className="mypage-modal-backdrop"
        role="presentation"
        onMouseDown={onClose}
      >
        <section
          className="mypage-modal mypage-profile-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mypage-withdraw-modal-title"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="mypage-modal-heading">
            <h2 id="mypage-withdraw-modal-title">회원 탈퇴</h2>
            <button type="button" onClick={onShowEdit}>
              돌아가기
            </button>
          </div>

          <div className="mypage-withdraw-panel">
            <p className="mypage-withdraw-warning">
              탈퇴하면 계정 정보와 마이페이지 활동 내역을 다시 복구할 수 없습니다.
            </p>
            <ul>
              <li>저장된 개인정보와 관심 아티스트 설정이 삭제됩니다.</li>
              <li>주문, 결제, 배송 이력이 있는 경우 고객 지원 확인이 필요할 수 있습니다.</li>
              <li>탈퇴 후 같은 이메일로 다시 가입하더라도 이전 정보는 이어지지 않습니다.</li>
            </ul>
          </div>

          <div className="mypage-withdraw-actions">
            <button type="button" onClick={onClose}>
              취소
            </button>
            <button type="button" className="is-danger" onClick={onConfirmWithdraw} disabled={isWithdrawing}>
              {isWithdrawing ? '탈퇴 처리 중...' : '탈퇴하기'}
            </button>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div
      className="mypage-modal-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="mypage-modal mypage-profile-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mypage-profile-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <form className="account-form mypage-profile-form" onSubmit={onSubmit}>
          <div className="mypage-modal-heading">
            <h2 id="mypage-profile-modal-title">개인정보 수정</h2>
            <button type="submit" disabled={isSaving}>
              {isSaving ? '저장 중...' : '저장하기'}
            </button>
          </div>

          <label className="account-field">
            <span>이름</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={onChange}
              autoComplete="name"
              required
            />
          </label>

          <label className="account-field">
            <span>휴대폰 번호</span>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={onChange}
              placeholder="010-0000-0000"
              autoComplete="tel"
              required
            />
          </label>

          <label className="account-field">
            <span>주소</span>
            <textarea
              name="address"
              value={form.address}
              onChange={onChange}
              onClick={onAddressSearch}
              autoComplete="street-address"
              required
            />
          </label>

          <div className="mypage-profile-actions">
            <button type="button" onClick={onChangePassword}>
              비밀번호 변경하기
            </button>
            <button type="button" className="is-danger" onClick={onShowWithdraw}>
              탈퇴하기
            </button>
          </div>
        </form>
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
  const [selectedSection, setSelectedSection] = useState(null)
  const [expandedPaymentIds, setExpandedPaymentIds] = useState(() => new Set())
  const [allArtistOptions, setAllArtistOptions] = useState([])
  const [draftFavoriteArtistIds, setDraftFavoriteArtistIds] = useState([])
  const [draftUnlikedGoodsIds, setDraftUnlikedGoodsIds] = useState(() => new Set())
  const [isSavingFavorites, setIsSavingFavorites] = useState(false)
  const [profileForm, setProfileForm] = useState(null)
  const [profileModalMode, setProfileModalMode] = useState('edit')
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)

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
    setMessage('')

    if (!summary) {
      return
    }

    setProfileForm({
      name: summary.member.name ?? '',
      phone: summary.member.phone ?? '',
      address: summary.member.address ?? '',
    })
    setProfileModalMode('edit')
  }

  const handleProfileChange = (event) => {
    const { name, value } = event.target
    const nextValue = name === 'phone' ? formatPhoneNumber(value) : value

    setProfileForm((currentForm) => ({
      ...currentForm,
      [name]: nextValue,
    }))
  }

  const handleProfileAddressSearch = async () => {
    setError('')
    setMessage('')

    try {
      await openKakaoPostcode((address) => {
        setProfileForm((currentForm) => ({
          ...currentForm,
          address,
        }))
      })
    } catch (addressError) {
      setError(addressError.message)
    }
  }

  const handleSaveProfile = async (event) => {
    event.preventDefault()

    if (!profileForm) {
      return
    }

    setError('')
    setMessage('')
    setIsSavingProfile(true)

    try {
      await updateMemberProfile(profileForm)
      const nextSummary = await getMyPageSummary()
      setSummary(nextSummary)
      setProfileForm(null)
      setMessage('개인정보가 저장되었습니다.')
    } catch (saveError) {
      console.error(saveError)
      setError(saveError.message || '개인정보를 저장하지 못했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsSavingProfile(false)
    }
  }

  const showWithdrawConfirmation = () => {
    setError('')
    setMessage('')
    setProfileModalMode('withdraw')
  }

  const handleWithdraw = async () => {
    setError('')
    setMessage('')
    setIsWithdrawing(true)

    try {
      await withdrawMember()
      navigate('/login', { replace: true })
    } catch (withdrawError) {
      console.error(withdrawError)
      setError(withdrawError.message || '회원 탈퇴에 실패했습니다. 잠시 후 다시 시도해주세요.')
      setIsWithdrawing(false)
    }
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

  const togglePayment = (paymentId) => {
    setExpandedPaymentIds((currentIds) => {
      const nextIds = new Set(currentIds)
      if (nextIds.has(paymentId)) {
        nextIds.delete(paymentId)
      } else {
        nextIds.add(paymentId)
      }
      return nextIds
    })
  }

  const openSection = async (section) => {
    setError('')
    setSelectedSection(section)
    setDraftUnlikedGoodsIds(new Set())

    if (section.id !== 'favoriteArtists') {
      return
    }

    setDraftFavoriteArtistIds(section.items.map((artist) => artist.artistId))

    try {
      const artistOptions = await getArtistOptions()
      setAllArtistOptions(artistOptions)
    } catch (loadError) {
      console.error(loadError)
      setError('관심 아티스트 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  const toggleFavoriteArtist = (artistId) => {
    setDraftFavoriteArtistIds((currentArtistIds) =>
      currentArtistIds.some((currentArtistId) => isSameArtistId(currentArtistId, artistId))
        ? currentArtistIds.filter((currentArtistId) => !isSameArtistId(currentArtistId, artistId))
        : [...currentArtistIds, artistId],
    )
  }

  const toggleLikedGoods = (goodsId) => {
    setDraftUnlikedGoodsIds((currentGoodsIds) => {
      const nextGoodsIds = new Set(currentGoodsIds)
      const targetGoodsId = String(goodsId)

      if (nextGoodsIds.has(targetGoodsId)) {
        nextGoodsIds.delete(targetGoodsId)
      } else {
        nextGoodsIds.add(targetGoodsId)
      }

      return nextGoodsIds
    })
  }

  const syncUnlikedGoods = async (goodsIds) => {
    const results = await Promise.allSettled(
      goodsIds.map((goodsId) => removeGoodsLike(goodsId)),
    )

    if (results.some((result) => result.status === 'rejected')) {
      setError('찜한 상품 일부를 해제하지 못했습니다. 새로고침 후 다시 확인해주세요.')
    }
  }

  const closeSection = () => {
    if (selectedSection?.id !== 'likedGoods' || draftUnlikedGoodsIds.size === 0) {
      setSelectedSection(null)
      setDraftUnlikedGoodsIds(new Set())
      return
    }

    const unlikedGoodsIds = [...draftUnlikedGoodsIds]

    setSummary((currentSummary) => {
      if (!currentSummary) {
        return currentSummary
      }

      return {
        ...currentSummary,
        likedGoods: currentSummary.likedGoods.filter(
          (goods) => !unlikedGoodsIds.some((goodsId) => isSameGoodsId(goods.goodsId, goodsId)),
        ),
      }
    })
    setSelectedSection(null)
    setDraftUnlikedGoodsIds(new Set())
    void syncUnlikedGoods(unlikedGoodsIds)
  }

  const handleSaveFavoriteArtists = async () => {
    if (!summary) {
      return
    }

    setError('')
    setMessage('')
    setIsSavingFavorites(true)

    try {
      await saveFavoriteArtists(summary.member.memberId ?? summary.member.userId, draftFavoriteArtistIds)
      const nextSummary = await getMyPageSummary()
      setSummary(nextSummary)
      setSelectedSection(null)
      setMessage('관심 아티스트가 저장되었습니다.')
    } catch (saveError) {
      console.error(saveError)
      setError('관심 아티스트를 저장하지 못했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsSavingFavorites(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <section className="account-shell account-card account-panel">
          <p className="mypage-empty">마이페이지 정보를 불러오는 중입니다.</p>
        </section>
      </>
    )
  }

  if (!summary) {
    return (
      <>
        <section className="account-shell account-card account-panel">
          <p className="account-feedback account-feedback-error" role="alert">
            {error || '마이페이지 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'}
          </p>
          <div className="account-actions">
            <button className="account-button" type="button" onClick={() => navigate('/login')}>
              로그인으로 이동
            </button>
          </div>
        </section>
      </>
    )
  }

  const dashboardSections = [
    {
      id: 'likedGoods',
      title: '찜한상품',
      items: summary.likedGoods,
    },
    {
      id: 'recentlyViewedGoods',
      title: '최근본상품',
      items: summary.recentlyViewedGoods,
    },
    {
      id: 'orders',
      title: '구매내역',
      items: summary.orders,
    },
    {
      id: 'payments',
      title: '결제 내역',
      items: summary.payments,
    },
    {
      id: 'refunds',
      title: '환불 내역',
      items: summary.refunds,
    },
    {
      id: 'productInquiries',
      title: '상품문의 내역',
      items: summary.productInquiries,
    },
    {
      id: 'supportInquiries',
      title: '1:1 문의 내역',
      items: summary.supportInquiries,
    },
    {
      id: 'favoriteArtists',
      title: '관심 아티스트',
      items: summary.favoriteArtists,
    },
  ]

  return (
    <>
      <AccountFeedbackPopup message={error} onDone={() => setError('')} />
      <AccountFeedbackPopup
        message={message}
        type="success"
        onDone={() => setMessage('')}
      />
      <div className="account-shell">
        <div className="mypage-layout">
          <section className="account-card">
            <div className="account-panel">
              <div className="mypage-profile">
                <div className="mypage-profile-text">
                  <h1>{summary.member.name}님</h1>
                  <p>{summary.member.memberGrade || '등급 정보 없음'}</p>
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

              <dl className="mypage-profile-list">
                <div>
                  <dt>이메일</dt>
                  <dd>{summary.member.email ?? '이메일 정보 없음'}</dd>
                </div>
                <div>
                  <dt>휴대폰 번호</dt>
                  <dd>{summary.member.phone ?? '휴대폰 번호 없음'}</dd>
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
                id={section.id}
                key={section.id}
                title={section.title}
                items={section.items}
                expandedPaymentIds={expandedPaymentIds}
                onMore={() => openSection(section)}
                onTogglePayment={togglePayment}
                actionLabel={section.id === 'favoriteArtists' ? '수정하기' : '더보기'}
              />
            ))}
          </section>
        </div>
      </div>
      <SectionModal
        allArtistOptions={allArtistOptions}
        draftFavoriteArtistIds={draftFavoriteArtistIds}
        draftUnlikedGoodsIds={draftUnlikedGoodsIds}
        isSavingFavorites={isSavingFavorites}
        section={selectedSection}
        onClose={closeSection}
        onSaveFavoriteArtists={handleSaveFavoriteArtists}
        onToggleFavoriteArtist={toggleFavoriteArtist}
        onToggleLikedGoods={toggleLikedGoods}
      />
      <ProfileEditModal
        form={profileForm}
        isSaving={isSavingProfile}
        isWithdrawing={isWithdrawing}
        mode={profileModalMode}
        onChange={handleProfileChange}
        onAddressSearch={handleProfileAddressSearch}
        onClose={() => {
          setProfileForm(null)
          setProfileModalMode('edit')
        }}
        onConfirmWithdraw={handleWithdraw}
        onChangePassword={() => {
          setProfileForm(null)
          setProfileModalMode('edit')
          navigate('/reset-password')
        }}
        onShowEdit={() => setProfileModalMode('edit')}
        onSubmit={handleSaveProfile}
        onShowWithdraw={showWithdrawConfirmation}
      />
    </>
  )
}

export default MyPage
