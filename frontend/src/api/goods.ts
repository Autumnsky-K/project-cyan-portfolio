import {
  apiFetch,
  hasSpringApiSession,
  parseApiResponse,
} from '../shared/api/springApiClient'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? `${window.location.origin}/api`

export type GoodsSummary = {
  goodsId: number
  name: string
  price: number
  imageUrl: string | null
  tags: string[]
  artistName?: string | null
  categoryName?: string | null
  salesStatus?: string | null
  isBestSeller?: boolean | null
  aiPickDefault?: boolean | null
  averageRating?: number | null
  reviewCount?: number | null
  likeCount?: number | null
}

export type GoodsExtraImage = {
  imageId: number
  imageUrl: string
  altText?: string | null
  sortOrder?: number | null
}

export type GoodsDetail = GoodsSummary & {
  description?: string | null
  artistId?: number | null
  stockCount?: number | null
  purchaseState?: string | null
  purchaseMessage?: string | null
  extraImages?: GoodsExtraImage[] | null
}

export type GoodsReview = {
  reviewId: number
  memberId?: number | null
  rating: number
  authorName: string
  optionLabel?: string | null
  content: string
  createdAt: string
  updatedAt?: string | null
  ownedByCurrentMember?: boolean | null
}

export type GoodsReviewSummary = {
  averageRating: number
  reviewCount: number
  ratingFiveCount: number
  ratingFourCount: number
  ratingThreeCount: number
  ratingTwoCount: number
  ratingOneCount: number
}

export type GoodsLikeResponse = {
  liked: boolean
  likeCount: number
}

export type GoodsFilterOption = {
  label: string
  value: string
}

export type GoodsFiltersResponse = {
  artists?: GoodsFilterOption[]
  categories?: GoodsFilterOption[]
  tags?: GoodsFilterOption[]
}

export type PageResponse<T> = {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  number?: number
}

export type GoodsQueryParams = {
  q?: string
  sort?: string
  page?: number
  size?: number
  categoryIds?: string
  artistIds?: string
  tags?: string
  goodsIds?: string
}

type FetchOptions = RequestInit

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  const error = await response.json().catch(() => null) as { message?: string } | null
  return error?.message ?? fallback
}

export async function fetchGoods(
  params: GoodsQueryParams = {},
  options: FetchOptions = {},
): Promise<PageResponse<GoodsSummary>> {
  const url = new URL(`${API_BASE_URL}/goods`)

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  })

  const response = await fetch(url, options)

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Failed to load goods.'))
  }

  return response.json()
}

export async function fetchGoodsDetail(goodsId: string | number | undefined, options: FetchOptions = {}): Promise<GoodsDetail> {
  const response = await fetch(`${API_BASE_URL}/goods/${goodsId}`, options)

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Failed to load goods detail.'))
  }

  return response.json()
}

export async function recordGoodsView(goodsId: string | number): Promise<void> {
  if (!(await hasSpringApiSession())) {
    return
  }

  const response = await apiFetch(`/goods/${goodsId}/views`, { method: 'POST' })
  await parseApiResponse(response, 'Failed to record goods view.')
}

export async function fetchFavoriteGoods(): Promise<GoodsSummary[]> {
  const response = await apiFetch('/goods/favorites')
  return await parseApiResponse<GoodsSummary[]>(response, 'Failed to load favorite goods.') ?? []
}

export async function addGoodsFavorite(goodsId: string | number): Promise<void> {
  const response = await apiFetch(`/goods/${goodsId}/favorites`, { method: 'POST' })
  await parseApiResponse(response, 'Failed to add favorite goods.')
}

export async function removeGoodsFavorite(goodsId: string | number): Promise<void> {
  const response = await apiFetch(`/goods/${goodsId}/favorites`, { method: 'DELETE' })
  await parseApiResponse(response, 'Failed to remove favorite goods.')
}

export async function fetchMyGoodsLike(goodsId: string | number | undefined): Promise<GoodsLikeResponse | null> {
  if (!(await hasSpringApiSession())) {
    return null
  }

  const response = await apiFetch(`/goods/${goodsId}/likes/my`)
  return await parseApiResponse<GoodsLikeResponse>(response, 'Failed to load goods like.')
}

export async function addGoodsLike(goodsId: string | number): Promise<GoodsLikeResponse> {
  const response = await apiFetch(`/goods/${goodsId}/likes`, { method: 'POST' })
  return await parseApiResponse<GoodsLikeResponse>(response, 'Failed to add goods like.') as GoodsLikeResponse
}

export async function removeGoodsLike(goodsId: string | number): Promise<GoodsLikeResponse> {
  const response = await apiFetch(`/goods/${goodsId}/likes`, { method: 'DELETE' })
  return await parseApiResponse<GoodsLikeResponse>(response, 'Failed to remove goods like.') as GoodsLikeResponse
}

export async function fetchRelatedGoods(
  goodsId: string | number | undefined,
  size = 8,
  options: FetchOptions = {},
): Promise<GoodsSummary[]> {
  const url = new URL(`${API_BASE_URL}/goods/${goodsId}/related`)
  url.searchParams.set('size', String(size))
  const response = await fetch(url, options)

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Failed to load related goods.'))
  }

  return response.json()
}

export async function fetchGoodsReviews(
  goodsId: string | number | undefined,
  page = 0,
  size = 5,
  sort = 'newest',
  options: FetchOptions = {},
): Promise<PageResponse<GoodsReview>> {
  const url = new URL(`${API_BASE_URL}/goods/${goodsId}/reviews`)
  url.searchParams.set('page', String(page))
  url.searchParams.set('size', String(size))
  url.searchParams.set('sort', sort)
  const response = await fetch(url, options)

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Failed to load goods reviews.'))
  }

  return response.json()
}

export async function fetchGoodsReviewSummary(
  goodsId: string | number | undefined,
  options: FetchOptions = {},
): Promise<GoodsReviewSummary> {
  const response = await fetch(`${API_BASE_URL}/goods/${goodsId}/reviews/summary`, options)

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Failed to load review summary.'))
  }

  return response.json()
}

export async function fetchMyGoodsReview(goodsId: string | number | undefined): Promise<GoodsReview | null> {
  if (!(await hasSpringApiSession())) {
    return null
  }

  const response = await apiFetch(`/goods/${goodsId}/reviews/my`)
  return await parseApiResponse<GoodsReview>(response, 'Failed to load my review.')
}

export async function createGoodsReview(
  goodsId: string | number,
  payload: { rating: number; content: string; optionLabel?: string | null },
): Promise<GoodsReview> {
  const response = await apiFetch(`/goods/${goodsId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return await parseApiResponse<GoodsReview>(response, 'Failed to create review.') as GoodsReview
}

export async function updateGoodsReview(
  goodsId: string | number,
  reviewId: string | number,
  payload: { rating: number; content: string; optionLabel?: string | null },
): Promise<GoodsReview> {
  const response = await apiFetch(`/goods/${goodsId}/reviews/${reviewId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return await parseApiResponse<GoodsReview>(response, 'Failed to update review.') as GoodsReview
}

export async function deleteGoodsReview(
  goodsId: string | number,
  reviewId: string | number,
): Promise<void> {
  const response = await apiFetch(`/goods/${goodsId}/reviews/${reviewId}`, { method: 'DELETE' })
  await parseApiResponse(response, 'Failed to delete review.')
}

export async function fetchGoodsFilters(options: FetchOptions = {}): Promise<GoodsFiltersResponse> {
  const response = await fetch(`${API_BASE_URL}/goods/filters`, options)

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Failed to load goods filters.'))
  }

  return response.json()
}
