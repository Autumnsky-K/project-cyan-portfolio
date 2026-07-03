import {
  apiFetch,
  hasSpringApiSession,
  parseApiResponse,
} from '../shared/api/springApiClient'
import type { DigitalLibraryItem } from './digitalLibrary'

export type GoodsSummary = {
  goodsId: number
  name: string
  price: number
  imageUrl: string | null
  tags: string[]
  artistId?: number | null
  artistName?: string | null
  categoryId?: number | null
  categoryName?: string | null
  fulfillmentType?: 'PHYSICAL' | 'DIGITAL' | string | null
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

export type GoodsInquiry = {
  inquiryId: number
  inquiryType: string
  goodsId: number | null
  title: string
  content: string | null
  secret: boolean
  status: string
  answerContent: string | null
  answeredAt?: string | null
  createdAt: string
}

export type GoodsLikeResponse = {
  liked: boolean
  likeCount: number
}

export type GoodsLikeItemResponse = GoodsLikeResponse & {
  goodsId: number
}

export type GoodsFilterOption = {
  label: string
  value: string
  fulfillmentType?: 'PHYSICAL' | 'DIGITAL' | string | null
}

export type GoodsFiltersResponse = {
  artists?: GoodsFilterOption[]
  categories?: GoodsFilterOption[]
  tags?: GoodsFilterOption[]
}

export type GoodsHomeDiscoveryGroup = {
  label: string
  value: string
  count: number
  imageUrl?: string | null
}

export type GoodsHomeDiscovery = {
  physicalGoods?: GoodsSummary[]
  digitalGoods?: GoodsSummary[]
  artists?: GoodsHomeDiscoveryGroup[]
  categories?: GoodsHomeDiscoveryGroup[]
  physicalCategories?: GoodsHomeDiscoveryGroup[]
  digitalCategories?: GoodsHomeDiscoveryGroup[]
  digitalTags?: GoodsHomeDiscoveryGroup[]
  totalGoods?: number
  physicalGoodsCount?: number
  digitalGoodsCount?: number
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
  viewPeriod?: string
  page?: number
  size?: number
  categoryIds?: string
  artistIds?: string
  tags?: string
  goodsIds?: string
}

type FetchOptions = RequestInit

export async function fetchGoods(
  params: GoodsQueryParams = {},
  options: FetchOptions = {},
): Promise<PageResponse<GoodsSummary>> {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })

  const query = searchParams.toString()
  const response = await apiFetch(`/goods${query ? `?${query}` : ''}`, options)
  return await parseApiResponse<PageResponse<GoodsSummary>>(response, '상품을 불러오지 못했습니다.') as PageResponse<GoodsSummary>
}

export async function fetchGoodsDetail(goodsId: string | number | undefined, options: FetchOptions = {}): Promise<GoodsDetail> {
  const response = await apiFetch(`/goods/${goodsId}`, options)
  return await parseApiResponse<GoodsDetail>(response, '상품 상세 정보를 불러오지 못했습니다.') as GoodsDetail
}

export async function recordGoodsView(goodsId: string | number): Promise<void> {
  if (!(await hasSpringApiSession())) {
    return
  }

  const response = await apiFetch(`/goods/${goodsId}/views`, { method: 'POST' })
  await parseApiResponse(response, '상품 조회 기록을 저장하지 못했습니다.', { silent: true })
}

export async function fetchMyGoodsLike(goodsId: string | number | undefined): Promise<GoodsLikeResponse | null> {
  if (!(await hasSpringApiSession())) {
    return null
  }

  const response = await apiFetch(`/goods/${goodsId}/likes/my`)
  return await parseApiResponse<GoodsLikeResponse>(response, '상품 좋아요 상태를 불러오지 못했습니다.')
}

export async function fetchMyGoodsLikes(goodsIds: Array<string | number>): Promise<GoodsLikeItemResponse[]> {
  if (!goodsIds.length || !(await hasSpringApiSession())) {
    return []
  }

  const params = new URLSearchParams()
  params.set('goodsIds', goodsIds.join(','))
  const response = await apiFetch(`/goods/likes/my?${params.toString()}`)
  return await parseApiResponse<GoodsLikeItemResponse[]>(response, '상품 좋아요 목록을 불러오지 못했습니다.') ?? []
}

export async function fetchLikedGoods(): Promise<GoodsSummary[]> {
  const response = await apiFetch('/goods/likes')
  return await parseApiResponse<GoodsSummary[]>(response, 'Failed to load liked goods.') ?? []
}

export async function addGoodsLike(goodsId: string | number): Promise<GoodsLikeResponse> {
  const response = await apiFetch(`/goods/${goodsId}/likes`, { method: 'POST' })
  return await parseApiResponse<GoodsLikeResponse>(response, '상품에 좋아요를 추가하지 못했습니다.') as GoodsLikeResponse
}

export async function removeGoodsLike(goodsId: string | number): Promise<GoodsLikeResponse> {
  const response = await apiFetch(`/goods/${goodsId}/likes`, { method: 'DELETE' })
  return await parseApiResponse<GoodsLikeResponse>(response, '상품 좋아요를 취소하지 못했습니다.') as GoodsLikeResponse
}

export async function fetchRelatedGoods(
  goodsId: string | number | undefined,
  size = 8,
  options: FetchOptions = {},
): Promise<GoodsSummary[]> {
  const response = await apiFetch(`/goods/${goodsId}/related?size=${size}`, options)
  return await parseApiResponse<GoodsSummary[]>(response, '연관 상품을 불러오지 못했습니다.') ?? []
}

export async function fetchGoodsReviews(
  goodsId: string | number | undefined,
  page = 0,
  size = 5,
  sort = 'newest',
  options: FetchOptions = {},
): Promise<PageResponse<GoodsReview>> {
  const searchParams = new URLSearchParams({ page: String(page), size: String(size), sort })
  const response = await apiFetch(`/goods/${goodsId}/reviews?${searchParams.toString()}`, options)
  return await parseApiResponse<PageResponse<GoodsReview>>(response, '상품 리뷰를 불러오지 못했습니다.') as PageResponse<GoodsReview>
}

export async function fetchGoodsReviewSummary(
  goodsId: string | number | undefined,
  options: FetchOptions = {},
): Promise<GoodsReviewSummary> {
  const response = await apiFetch(`/goods/${goodsId}/reviews/summary`, options)
  return await parseApiResponse<GoodsReviewSummary>(response, '리뷰 요약을 불러오지 못했습니다.') as GoodsReviewSummary
}

export async function fetchMyGoodsReview(goodsId: string | number | undefined): Promise<GoodsReview | null> {
  if (!(await hasSpringApiSession())) {
    return null
  }

  const response = await apiFetch(`/goods/${goodsId}/reviews/my`)
  return await parseApiResponse<GoodsReview>(response, '내 리뷰를 불러오지 못했습니다.')
}

export async function createGoodsReview(
  goodsId: string | number,
  payload: { rating: number; content: string; optionLabel?: string | null },
): Promise<GoodsReview> {
  const response = await apiFetch(`/goods/${goodsId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return await parseApiResponse<GoodsReview>(response, '리뷰를 등록하지 못했습니다.') as GoodsReview
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
  return await parseApiResponse<GoodsReview>(response, '리뷰를 수정하지 못했습니다.') as GoodsReview
}

export async function deleteGoodsReview(
  goodsId: string | number,
  reviewId: string | number,
): Promise<void> {
  const response = await apiFetch(`/goods/${goodsId}/reviews/${reviewId}`, { method: 'DELETE' })
  await parseApiResponse(response, '리뷰를 삭제하지 못했습니다.')
}

export async function fetchGoodsInquiries(
  goodsId: string | number | undefined,
  page = 0,
  size = 10,
  options: FetchOptions = {},
): Promise<PageResponse<GoodsInquiry>> {
  const searchParams = new URLSearchParams({ page: String(page), size: String(size) })
  const response = await apiFetch(`/goods/${goodsId}/inquiries?${searchParams.toString()}`, options)
  return await parseApiResponse<PageResponse<GoodsInquiry>>(response, '상품 문의를 불러오지 못했습니다.') as PageResponse<GoodsInquiry>
}

export async function createGoodsInquiry(
  goodsId: string | number,
  payload: { title: string; content: string; secret?: boolean },
): Promise<GoodsInquiry> {
  const response = await apiFetch(`/goods/${goodsId}/inquiries`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return await parseApiResponse<GoodsInquiry>(response, '상품 문의를 등록하지 못했습니다.') as GoodsInquiry
}

export async function fetchGoodsFilters(options: FetchOptions = {}): Promise<GoodsFiltersResponse> {
  const response = await apiFetch('/goods/filters', options)
  return await parseApiResponse<GoodsFiltersResponse>(response, '상품 필터를 불러오지 못했습니다.') as GoodsFiltersResponse
}

export async function fetchGoodsHomeDiscovery(options: FetchOptions = {}): Promise<GoodsHomeDiscovery> {
  const response = await apiFetch('/goods/home-discovery', options)
  return await parseApiResponse<GoodsHomeDiscovery>(
    response,
    'Failed to load home goods discovery.',
  ) as GoodsHomeDiscovery
}

export async function fetchMyDigitalGoodsPurchase(goodsId: string | number): Promise<DigitalLibraryItem | null> {
  if (!(await hasSpringApiSession())) {
    return null
  }

  const response = await apiFetch(`/goods/${goodsId}/digital-purchase`)
  return await parseApiResponse<DigitalLibraryItem>(
    response,
    '디지털 상품 구매 여부를 확인하지 못했습니다.',
  )
}

export async function purchaseDigitalGoods(goodsId: string | number): Promise<DigitalLibraryItem> {
  const response = await apiFetch(`/goods/${goodsId}/digital-purchase`, {
    method: 'POST',
  })
  return await parseApiResponse<DigitalLibraryItem>(
    response,
    '디지털 상품 구매를 처리하지 못했습니다.',
  ) as DigitalLibraryItem
}
