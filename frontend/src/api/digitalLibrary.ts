import {
  apiFetch,
  hasSpringApiSession,
  parseApiResponse,
} from '../shared/api/springApiClient'

export type DigitalLibraryAsset = {
  assetId: number
  displayName: string
  originalFileName: string
  contentType: string
  fileSizeBytes: number
}

export type DigitalLibraryItem = {
  entitlementId: number
  goodsId: number
  name: string
  artistName?: string | null
  categoryName?: string | null
  price?: number | null
  imageUrl?: string | null
  grantedAt?: string | null
  lastDownloadedAt?: string | null
  nextDownloadAvailableAt?: string | null
  downloadAvailable: boolean
  downloadsRemaining: number
  downloadLimitPerPeriod: number
  downloadPeriodDays: number
  assets: DigitalLibraryAsset[]
}

export type DigitalDownloadResponse = {
  requestId: number
  assetId: number
  signedUrl: string
  expiresAt: string
  fileName: string
  contentType: string
}

export async function fetchDigitalLibrary(goodsId?: string | number): Promise<DigitalLibraryItem[]> {
  if (!(await hasSpringApiSession())) {
    return []
  }

  const query = new URLSearchParams()
  if (goodsId != null && String(goodsId).trim()) {
    query.set('goodsId', String(goodsId))
  }
  const queryString = query.toString()
  const path = `/members/me/digital-library${queryString ? `?${queryString}` : ''}`
  const response = await apiFetch(path)
  return await parseApiResponse<DigitalLibraryItem[]>(response, '디지털 제품 저장소를 불러오지 못했습니다.') ?? []
}

export async function requestDigitalDownload(
  entitlementId: string | number,
  assetId?: string | number,
): Promise<DigitalDownloadResponse> {
  const response = await apiFetch(`/members/me/digital-library/${entitlementId}/downloads`, {
    method: 'POST',
    body: JSON.stringify({
      assetId: assetId == null ? null : Number(assetId),
      browserFingerprint: window.navigator.userAgent,
    }),
  })

  return await parseApiResponse<DigitalDownloadResponse>(
    response,
    '디지털 파일 다운로드 요청에 실패했습니다.',
  ) as DigitalDownloadResponse
}
