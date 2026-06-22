import { supabase, supabaseConfigError } from '../../api/supabaseClient'

const KAKAO_LOGIN_SCOPES = 'profile_nickname profile_image'

const FAVORITE_ARTISTS = [
  {
    artistId: 1,
    name: 'aespa',
    imageUrl: '',
  },
  {
    artistId: 2,
    name: 'NCT',
    imageUrl: '',
  },
  {
    artistId: 3,
    name: 'RIIZE',
    imageUrl: '',
  },
  {
    artistId: 4,
    name: 'Red Velvet',
    imageUrl: '',
  },
  {
    artistId: 5,
    name: 'SHINee',
    imageUrl: '',
  },
  {
    artistId: 6,
    name: 'EXO',
    imageUrl: '',
  },
]

const MY_PAGE_DUMMY_DATA = {
  orders: [
    {
      orderId: 101,
      name: 'aespa OFFICIAL LIGHT STICK',
      status: '배송 준비중',
      description: '응원봉 단독 주문 · 2026.06.18 결제',
    },
    {
      orderId: 102,
      name: 'RIIZE PHOTOBOOK SET',
      status: '배송 완료',
      description: '포토북 + 포토카드 세트 · 2026.06.12 도착',
    },
    {
      orderId: 103,
      name: 'NCT DREAM MD PACKAGE',
      status: '결제 완료',
      description: '예약 상품 · 2026.07.02 출고 예정',
    },
    {
      orderId: 104,
      name: 'Red Velvet MINI BAG',
      status: '구매 확정',
      description: '공식 굿즈 스토어 구매 · 리뷰 작성 가능',
    },
    {
      orderId: 105,
      name: 'SHINee ANNIVERSARY KIT',
      status: '배송중',
      description: '한정판 키트 · 오늘 오후 도착 예정',
    },
    {
      orderId: 106,
      name: 'EXO POSTCARD BOOK',
      status: '취소 완료',
      description: '환불 처리 완료 · 재입고 알림 신청 가능',
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

export function loginMember(form) {
  checkSupabaseConfig()

  // Supabase Auth의 기본 비밀번호 로그인은 이메일을 기준으로 동작합니다.
  return supabase.auth
    .signInWithPassword({
      email: form.email,
      password: form.password,
    })
    .then(({ data, error }) => {
      if (error) {
        throw new Error(error.message)
      }

      return {
        member: {
          userId: data.user?.id,
          email: data.user?.email,
          name: data.user?.user_metadata?.name,
        },
      }
    })
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

  return data.session
}

export async function signupMember(form) {
  checkSupabaseConfig()

  // 일반 회원가입도 Supabase Auth를 거쳐 member_uuid를 auth.users.id와 맞춥니다.
  const { data, error } = await supabase.auth.signUp({
    email: form.email,
    password: form.password,
    options: {
      data: {
        name: form.name,
        phone: form.phone,
      },
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  return {
    member: {
      name: form.name,
      email: form.email,
      userId: data.user?.id,
    },
  }
}

export async function sendPasswordResetEmail(email) {
  checkSupabaseConfig()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function updateMemberPassword(password) {
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

  const role =
    data.user.app_metadata?.role ??
    data.user.user_metadata?.role ??
    data.user.user_metadata?.memberRole ??
    null

  return {
    userId: data.user.id,
    memberId:
      data.user.app_metadata?.memberId ??
      data.user.user_metadata?.memberId ??
      data.user.user_metadata?.member_id,
    email: data.user.email,
    role,
    isAdmin:
      role === 'ADMIN' ||
      role === 'ROLE_ADMIN' ||
      data.user.app_metadata?.isAdmin === true ||
      data.user.user_metadata?.isAdmin === true,
    name:
      data.user.user_metadata?.name ??
      data.user.user_metadata?.full_name ??
      data.user.user_metadata?.nickname ??
      'SM Universe 회원',
  }
}

export function getArtistOptions() {
  return FAVORITE_ARTISTS
}

export async function getFavoriteArtistIds(userId) {
  return readStoredJson(getStorageKey(userId, 'favoriteArtists'), [])
}

export async function saveFavoriteArtists(userId, artistIds) {
  writeStoredJson(getStorageKey(userId, 'favoriteArtists'), artistIds)

  return artistIds
}

export async function getMyPageSummary() {
  const member = await getCurrentMember()

  if (!member) {
    return null
  }

  const favoriteArtistIds = await getFavoriteArtistIds(member.userId)
  const address = readStoredJson(getStorageKey(member.userId, 'address'), '')
  const passwordHistory = readStoredJson(
    getStorageKey(member.userId, 'passwordUpdatedAt'),
    null,
  )

  return {
    member: {
      ...member,
      grade: 'WELCOME',
      address,
      passwordUpdatedAt: passwordHistory?.passwordUpdatedAt ?? null,
    },
    orders: MY_PAGE_DUMMY_DATA.orders,
    recentlyViewedGoods: MY_PAGE_DUMMY_DATA.recentlyViewedGoods,
    favoriteArtists: FAVORITE_ARTISTS.map((artist) => ({
      ...artist,
      status: favoriteArtistIds.includes(artist.artistId)
        ? '선택됨'
        : '추천 아티스트',
      description: `${artist.name} 공식 굿즈와 새 소식을 모아볼 수 있습니다.`,
    })),
    likedGoods: MY_PAGE_DUMMY_DATA.likedGoods,
  }
}

export async function logoutMember() {
  checkSupabaseConfig()

  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(error.message)
  }
}

export async function updateMemberAddress(userId, address) {
  writeStoredJson(getStorageKey(userId, 'address'), address)

  return address
}
