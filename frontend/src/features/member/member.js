import { supabase, supabaseConfigError } from '../../api/supabaseClient'
import { apiFetch, parseApiResponse } from '../../shared/api/springApiClient'

const KAKAO_LOGIN_SCOPES = 'profile_nickname profile_image'
const ACCOUNT_NOT_FOUND_MESSAGE = '계정을 찾을 수 없습니다. 먼저 회원가입을 진행해 주세요.'
const MY_PAGE_SECTION_LIMIT = 20


const INQUIRY_STATUS_LABELS = {
  PENDING: '답변 대기',
  ANSWERED: '답변 완료',
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

function stripHtml(value) {
  if (typeof value !== 'string') {
    return ''
  }

  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function normalizeGoodsSummary(goods, fallback = {}) {
  const goodsId = goods?.goods_id ?? goods?.goodsId ?? fallback.goodsId
  const goodsName =
    goods?.goods_name ??
    goods?.goodsName ??
    goods?.name ??
    fallback.name ??
    '상품명 확인 중'
  const description = stripHtml(
    fallback.description ??
    goods?.description ??
    goods?.category_name ??
    goods?.categoryName ??
    '',
  )

  return {
    goodsId,
    name: goodsName,
    price: Number(goods?.price ?? fallback.price ?? 0),
    imageUrl:
      goods?.main_image_url ??
      goods?.image_url ??
      goods?.imageUrl ??
      goods?.image ??
      fallback.imageUrl ??
      '',
    description: description || '상품 정보를 확인해 주세요.',
  }
}

async function getGoodsByIds(goodsIds) {
  const uniqueGoodsIds = [...new Set(goodsIds.filter(Boolean).map((goodsId) => Number(goodsId)))]

  if (uniqueGoodsIds.length === 0) {
    return new Map()
  }

  const { data, error } = await supabase
    .from('goods')
    .select('*')
    .in('goods_id', uniqueGoodsIds)

  if (error) {
    console.warn(error)
    return new Map()
  }

  return new Map((data ?? []).map((goods) => [String(goods.goods_id ?? goods.goodsId), goods]))
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

    return normalizeGoodsSummary(goodsById.get(String(row.goods_id)), {
      goodsId: row.goods_id,
      description: viewedAt ? `${viewedAt}에 본 상품` : '최근 본 상품',
    })
  })
}

async function getMyPageLikedGoods(memberId) {
  const { data: likedRows, error: likeError } = await supabase
    .from('goods_like')
    .select('like_id, goods_id, created_at')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false })
    .limit(MY_PAGE_SECTION_LIMIT)

  if (likeError) {
    console.warn(likeError)
  }

  const { data: favoriteRows, error: favoriteError } = await supabase
    .from('goods_favorite')
    .select('favorite_id, goods_id, created_at')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false })
    .limit(MY_PAGE_SECTION_LIMIT)

  if (favoriteError) {
    console.warn(favoriteError)
  }

  const rowsByGoodsId = new Map()

  for (const row of likedRows ?? []) {
    rowsByGoodsId.set(row.goods_id, {
      ...row,
      source: 'like',
    })
  }

  for (const row of favoriteRows ?? []) {
    const currentRow = rowsByGoodsId.get(row.goods_id)

    if (!currentRow || new Date(row.created_at) > new Date(currentRow.created_at)) {
      rowsByGoodsId.set(row.goods_id, {
        ...row,
        source: 'favorite',
      })
    }
  }

  const rows = [...rowsByGoodsId.values()]
    .sort((firstRow, secondRow) =>
      new Date(secondRow.created_at).getTime() - new Date(firstRow.created_at).getTime(),
    )
    .slice(0, MY_PAGE_SECTION_LIMIT)

  const goodsById = await getGoodsByIds(rows.map((row) => row.goods_id))

  return rows.map((row) => {
    const likedAt = formatDateLabel(row.created_at)

    return normalizeGoodsSummary(goodsById.get(String(row.goods_id)), {
      goodsId: row.goods_id,
      description: likedAt ? `${likedAt}에 찜한 상품` : '찜한 상품',
    })
  })
}

async function getMyPageGoodsActivity(memberId) {
  try {
    const activity = await parseApiResponse(
      await apiFetch('/members/me/goods-activity'),
      '상품 활동 내역을 불러오지 못했습니다.',
    )

    return {
      recentlyViewedGoods: (activity?.recentlyViewedGoods ?? []).map((goods) =>
        normalizeGoodsSummary(goods, {
          goodsId: goods.goodsId,
          description: goods.activityAt
            ? `${formatDateLabel(goods.activityAt)}에 본 상품`
            : '최근 본 상품',
        }),
      ),
      likedGoods: (activity?.likedGoods ?? []).map((goods) =>
        normalizeGoodsSummary(goods, {
          goodsId: goods.goodsId,
          description: goods.activityAt
            ? `${formatDateLabel(goods.activityAt)}에 찜한 상품`
            : '찜한 상품',
        }),
      ),
    }
  } catch (error) {
    console.warn(error)
  }

  const [recentlyViewedGoods, likedGoods] = await Promise.all([
    getMyPageRecentlyViewedGoods(memberId),
    getMyPageLikedGoods(memberId),
  ])

  return {
    recentlyViewedGoods,
    likedGoods,
  }
}

function normalizeInquirySummary(inquiry) {
  const createdAt = formatDateLabel(inquiry.createdAt)

  return {
    inquiryId: inquiry.inquiryId,
    name: inquiry.title,
    status: INQUIRY_STATUS_LABELS[inquiry.status] ?? inquiry.status,
    description: [createdAt, inquiry.content].filter(Boolean).join(' · '),
  }
}

async function getMyPageInquiries(inquiryType) {
  try {
    const page = await parseApiResponse(
      await apiFetch(`/inquiries/me?type=${inquiryType}&size=${MY_PAGE_SECTION_LIMIT}`),
      '문의 내역을 불러오지 못했습니다.',
    )

    return (page?.content ?? []).map(normalizeInquirySummary)
  } catch (error) {
    console.warn(error)
    return []
  }
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
  const [orders, goodsActivity, productInquiries, supportInquiries] = await Promise.all([
    getMyPageOrders(memberId),
    getMyPageGoodsActivity(memberId),
    getMyPageInquiries('PRODUCT'),
    getMyPageInquiries('SUPPORT'),
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
    productInquiries,
    supportInquiries,
    recentlyViewedGoods: goodsActivity.recentlyViewedGoods,
    favoriteArtists: favoriteArtists.map((artist) => ({
      ...artist,
      status: '선택됨',
      description: `${artist.name} 공식 굿즈와 새 소식을 모아볼 수 있습니다.`,
    })),
    likedGoods: goodsActivity.likedGoods,
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
