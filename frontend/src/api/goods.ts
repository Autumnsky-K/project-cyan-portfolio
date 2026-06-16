const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'

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
}

export type GoodsDetail = GoodsSummary & {
  description?: string | null
  artistId?: number | null
  stockCount?: number | null
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
  categoryId?: string
  artistId?: string
  tag?: string
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
      url.searchParams.set(key, value)
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

export async function fetchGoodsFilters(options: FetchOptions = {}): Promise<GoodsFiltersResponse> {
  const response = await fetch(`${API_BASE_URL}/goods/filters`, options)

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Failed to load goods filters.'))
  }

  return response.json()
}
