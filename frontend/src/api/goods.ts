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
}

export type GoodsDetail = GoodsSummary & {
  description?: string | null
  artistId?: number | null
  stockCount?: number | null
  saleType?: string | null
  saleStartAt?: string | null
  saleEndAt?: string | null
  purchaseState?: string | null
  purchaseMessage?: string | null
  shipping?: GoodsShipping | null
  optionGroups?: GoodsOptionGroup[]
  variants?: GoodsVariant[]
  notices?: GoodsNotices | null
}

export type GoodsShipping = {
  fee: number
  carrier: string
  scope: string
  note: string
}

export type GoodsOptionValue = {
  optionValueId: number
  name: string
}

export type GoodsOptionGroup = {
  optionGroupId: number
  key: string
  name: string
  values: GoodsOptionValue[]
}

export type GoodsVariant = {
  variantId: number
  sku: string
  additionalPrice: number
  stockCount: number
  active: boolean
  selections: Record<string, string>
}

export type GoodsNotices = {
  intro: string
  cancel: string
  delivery: string
}

export type GoodsReview = {
  reviewId: number
  rating: number
  authorName: string
  optionLabel?: string | null
  content: string
  createdAt: string
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

export async function fetchGoodsFilters(options: FetchOptions = {}): Promise<GoodsFiltersResponse> {
  const response = await fetch(`${API_BASE_URL}/goods/filters`, options)

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Failed to load goods filters.'))
  }

  return response.json()
}
