import { supabase, supabaseConfigError } from '../../api/supabaseClient'
import { apiFetch, parseApiResponse } from '../../shared/api/springApiClient'

const KAKAO_LOGIN_SCOPES = 'profile_nickname profile_image'
const ACCOUNT_NOT_FOUND_MESSAGE = '계정을 찾을 수 없습니다. 먼저 회원가입을 진행해 주세요.'
const MY_PAGE_SECTION_LIMIT = 20


const MY_PAGE_DUMMY_DATA = {
  orders: [
    {
      orderId: 101,
      name: 'aespa OFFICIAL LIGHT STICK',
      status: '배송 준비중',
      description: '응원봉 단독 주문 · 2026.06.18 결제',
      deliveryAction: '배송조회',
      confirmAction: '구매확정',
      reviewAction: '리뷰작성',
    },
    {
      orderId: 102,
      name: 'RIIZE PHOTOBOOK SET',
      status: '배송 완료',
      description: '포토북 + 포토카드 세트 · 2026.06.12 도착',
      deliveryAction: '배송조회',
      confirmAction: '구매확정',
      reviewAction: '리뷰작성',
    },
    {
      orderId: 103,
      name: 'NCT DREAM MD PACKAGE',
      status: '결제 완료',
      description: '예약 상품 · 2026.07.02 출고 예정',
      deliveryAction: '배송조회',
      confirmAction: '구매확정',
      reviewAction: '리뷰작성',
    },
    {
      orderId: 104,
      name: 'Red Velvet MINI BAG',
      status: '구매 확정',
      description: '공식 굿즈 스토어 구매 · 리뷰 작성 가능',
      deliveryAction: '배송조회',
      confirmAction: '구매확정',
      reviewAction: '리뷰작성',
    },
    {
      orderId: 105,
      name: 'SHINee ANNIVERSARY KIT',
      status: '배송중',
      description: '한정판 키트 · 오늘 오후 도착 예정',
      deliveryAction: '배송조회',
      confirmAction: '구매확정',
      reviewAction: '리뷰작성',
    },
    {
      orderId: 106,
      name: 'EXO POSTCARD BOOK',
      status: '취소 완료',
      description: '환불 처리 완료 · 재입고 알림 신청 가능',
      deliveryAction: '배송조회',
      confirmAction: '구매확정',
      reviewAction: '리뷰작성',
    },
  ],
  recentlyViewedGoods: [
    {
      goodsId: 201,
      name: 'aespa Drama Hoodie',
      price: 69000,
      description: '무대 의상 무드의 블랙 후디',
    },
    {
      goodsId: 202,
      name: 'RIIZE Lucky Photocard',
      price: 15000,
      description: '랜덤 포토카드 3종 구성',
    },
    {
      goodsId: 203,
      name: 'NCT WISH Keyring',
      price: 22000,
      description: '가방에 달기 좋은 아크릴 키링',
    },
    {
      goodsId: 204,
      name: 'Red Velvet Cup Set',
      price: 32000,
      description: '데일리로 쓰기 좋은 컵 2종',
    },
    {
      goodsId: 205,
      name: 'SHINee Photo Binder',
      price: 28000,
      description: '포토카드 보관용 4포켓 바인더',
    },
    {
      goodsId: 206,
      name: 'EXO Travel Pouch',
      price: 24000,
      description: '작은 소지품을 담는 투명 파우치',
    },
  ],
  likedGoods: [
    {
      goodsId: 301,
      name: 'SMTOWN Live T-shirt',
      price: 42000,
      description: '콘서트 현장감이 담긴 투어 티셔츠',
    },
    {
      goodsId: 302,
      name: 'aespa Armageddon Poster',
      price: 18000,
      description: '메탈릭 인쇄 포스터 세트',
    },
    {
      goodsId: 303,
      name: 'NCT DREAM Sticker Pack',
      price: 12000,
      description: '노트북 꾸미기 좋은 스티커 12종',
    },
    {
      goodsId: 304,
      name: 'RIIZE Mini Doll',
      price: 36000,
      description: '책상 위에 두기 좋은 미니 인형',
    },
    {
      goodsId: 305,
      name: 'Red Velvet Velvet Case',
      price: 26000,
      description: '부드러운 질감의 휴대폰 케이스',
    },
    {
      goodsId: 306,
      name: 'SHINee Desk Calendar',
      price: 19000,
      description: '월별 콘셉트 컷이 담긴 캘린더',
    },
  ],
  payments: [
    {
      paymentId: 401,
      name: 'ORD20260618-0001',
      status: 'APPROVED',
      price: 69000,
      paidAt: '2026.06.18',
      method: '카카오페이',
      receipt: '영수증 보기',
      refundHistory: '환불 내역 없음',
      description: '카카오페이 · 2026.06.18 결제 완료',
      products: [
        {
          goodsId: 201,
          name: 'aespa OFFICIAL LIGHT STICK',
          price: 69000,
          quantity: 1,
        },
      ],
    },
    {
      paymentId: 402,
      name: 'ORD20260612-0007',
      status: 'APPROVED',
      price: 87000,
      paidAt: '2026.06.12',
      method: '00은행 체크카드',
      receipt: '영수증 보기',
      refundHistory: '환불 내역 없음',
      description: '카드 간편결제 · 2026.06.12 결제 완료',
      products: [
        {
          goodsId: 202,
          name: 'RIIZE PHOTOBOOK SET',
          price: 54000,
          quantity: 1,
        },
        {
          goodsId: 203,
          name: 'RIIZE Lucky Photocard',
          price: 33000,
          quantity: 1,
        },
      ],
    },
    {
      paymentId: 403,
      name: 'ORD20260603-0012',
      status: 'READY',
      price: 42000,
      paidAt: '2026.06.03',
      method: '카카오페이',
      receipt: '영수증 대기',
      refundHistory: '환불 내역 없음',
      description: '결제 대기 · 주문서 확인 필요',
      products: [
        {
          goodsId: 204,
          name: 'SMTOWN Live T-shirt',
          price: 42000,
          quantity: 1,
        },
      ],
    },
  ],
  refunds: [
    {
      refundId: 501,
      name: 'EXO POSTCARD BOOK',
      status: '환불 완료',
      price: 18000,
      description: '2026.06.16 취소 접수 · 2026.06.17 환불 완료',
    },
    {
      refundId: 502,
      name: 'NCT DREAM MD PACKAGE',
      status: '검토 중',
      price: 54000,
      description: '2026.06.26 환불 요청 · 고객센터 확인 중',
    },
  ],
  productInquiries: [
    {
      inquiryId: 601,
      name: 'aespa Drama Hoodie',
      status: '답변 완료',
      description: '사이즈 재입고 일정 문의 · 2026.06.20',
    },
    {
      inquiryId: 602,
      name: 'RIIZE Lucky Photocard',
      status: '접수',
      description: '구성품 중복 가능 여부 문의 · 2026.06.27',
    },
  ],
  supportInquiries: [
    {
      inquiryId: 701,
      name: '배송지 변경 요청',
      status: '처리 완료',
      description: '주문 ORD20260618-0001 · 2026.06.19',
    },
    {
      inquiryId: 702,
      name: '회원 정보 수정 문의',
      status: '답변 대기',
      description: '휴대폰 번호 인증 관련 · 2026.06.28',
    },
  ],
}

function checkSupabaseConfig() {
  if (supabaseConfigError) {
    throw new Error(supabaseConfigError)
  }
}

function getStorageKey(userId, name) {
  return `project-cyan:${userId}:${name}`
}

function readStoredJson(key, fallbackValue) {
  try {
    const storedValue = window.localStorage.getItem(key)

    return storedValue ? JSON.parse(storedValue) : fallbackValue
  } catch {
    return fallbackValue
  }
}

function writeStoredJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

function pickAddressFromRow(row) {
  if (!row) {
    return ''
  }

  return (
    row.address ??
    row.address_line ??
    row.address1 ??
    row.road_address ??
    row.detail_address ??
    ''
  )
}

function formatDateLabel(value) {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function formatOrderStatus(status) {
  const statusLabels = {
    PENDING: '결제 대기',
    PAID: '결제 완료',
    PREPARING: '배송 준비중',
    SHIPPED: '배송중',
    DONE: '배송 완료',
    CANCELED: '취소 완료',
  }

  return statusLabels[status] ?? status ?? '주문 상태 확인 중'
}

function getFirstOrderItem(items) {
  return Array.isArray(items) && items.length > 0 ? items[0] : null
}

function normalizeGoodsSummary(goods, fallback = {}) {
  return {
    goodsId: goods?.goods_id ?? goods?.goodsId ?? fallback.goodsId,
    name:
      goods?.goods_name ??
      goods?.goodsName ??
      fallback.name ??
      '상품명 확인 중',
    price: Number(goods?.price ?? fallback.price ?? 0),
    imageUrl: goods?.main_image_url ?? goods?.imageUrl ?? fallback.imageUrl ?? '',
    description:
      fallback.description ??
      goods?.description ??
      '상품 정보를 확인해 주세요.',
  }
}

async function getGoodsByIds(goodsIds) {
  const uniqueGoodsIds = [...new Set(goodsIds.filter(Boolean))]

  if (uniqueGoodsIds.length === 0) {
    return new Map()
  }

  const { data, error } = await supabase
    .from('goods')
    .select('goods_id, goods_name, price, description, main_image_url')
    .in('goods_id', uniqueGoodsIds)

  if (error) {
    console.warn(error)
    return new Map()
  }

  return new Map(data.map((goods) => [goods.goods_id, goods]))
}

async function getMyPageOrders(memberId) {
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('order_id, order_no, order_status, total_amount, ordered_at')
    .eq('member_id', memberId)
    .order('ordered_at', { ascending: false })
    .limit(MY_PAGE_SECTION_LIMIT)

  if (ordersError) {
    console.warn(ordersError)
    return []
  }

  if (!orders || orders.length === 0) {
    return []
  }

  const orderIds = orders.map((order) => order.order_id)
  const { data: orderItems, error: orderItemsError } = await supabase
    .from('order_item')
    .select('order_id, order_item_id, goods_id, goods_name, artist_name, unit_price, quantity, item_total_amount, main_image_url')
    .in('order_id', orderIds)
    .order('order_item_id', { ascending: true })

  if (orderItemsError) {
    console.warn(orderItemsError)
  }

  const itemsByOrderId = new Map()

  for (const item of orderItems ?? []) {
    const items = itemsByOrderId.get(item.order_id) ?? []
    items.push(item)
    itemsByOrderId.set(item.order_id, items)
  }

  return orders.map((order) => {
    const items = itemsByOrderId.get(order.order_id) ?? []
    const firstItem = getFirstOrderItem(items)
    const extraItemCount = Math.max(items.length - 1, 0)
    const orderedAt = formatDateLabel(order.ordered_at)
    const orderStatus = formatOrderStatus(order.order_status)

    return {
      orderId: order.order_id,
      name: firstItem
        ? `${firstItem.goods_name}${extraItemCount > 0 ? ` 외 ${extraItemCount}건` : ''}`
        : order.order_no ?? `주문 #${order.order_id}`,
      status: orderStatus,
      price: Number(order.total_amount ?? firstItem?.item_total_amount ?? 0),
      imageUrl: firstItem?.main_image_url ?? '',
      description: [
        order.order_no ? `주문번호 ${order.order_no}` : null,
        orderedAt ? `${orderedAt} 주문` : null,
        firstItem?.quantity ? `${firstItem.quantity}개` : null,
      ].filter(Boolean).join(' · '),
      deliveryAction: '배송조회',
      confirmAction: '구매확정',
      reviewAction: '리뷰작성',
    }
  })
}

async function getMyPageRecentlyViewedGoods(memberId) {
  const { data, error } = await supabase
    .from('goods_view_history')
    .select('view_history_id, goods_id, viewed_at')
    .eq('member_id', memberId)
    .order('viewed_at', { ascending: false })
    .limit(MY_PAGE_SECTION_LIMIT)

  if (error) {
    console.warn(error)
    return []
  }

  const goodsById = await getGoodsByIds((data ?? []).map((row) => row.goods_id))

  return (data ?? []).map((row) => {
    const viewedAt = formatDateLabel(row.viewed_at)

    return normalizeGoodsSummary(goodsById.get(row.goods_id), {
      goodsId: row.goods_id,
      description: viewedAt ? `${viewedAt}에 본 상품` : '최근 본 상품',
    })
  })
}

async function getMyPageLikedGoods(memberId) {
  const { data, error } = await supabase
    .from('goods_like')
    .select('like_id, goods_id, created_at')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false })
    .limit(MY_PAGE_SECTION_LIMIT)

  if (error) {
    console.warn(error)
    return []
  }

  const goodsById = await getGoodsByIds((data ?? []).map((row) => row.goods_id))

  return (data ?? []).map((row) => {
    const likedAt = formatDateLabel(row.created_at)

    return normalizeGoodsSummary(goodsById.get(row.goods_id), {
      goodsId: row.goods_id,
      description: likedAt ? `${likedAt}에 찜한 상품` : '찜한 상품',
    })
  })
}

async function getMemberGradeFromTable(userId) {
  const { data, error } = await supabase
    .from('member')
    .select('member_grade')
    .eq('member_uuid', userId)
    .maybeSingle()

  if (error) {
    console.warn(error)
    return ''
  }

  return data?.member_grade ?? ''
}

export async function loginMember(form) {
  checkSupabaseConfig()

  // Supabase Auth의 기본 비밀번호 로그인은 이메일을 기준으로 동작합니다.
  const { error } = await supabase.auth.signInWithPassword({
    email: form.email,
    password: form.password,
  })

  if (error) {
    throw new Error(ACCOUNT_NOT_FOUND_MESSAGE)
  }

  try {
    const member = await getCurrentMember()

    if (!member) {
      throw new Error('회원 정보를 확인하지 못했습니다.')
    }

    return { member }
  } catch (memberError) {
    await supabase.auth.signOut()
    throw memberError
  }
}

export async function loginWithKakao() {
  checkSupabaseConfig()

  // 이메일 없는 가입을 허용하기 위해 카카오 동의 항목은 프로필 정보만 요청합니다.
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        scope: KAKAO_LOGIN_SCOPES,
      },
      skipBrowserRedirect: true,
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  if (!data.url) {
    throw new Error('카카오 로그인 주소를 만들지 못했습니다.')
  }

  if (data.url.includes('account_email')) {
    throw new Error('카카오 로그인 요청에 이메일 동의 항목이 포함되어 있습니다.')
  }

  window.location.assign(data.url)
}

export async function exchangeAuthCodeForSession(code) {
  checkSupabaseConfig()

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    throw new Error(error.message)
  }

  if (!data.session) {
    throw new Error('로그인 세션을 만들지 못했습니다.')
  }

  try {
    const member = await getCurrentMember()

    if (!member) {
      throw new Error('회원 정보를 확인하지 못했습니다.')
    }
  } catch (memberError) {
    await supabase.auth.signOut()
    throw memberError
  }

  return data.session
}

export async function signupMember(form) {
  checkSupabaseConfig()

  const response = await apiFetch('/members/signup', {
    method: 'POST',
    body: JSON.stringify({
      email: form.email,
      password: form.password,
      name: form.name,
      phone: form.phone,
      address: form.address,
      agreements: form.agreements,
    }),
  })

  const member = await parseApiResponse(response, '회원가입에 실패했습니다.')
  const { error: loginError } = await supabase.auth.signInWithPassword({
    email: form.email,
    password: form.password,
  })

  if (loginError) {
    throw new Error(`회원가입은 완료됐지만 로그인에 실패했습니다. ${loginError.message}`)
  }

  return {
    member: {
      name: member.name,
      email: member.email,
      userId: member.userId,
    },
  }
}

export async function checkSignupAvailability(form) {
  const response = await apiFetch('/members/signup/availability', {
    method: 'POST',
    body: JSON.stringify({
      email: form.email,
      phone: form.phone,
    }),
  })

  return parseApiResponse(response, '가입 정보 중복 확인에 실패했습니다.')
}

export async function sendPasswordResetEmail(email) {
  const normalizedEmail = email.trim().toLowerCase()
  const response = await apiFetch('/members/password-reset/request', {
    method: 'POST',
    body: JSON.stringify({
      email: normalizedEmail,
    }),
  })

  return parseApiResponse(
    response,
    '비밀번호 재설정 메일을 발송하지 못했습니다.',
  )
}

export async function updateMemberPassword(password, resetToken = '') {
  if (resetToken) {
    await parseApiResponse(
      await apiFetch('/members/password-reset/confirm', {
        method: 'POST',
        body: JSON.stringify({
          token: resetToken,
          password,
        }),
      }),
      '비밀번호를 변경하지 못했습니다.',
    )

    return {
      member: {
        passwordUpdatedAt: new Date().toISOString(),
      },
    }
  }

  checkSupabaseConfig()

  const { data, error } = await supabase.auth.updateUser({ password })

  if (error) {
    throw new Error(error.message)
  }

  if (data.user?.id) {
    writeStoredJson(getStorageKey(data.user.id, 'passwordUpdatedAt'), {
      passwordUpdatedAt: new Date().toISOString(),
    })
  }

  return {
    member: {
      userId: data.user?.id,
      email: data.user?.email,
      passwordUpdatedAt: data.user?.id
        ? readStoredJson(getStorageKey(data.user.id, 'passwordUpdatedAt'), null)
            ?.passwordUpdatedAt
        : null,
    },
  }
}

export async function getCurrentMember() {
  checkSupabaseConfig()

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

  if (sessionError) {
    throw new Error(sessionError.message)
  }

  if (!sessionData.session) {
    return null
  }

  const { data, error } = await supabase.auth.getUser()

  if (error) {
    throw new Error(error.message)
  }

  if (!data.user) {
    return null
  }

  const memberProfile = await parseApiResponse(
    await apiFetch('/members/me'),
    '회원 정보를 불러오지 못했습니다.',
  )
  const role =
    data.user.app_metadata?.role ??
    null
  const memberGrade = memberProfile?.memberGrade || await getMemberGradeFromTable(data.user.id)

  return {
    userId: data.user.id,
    memberId: memberProfile?.memberId ?? null,
    memberUuid: memberProfile?.memberUuid ?? data.user.id,
    email: memberProfile?.email ?? data.user.email,
    phone: memberProfile?.phone ?? data.user.user_metadata?.phone ?? '',
      memberGrade,
      postalCode: memberProfile?.postalCode ?? '',
      address: memberProfile?.address ?? '',
      addressDetail: memberProfile?.addressDetail ?? '',
      deliveryRequest: memberProfile?.deliveryRequest ?? '',
    role,
    isAdmin:
      role === 'ADMIN' ||
      role === 'ROLE_ADMIN' ||
      data.user.app_metadata?.isAdmin === true,
    name:
      memberProfile?.name ??
      data.user.user_metadata?.name ??
      data.user.user_metadata?.full_name ??
      data.user.user_metadata?.nickname ??
      'SM Universe 회원',
  }
}

export async function getArtistOptions() {
  checkSupabaseConfig()

  const { data, error } = await supabase
    .from('artist')
    .select('artist_id, artist_name')
    .order('artist_id', { ascending: true })

  if (error) {
    const cmsArtists = await parseApiResponse(
      await apiFetch('/cms/artists'),
      '관심 아티스트 정보를 불러오지 못했습니다.',
    )

    return (cmsArtists ?? []).map((artist) => ({
      artistId: artist.artistId,
      name: artist.name,
      imageUrl: artist.imageUrl ?? '',
    }))
  }

  return data.map((artist) => ({
    artistId: artist.artist_id,
    name: artist.artist_name,
    imageUrl: '',
  }))
}

async function getMemberId(memberIdOrUserId) {
  if (typeof memberIdOrUserId === 'number') {
    return memberIdOrUserId
  }

  if (typeof memberIdOrUserId === 'string' && /^\d+$/.test(memberIdOrUserId)) {
    return Number(memberIdOrUserId)
  }

  const { data, error } = await supabase
    .from('member')
    .select('member_id')
    .eq('member_uuid', memberIdOrUserId)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data.member_id
}

export async function getFavoriteArtistIds(userId) {
  checkSupabaseConfig()

  const memberId = await getMemberId(userId)

  const { data, error } = await supabase
    .from('member_artist')
    .select('artist_id')
    .eq('member_id', memberId)

  if (error) {
    console.warn(error)
    return []
  }

  return data.map((row) => row.artist_id)
}

export async function saveFavoriteArtists(userId, artistIds) {
  checkSupabaseConfig()

  const memberId = await getMemberId(userId)

  const { error: deleteError } = await supabase
    .from('member_artist')
    .delete()
    .eq('member_id', memberId)

  if (deleteError) {
    throw new Error(deleteError.message)
  }

  if (artistIds.length === 0) {
    return artistIds
  }

  const rows = artistIds.map((artistId) => ({
    member_id: memberId,
    artist_id: artistId,
  }))

  const { error: insertError } = await supabase
    .from('member_artist')
    .insert(rows)
  if (insertError) {
    throw new Error(insertError.message)
  }

  return artistIds
}

export async function getMyPageSummary() {
  const member = await getCurrentMember()

  if (!member) {
    return null
  }

  const favoriteArtistIds = await getFavoriteArtistIds(member.memberId ?? member.userId)
  const artistOptions = await getArtistOptions()
  const favoriteArtistIdSet = new Set(favoriteArtistIds)
  const favoriteArtists = artistOptions.filter((artist) => favoriteArtistIdSet.has(artist.artistId))
  const address = await getMemberAddress(member.memberId ?? member.userId)
  const memberId = await getMemberId(member.memberId ?? member.userId)
  const [orders, recentlyViewedGoods, likedGoods] = await Promise.all([
    getMyPageOrders(memberId),
    getMyPageRecentlyViewedGoods(memberId),
    getMyPageLikedGoods(memberId),
  ])
  const passwordHistory = readStoredJson(
    getStorageKey(member.userId, 'passwordUpdatedAt'),
    null,
  )

  return {
    member: {
      ...member,
      address,
      passwordUpdatedAt: passwordHistory?.passwordUpdatedAt ?? null,
    },
    orders,
    payments: MY_PAGE_DUMMY_DATA.payments,
    refunds: MY_PAGE_DUMMY_DATA.refunds,
    productInquiries: MY_PAGE_DUMMY_DATA.productInquiries,
    supportInquiries: MY_PAGE_DUMMY_DATA.supportInquiries,
    recentlyViewedGoods,
    favoriteArtists: favoriteArtists.map((artist) => ({
      ...artist,
      status: '선택됨',
      description: `${artist.name} 공식 굿즈와 새 소식을 모아볼 수 있습니다.`,
    })),
    likedGoods,
  }
}

export async function updateMemberProfile(form) {
  const response = await apiFetch('/members/me', {
    method: 'PATCH',
    body: JSON.stringify({
      email: form.email,
      name: form.name,
      phone: form.phone,
      address: form.address,
      addressDetail: form.addressDetail,
      deliveryRequest: form.deliveryRequest,
    }),
  })

  return parseApiResponse(response, '개인정보를 저장하지 못했습니다.')
}

export async function logoutMember() {
  checkSupabaseConfig()

  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(error.message)
  }
}

export async function withdrawMember() {
  await parseApiResponse(
    await apiFetch('/members/me', {
      method: 'DELETE',
    }),
    '회원 탈퇴에 실패했습니다.',
  )

  await logoutMember()
}

export async function updateMemberAddress(userId, address) {
  checkSupabaseConfig()

  const memberId = await getMemberId(userId)

  const { error: deleteError } = await supabase
    .from('member_address')
    .delete()
    .eq('member_id', memberId)

  if (deleteError) {
    throw new Error(deleteError.message)
  }

  const { error: insertError } = await supabase
    .from('member_address')
    .insert({
      member_id: memberId,
      address,
    })

  if (insertError) {
    throw new Error(insertError.message)
  }

  return address
}

export async function getMemberAddress(userId) {
  checkSupabaseConfig()

  const memberId = await getMemberId(userId)

  const { data, error } = await supabase
    .from('member_address')
    .select('*')
    .eq('member_id', memberId)
    .limit(1)
    .maybeSingle()

  if (error) {
    console.warn(error)
    return ''
  }

  return pickAddressFromRow(data)
}
