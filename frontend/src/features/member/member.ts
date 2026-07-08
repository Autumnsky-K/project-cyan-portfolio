import { supabase, supabaseConfigError } from '../../api/supabaseClient'
import { fetchDigitalLibrary, type DigitalLibraryItem } from '../../api/digitalLibrary'
import { apiFetch, parseApiResponse } from '../../shared/api/springApiClient'

const KAKAO_LOGIN_SCOPES = 'profile_nickname profile_image'
const ACCOUNT_NOT_FOUND_MESSAGE = '계정을 찾을 수 없습니다. 먼저 회원가입을 진행해 주세요.'
const MY_PAGE_SECTION_LIMIT = 20

const INQUIRY_STATUS_LABELS: Record<string, string> = {
  PENDING: '답변 대기',
  ANSWERED: '답변 완료',
}

export interface CurrentMember {
  userId: string
  memberId: number | null
  memberUuid: string
  email: string | null | undefined
  phone: string
  memberGrade: string
  postalCode: string
  address: string
  addressDetail: string
  deliveryRequest: string
  role: string | null
  isAdmin: boolean
  name: string
}

export interface MyPageMember extends CurrentMember {
  passwordUpdatedAt: string | null
}

export interface GoodsSummaryItem {
  goodsId: number | string | null | undefined
  name: string
  price: number
  imageUrl: string
  status?: string
  description: string
}

export interface OrderSummary {
  orderId: number
  name: string
  status: string
  price: number
  imageUrl: string
  description: string
  deliveryAction: string
  confirmAction: string
  reviewAction: string
}

export interface ArtistOption {
  artistId: number
  name: string
  imageUrl: string
}

export interface FavoriteArtistSummary extends ArtistOption {
  status: string
  description: string
}

export interface InquirySummary {
  inquiryId: number
  name: string
  status: string
  description: string
  imageUrl?: string
}

export interface MyPageSummary {
  member: MyPageMember
  orders: OrderSummary[]
  digitalLibrary: GoodsSummaryItem[]
  productInquiries: InquirySummary[]
  supportInquiries: InquirySummary[]
  recentlyViewedGoods: GoodsSummaryItem[]
  favoriteArtists: FavoriteArtistSummary[]
  likedGoods: GoodsSummaryItem[]
}

interface GoodsRow {
  goods_id?: number
  goodsId?: number
  goods_name?: string
  goodsName?: string
  name?: string
  description?: string
  category_name?: string
  categoryName?: string
  price?: number
  main_image_url?: string
  image_url?: string
  imageUrl?: string
  image?: string
}

interface GoodsSummaryFallback {
  goodsId?: number | string | null
  name?: string
  description?: string
  price?: number
  imageUrl?: string
}

interface OrderRow {
  order_id: number
  order_no: string | null
  order_status: string
  total_amount: number | null
  ordered_at: string
}

interface OrderItemRow {
  order_id: number
  order_item_id: number
  goods_id: number
  goods_name: string
  artist_name: string | null
  unit_price: number
  quantity: number
  item_total_amount: number
  main_image_url: string | null
}

interface GoodsViewHistoryRow {
  view_history_id: number
  goods_id: number
  viewed_at: string
}

interface GoodsLikeRow {
  like_id: number
  goods_id: number
  created_at: string
}

interface GoodsFavoriteRow {
  favorite_id: number
  goods_id: number
  created_at: string
}

interface ArtistRow {
  artist_id: number
  artist_name: string
  profile_image_url?: string | null
}

interface MemberAddressRow {
  address?: string
  address_line?: string
  address1?: string
  road_address?: string
  detail_address?: string
}

interface GoodsActivityItem {
  goodsId?: number
  goods_id?: number
  goodsName?: string
  goods_name?: string
  name?: string
  description?: string
  category_name?: string
  categoryName?: string
  price?: number
  main_image_url?: string
  image_url?: string
  imageUrl?: string
  image?: string
  activityAt?: string
}

interface GoodsActivityResponse {
  recentlyViewedGoods?: GoodsActivityItem[]
  likedGoods?: GoodsActivityItem[]
}

interface InquiryApiItem {
  inquiryId: number
  inquiryType: string
  goodsId: number | null
  orderId: number | null
  orderNo: string | null
  title: string
  content: string | null
  secret: boolean
  status: string
  answerContent: string | null
  answeredAt: string | null
  createdAt: string
}

interface InquiryPageResponse {
  content: InquiryApiItem[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

interface MemberProfileResponse {
  memberId?: number
  memberUuid?: string
  email?: string
  name?: string
  phone?: string
  memberGrade?: string
  postalCode?: string
  address?: string
  addressDetail?: string
  deliveryRequest?: string
}

interface LoginForm {
  email: string
  password: string
}

interface SignupForm {
  email: string
  password: string
  name: string
  phone: string
  address: string
  agreements: unknown
}

interface SignupResult {
  member: {
    name?: string
    email?: string
    userId?: string
  }
}

interface ProfileUpdateForm {
  email: string
  name: string
  phone: string
  address: string
  addressDetail: string
  deliveryRequest: string
}

interface PasswordUpdateResult {
  member: {
    userId?: string
    email?: string | null
    passwordUpdatedAt: string | null
  }
}

function requireSupabase() {
  checkSupabaseConfig()

  if (!supabase) {
    throw new Error(supabaseConfigError || 'Supabase 설정을 확인해주세요.')
  }

  return supabase
}

function checkSupabaseConfig() {
  if (supabaseConfigError) {
    throw new Error(supabaseConfigError)
  }
}

function getStorageKey(userId: string, name: string): string {
  return `project-cyan:${userId}:${name}`
}

function readStoredJson<T>(key: string, fallbackValue: T): T {
  try {
    const storedValue = window.localStorage.getItem(key)

    return storedValue ? (JSON.parse(storedValue) as T) : fallbackValue
  } catch {
    return fallbackValue
  }
}

function writeStoredJson(key: string, value: unknown): void {
  window.localStorage.setItem(key, JSON.stringify(value))
}

function pickAddressFromRow(row: MemberAddressRow | null | undefined): string {
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

function formatDateLabel(value: string | null | undefined): string {
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

function formatOrderStatus(status: string): string {
  const statusLabels: Record<string, string> = {
    PENDING: '결제 대기',
    PAID: '결제 완료',
    PREPARING: '배송 준비중',
    SHIPPED: '배송중',
    DONE: '배송 완료',
    CANCELED: '취소 완료',
  }

  return statusLabels[status] ?? status ?? '주문 상태 확인 중'
}

function getFirstOrderItem(items: OrderItemRow[] | undefined): OrderItemRow | null {
  return Array.isArray(items) && items.length > 0 ? items[0] : null
}

function stripHtml(value: unknown): string {
  if (typeof value !== 'string') {
    return ''
  }

  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function normalizeGoodsSummary(
  goods: GoodsRow | GoodsActivityItem | undefined,
  fallback: GoodsSummaryFallback = {},
): GoodsSummaryItem {
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

async function getGoodsByIds(
  goodsIds: Array<number | string | null | undefined>,
): Promise<Map<string, GoodsRow>> {
  const uniqueGoodsIds = [
    ...new Set(
      goodsIds
        .filter((goodsId): goodsId is number | string => Boolean(goodsId))
        .map((goodsId) => Number(goodsId)),
    ),
  ]

  if (uniqueGoodsIds.length === 0) {
    return new Map()
  }

  const { data, error } = await requireSupabase()
    .from('goods')
    .select('*')
    .in('goods_id', uniqueGoodsIds)

  if (error) {
    console.warn(error)
    return new Map()
  }

  const rows = (data ?? []) as GoodsRow[]

  return new Map(rows.map((goods) => [String(goods.goods_id ?? goods.goodsId), goods]))
}

async function getMyPageOrders(memberId: number): Promise<OrderSummary[]> {
  const { data: orders, error: ordersError } = await requireSupabase()
    .from('orders')
    .select('order_id, order_no, order_status, total_amount, ordered_at')
    .eq('member_id', memberId)
    .order('ordered_at', { ascending: false })
    .limit(MY_PAGE_SECTION_LIMIT)

  if (ordersError) {
    console.warn(ordersError)
    return []
  }

  const orderRows = (orders ?? []) as OrderRow[]

  if (orderRows.length === 0) {
    return []
  }

  const orderIds = orderRows.map((order) => order.order_id)
  const { data: orderItems, error: orderItemsError } = await requireSupabase()
    .from('order_item')
    .select('order_id, order_item_id, goods_id, goods_name, artist_name, unit_price, quantity, item_total_amount, main_image_url')
    .in('order_id', orderIds)
    .order('order_item_id', { ascending: true })

  if (orderItemsError) {
    console.warn(orderItemsError)
  }

  const itemsByOrderId = new Map<number, OrderItemRow[]>()

  for (const item of (orderItems ?? []) as OrderItemRow[]) {
    const items = itemsByOrderId.get(item.order_id) ?? []
    items.push(item)
    itemsByOrderId.set(item.order_id, items)
  }

  return orderRows.map((order) => {
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

async function getMyPageRecentlyViewedGoods(memberId: number): Promise<GoodsSummaryItem[]> {
  const { data, error } = await requireSupabase()
    .from('goods_view_history')
    .select('view_history_id, goods_id, viewed_at')
    .eq('member_id', memberId)
    .order('viewed_at', { ascending: false })
    .limit(MY_PAGE_SECTION_LIMIT)

  if (error) {
    console.warn(error)
    return []
  }

  const rows = (data ?? []) as GoodsViewHistoryRow[]
  const goodsById = await getGoodsByIds(rows.map((row) => row.goods_id))

  return rows.map((row) => {
    const viewedAt = formatDateLabel(row.viewed_at)

    return normalizeGoodsSummary(goodsById.get(String(row.goods_id)), {
      goodsId: row.goods_id,
      description: viewedAt ? `${viewedAt}에 본 상품` : '최근 본 상품',
    })
  })
}

async function getMyPageLikedGoods(memberId: number): Promise<GoodsSummaryItem[]> {
  const { data: likedRows, error: likeError } = await requireSupabase()
    .from('goods_like')
    .select('like_id, goods_id, created_at')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false })
    .limit(MY_PAGE_SECTION_LIMIT)

  if (likeError) {
    console.warn(likeError)
  }

  const { data: favoriteRows, error: favoriteError } = await requireSupabase()
    .from('goods_favorite')
    .select('favorite_id, goods_id, created_at')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false })
    .limit(MY_PAGE_SECTION_LIMIT)

  if (favoriteError) {
    console.warn(favoriteError)
  }

  const rowsByGoodsId = new Map<number, (GoodsLikeRow | GoodsFavoriteRow) & { source: string }>()

  for (const row of (likedRows ?? []) as GoodsLikeRow[]) {
    rowsByGoodsId.set(row.goods_id, {
      ...row,
      source: 'like',
    })
  }

  for (const row of (favoriteRows ?? []) as GoodsFavoriteRow[]) {
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

async function getMyPageGoodsActivity(memberId: number): Promise<{
  recentlyViewedGoods: GoodsSummaryItem[]
  likedGoods: GoodsSummaryItem[]
}> {
  try {
    const activity = await parseApiResponse<GoodsActivityResponse>(
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

function normalizeInquirySummary(inquiry: InquiryApiItem, goods?: GoodsRow): InquirySummary {
  const createdAt = formatDateLabel(inquiry.createdAt)
  const descriptionParts = [
    createdAt,
    inquiry.orderNo ? `주문번호 ${inquiry.orderNo}` : null,
    inquiry.content,
  ]

  if (inquiry.status === 'ANSWERED' && inquiry.answerContent) {
    descriptionParts.push(`답변: ${inquiry.answerContent}`)
  }

  return {
    inquiryId: inquiry.inquiryId,
    name: inquiry.title,
    status: INQUIRY_STATUS_LABELS[inquiry.status] ?? inquiry.status,
    description: descriptionParts.filter(Boolean).join(' · '),
    imageUrl: goods?.main_image_url ?? goods?.image_url ?? goods?.imageUrl ?? goods?.image ?? undefined,
  }
}

async function getMyPageInquiries(inquiryType: 'PRODUCT' | 'SUPPORT'): Promise<InquirySummary[]> {
  try {
    const page = await parseApiResponse<InquiryPageResponse>(
      await apiFetch(`/inquiries/me?type=${inquiryType}&size=${MY_PAGE_SECTION_LIMIT}`),
      '문의 내역을 불러오지 못했습니다.',
      { silent: true },
    )
    const items = page?.content ?? []

    if (inquiryType === 'PRODUCT') {
      const goodsById = await getGoodsByIds(items.map((item) => item.goodsId))
      return items.map((item) => normalizeInquirySummary(item, goodsById.get(String(item.goodsId))))
    }

    return items.map((item) => normalizeInquirySummary(item))
  } catch (error) {
    console.warn(error)
    return []
  }
}

function digitalLibraryItemToDashboardItem(item: DigitalLibraryItem): GoodsSummaryItem {
  const grantedAt = formatDateLabel(item.grantedAt)
  const nextDownloadAt = formatDateLabel(item.nextDownloadAvailableAt)

  return {
    goodsId: item.goodsId,
    name: item.name,
    price: Number(item.price ?? 0),
    imageUrl: item.imageUrl ?? '',
    status: item.downloadAvailable ? '다운로드 가능' : '다운로드 대기',
    description: [
      item.artistName,
      grantedAt ? `${grantedAt} 구매` : null,
      item.downloadAvailable
        ? '마이페이지에서 즉시 다운로드'
        : nextDownloadAt
          ? `${nextDownloadAt}부터 재다운로드`
          : '등록된 다운로드 파일 확인 필요',
    ].filter(Boolean).join(' · '),
  }
}

export async function createSupportInquiry(
  title: string,
  content: string,
  orderId?: number | null,
): Promise<InquiryApiItem> {
  const response = await apiFetch('/inquiries/support', {
    method: 'POST',
    body: JSON.stringify({ title, content, orderId: orderId ?? null }),
  })

  const inquiry = await parseApiResponse<InquiryApiItem>(response, '문의를 등록하지 못했습니다.')

  if (!inquiry) {
    throw new Error('문의를 등록하지 못했습니다.')
  }

  return inquiry
}

async function getMemberGradeFromTable(userId: string): Promise<string> {
  const { data, error } = await requireSupabase()
    .from('member')
    .select('member_grade')
    .eq('member_uuid', userId)
    .maybeSingle()

  if (error) {
    console.warn(error)
    return ''
  }

  return (data as { member_grade?: string } | null)?.member_grade ?? ''
}

export async function loginMember(form: LoginForm): Promise<{ member: CurrentMember }> {
  checkSupabaseConfig()

  // Supabase Auth의 기본 비밀번호 로그인은 이메일을 기준으로 동작합니다.
  const { error } = await requireSupabase().auth.signInWithPassword({
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
    await requireSupabase().auth.signOut()
    throw memberError
  }
}

export async function loginWithKakao(): Promise<void> {
  checkSupabaseConfig()

  // 이메일 없는 가입을 허용하기 위해 카카오 동의 항목은 프로필 정보만 요청합니다.
  const { data, error } = await requireSupabase().auth.signInWithOAuth({
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

export async function exchangeAuthCodeForSession(code: string) {
  checkSupabaseConfig()

  const { data, error } = await requireSupabase().auth.exchangeCodeForSession(code)

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
    await requireSupabase().auth.signOut()
    throw memberError
  }

  return data.session
}

export async function signupMember(form: SignupForm): Promise<SignupResult> {
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

  const member = await parseApiResponse<{ name: string; email: string; userId: string }>(
    response,
    '회원가입에 실패했습니다.',
  )
  const { error: loginError } = await requireSupabase().auth.signInWithPassword({
    email: form.email,
    password: form.password,
  })

  if (loginError) {
    throw new Error(`회원가입은 완료됐지만 로그인에 실패했습니다. ${loginError.message}`)
  }

  return {
    member: {
      name: member?.name,
      email: member?.email,
      userId: member?.userId,
    },
  }
}

export async function checkSignupAvailability(form: { email: string; phone: string }) {
  const response = await apiFetch('/members/signup/availability', {
    method: 'POST',
    body: JSON.stringify({
      email: form.email,
      phone: form.phone,
    }),
  })

  return parseApiResponse(response, '가입 정보 중복 확인에 실패했습니다.')
}

export async function sendPasswordResetEmail(email: string) {
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

export async function updateMemberPassword(password: string, resetToken = ''): Promise<PasswordUpdateResult> {
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

  const { data, error } = await requireSupabase().auth.updateUser({ password })

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
        ? readStoredJson<{ passwordUpdatedAt: string | null } | null>(
            getStorageKey(data.user.id, 'passwordUpdatedAt'),
            null,
          )?.passwordUpdatedAt ?? null
        : null,
    },
  }
}

export async function getCurrentMember(): Promise<CurrentMember | null> {
  checkSupabaseConfig()

  const client = requireSupabase()
  const { data: sessionData, error: sessionError } = await client.auth.getSession()

  if (sessionError) {
    throw new Error(sessionError.message)
  }

  if (!sessionData.session) {
    return null
  }

  const { data, error } = await client.auth.getUser()

  if (error) {
    throw new Error(error.message)
  }

  if (!data.user) {
    return null
  }

  const memberProfile = await parseApiResponse<MemberProfileResponse>(
    await apiFetch('/members/me'),
    '회원 정보를 불러오지 못했습니다.',
  )
  const role =
    (data.user.app_metadata?.role as string | undefined) ??
    null
  const memberGrade = memberProfile?.memberGrade || await getMemberGradeFromTable(data.user.id)

  return {
    userId: data.user.id,
    memberId: memberProfile?.memberId ?? null,
    memberUuid: memberProfile?.memberUuid ?? data.user.id,
    email: memberProfile?.email ?? data.user.email,
    phone: memberProfile?.phone ?? (data.user.user_metadata?.phone as string | undefined) ?? '',
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
      (data.user.user_metadata?.name as string | undefined) ??
      (data.user.user_metadata?.full_name as string | undefined) ??
      (data.user.user_metadata?.nickname as string | undefined) ??
      'SM Universe 회원',
  }
}

export async function getArtistOptions(): Promise<ArtistOption[]> {
  checkSupabaseConfig()

  const { data, error } = await requireSupabase()
    .from('artist')
    .select('artist_id, artist_name, profile_image_url')
    .order('artist_id', { ascending: true })

  if (error) {
    const cmsArtists = await parseApiResponse<ArtistOption[]>(
      await apiFetch('/cms/artists'),
      '관심 아티스트 정보를 불러오지 못했습니다.',
    )

    return (cmsArtists ?? []).map((artist) => ({
      artistId: artist.artistId,
      name: artist.name,
      imageUrl: artist.imageUrl ?? '',
    }))
  }

  return (data as ArtistRow[]).map((artist) => ({
    artistId: artist.artist_id,
    name: artist.artist_name,
    imageUrl: artist.profile_image_url ?? '',
  }))
}

async function getMemberId(memberIdOrUserId: number | string): Promise<number> {
  if (typeof memberIdOrUserId === 'number') {
    return memberIdOrUserId
  }

  if (typeof memberIdOrUserId === 'string' && /^\d+$/.test(memberIdOrUserId)) {
    return Number(memberIdOrUserId)
  }

  const { data, error } = await requireSupabase()
    .from('member')
    .select('member_id')
    .eq('member_uuid', memberIdOrUserId)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return (data as { member_id: number }).member_id
}

export async function getFavoriteArtistIds(userId: number | string): Promise<number[]> {
  checkSupabaseConfig()

  const memberId = await getMemberId(userId)

  const { data, error } = await requireSupabase()
    .from('member_artist')
    .select('artist_id')
    .eq('member_id', memberId)

  if (error) {
    console.warn(error)
    return []
  }

  return (data as Array<{ artist_id: number }>).map((row) => row.artist_id)
}

export async function saveFavoriteArtists(userId: number | string, artistIds: number[]): Promise<number[]> {
  checkSupabaseConfig()

  const memberId = await getMemberId(userId)
  const client = requireSupabase()

  const { error: deleteError } = await client
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

  const { error: insertError } = await client
    .from('member_artist')
    .insert(rows)
  if (insertError) {
    throw new Error(insertError.message)
  }

  return artistIds
}

export async function getMyPageSummary(): Promise<MyPageSummary | null> {
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
  const [orders, goodsActivity, productInquiries, supportInquiries, digitalLibrary] = await Promise.all([
    getMyPageOrders(memberId),
    getMyPageGoodsActivity(memberId),
    getMyPageInquiries('PRODUCT'),
    getMyPageInquiries('SUPPORT'),
    fetchDigitalLibrary().catch((error) => {
      console.warn(error)
      return []
    }),
  ])
  const passwordHistory = readStoredJson<{ passwordUpdatedAt: string | null } | null>(
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
    digitalLibrary: digitalLibrary.map(digitalLibraryItemToDashboardItem),
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

export async function updateMemberProfile(form: ProfileUpdateForm) {
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

  return parseApiResponse<MemberProfileResponse>(response, '개인정보를 저장하지 못했습니다.')
}

export async function logoutMember(): Promise<void> {
  checkSupabaseConfig()

  const { error } = await requireSupabase().auth.signOut()

  if (error) {
    throw new Error(error.message)
  }
}

export async function withdrawMember(): Promise<void> {
  await parseApiResponse(
    await apiFetch('/members/me', {
      method: 'DELETE',
    }),
    '회원 탈퇴에 실패했습니다.',
  )

  await logoutMember()
}

export async function updateMemberAddress(userId: number | string, address: string): Promise<string> {
  checkSupabaseConfig()

  const memberId = await getMemberId(userId)
  const client = requireSupabase()

  const { error: deleteError } = await client
    .from('member_address')
    .delete()
    .eq('member_id', memberId)

  if (deleteError) {
    throw new Error(deleteError.message)
  }

  const { error: insertError } = await client
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

export async function getMemberAddress(userId: number | string): Promise<string> {
  checkSupabaseConfig()

  const memberId = await getMemberId(userId)

  const { data, error } = await requireSupabase()
    .from('member_address')
    .select('*')
    .eq('member_id', memberId)
    .limit(1)
    .maybeSingle()

  if (error) {
    console.warn(error)
    return ''
  }

  return pickAddressFromRow(data as MemberAddressRow | null)
}
