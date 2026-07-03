import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { removeGoodsLike } from '../../api/goods'
import Button from '../../shared/components/Button'
import AsyncState from '../../shared/components/AsyncState'
import Modal from '../../shared/components/Modal'
import {
  createSupportInquiry,
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
  return item.orderId ?? item.goodsId ?? item.artistId ?? item.inquiryId
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
          <span className="mypage-image-fallback" aria-hidden="true" />
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

function DashboardSection({ id, title, items, onMore, actionLabel = '더보기', onWrite, writeLabel = '문의하기' }) {
  const startIndex = 0
  const visibleItems = items.slice(startIndex, startIndex + SECTION_PAGE_SIZE)
  return (
    <section className="account-panel mypage-section" aria-label={title}>
      <div className="mypage-section-heading">
        <h2>{title}</h2>
        <div className="mypage-section-actions">
          {onWrite && (
            <button className="mypage-more-button" type="button" onClick={onWrite}>
              {writeLabel}
            </button>
          )}
          <button className="mypage-more-button" type="button" onClick={onMore}>
            {actionLabel}
          </button>
        </div>
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
  if (!section) {
    return null
  }

  const isFavoriteArtistSection = section.id === 'favoriteArtists'
  const isLikedGoodsSection = section.id === 'likedGoods'

  return (
    <Modal
      ariaLabelledBy="mypage-modal-title"
      className="mypage-modal"
      open
      overlayClassName="mypage-modal-backdrop"
      onClose={onClose}
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
    </Modal>
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
  if (!form) {
    return null
  }

  if (mode === 'withdraw') {
    return (
      <Modal
        ariaLabelledBy="mypage-withdraw-modal-title"
        className="mypage-modal mypage-profile-modal"
        open
        overlayClassName="mypage-modal-backdrop"
        onClose={onClose}
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
      </Modal>
    )
  }

  return (
    <Modal
      ariaLabelledBy="mypage-profile-modal-title"
      className="mypage-modal mypage-profile-modal"
      open
      overlayClassName="mypage-modal-backdrop"
      onClose={onClose}
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
    </Modal>
  )
}

function SupportInquiryModal({ form, isSaving, onChange, onClose, onSubmit, orders }) {
  if (!form) {
    return null
  }

  return (
    <Modal
      ariaLabelledBy="mypage-support-inquiry-modal-title"
      className="mypage-modal mypage-profile-modal"
      open
      overlayClassName="mypage-modal-backdrop"
      onClose={onClose}
    >
        <form className="account-form mypage-profile-form" onSubmit={onSubmit}>
          <div className="mypage-modal-heading">
            <h2 id="mypage-support-inquiry-modal-title">1:1 문의하기</h2>
            <button type="submit" disabled={isSaving}>
              {isSaving ? '등록 중...' : '등록하기'}
            </button>
          </div>

          <label className="account-field">
            <span>제목</span>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={onChange}
              maxLength={100}
              required
            />
          </label>

          <label className="account-field">
            <span>관련 주문 (선택)</span>
            <select name="orderId" value={form.orderId} onChange={onChange}>
              <option value="">선택 안 함</option>
              {orders.map((order) => (
                <option key={order.orderId} value={order.orderId}>
                  {order.name}
                </option>
              ))}
            </select>
          </label>

          <label className="account-field">
            <span>내용</span>
            <textarea
              name="content"
              value={form.content}
              onChange={onChange}
              rows={6}
              maxLength={1000}
              required
            />
          </label>
        </form>
    </Modal>
  )
}

function MyPage() {
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [selectedSection, setSelectedSection] = useState(null)
  const [allArtistOptions, setAllArtistOptions] = useState([])
  const [draftFavoriteArtistIds, setDraftFavoriteArtistIds] = useState([])
  const [draftUnlikedGoodsIds, setDraftUnlikedGoodsIds] = useState(() => new Set())
  const [isSavingFavorites, setIsSavingFavorites] = useState(false)
  const [profileForm, setProfileForm] = useState(null)
  const [profileModalMode, setProfileModalMode] = useState('edit')
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [supportInquiryForm, setSupportInquiryForm] = useState(null)
  const [isSavingSupportInquiry, setIsSavingSupportInquiry] = useState(false)

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
      navigate('/')
    } catch (logoutError) {
      console.error(logoutError)
      setError('로그아웃하지 못했습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  const openSupportInquiryForm = () => {
    setError('')
    setMessage('')
    setSupportInquiryForm({ title: '', content: '', orderId: '' })
  }

  const closeSupportInquiryForm = () => {
    setSupportInquiryForm(null)
  }

  const handleSupportInquiryChange = (event) => {
    const { name, value } = event.target

    setSupportInquiryForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  const handleSubmitSupportInquiry = async (event) => {
    event.preventDefault()

    if (!supportInquiryForm) {
      return
    }

    setError('')
    setMessage('')
    setIsSavingSupportInquiry(true)

    try {
      await createSupportInquiry(
        supportInquiryForm.title.trim(),
        supportInquiryForm.content.trim(),
        supportInquiryForm.orderId ? Number(supportInquiryForm.orderId) : null,
      )
      const nextSummary = await getMyPageSummary()
      setSummary(nextSummary)
      setSupportInquiryForm(null)
      setMessage('문의가 등록되었습니다.')
    } catch (submitError) {
      console.error(submitError)
      setError(submitError.message || '문의를 등록하지 못했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsSavingSupportInquiry(false)
    }
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
      <AsyncState
        className="account-shell account-card account-panel"
        kind="loading"
        title="마이페이지 정보를 불러오는 중입니다."
      />
    )
  }

  if (!summary) {
    return (
      <AsyncState
        actions={<div className="account-actions">
            <Button className="account-button" shape="pill" size="large" onClick={() => navigate('/login')}>
              로그인으로 이동
            </Button>
          </div>}
        className="account-shell account-card account-panel"
        kind="error"
        message={error || '잠시 후 다시 시도해주세요.'}
        title="마이페이지 정보를 불러오지 못했습니다."
      />
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
                onMore={() => openSection(section)}
                actionLabel={section.id === 'favoriteArtists' ? '수정하기' : '더보기'}
                onWrite={section.id === 'supportInquiries' ? openSupportInquiryForm : undefined}
              />
            ))}
          </section>
        </div>
      </div>
      <SupportInquiryModal
        form={supportInquiryForm}
        isSaving={isSavingSupportInquiry}
        onChange={handleSupportInquiryChange}
        onClose={closeSupportInquiryForm}
        onSubmit={handleSubmitSupportInquiry}
        orders={summary.orders}
      />
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
