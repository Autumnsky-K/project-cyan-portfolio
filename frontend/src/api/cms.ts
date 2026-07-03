const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'

export type CmsPage = {
  pageKey: string
  eyebrow: string
  title: string
  summaryTitle: string
  summaryBody: string
  primaryColor: string
  accentColor: string
  backgroundColor: string
  heroImageUrl?: string | null
  copySettings?: Record<string, string>
}

export type CmsArtistProfile = {
  artistId: number
  name: string
  groupName?: string | null
  imageUrl?: string | null
  lore?: string | null
  debutDate?: string | null
  collections?: string | null
  sortOrder?: number | null
  visible?: boolean | null
}

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  const error = await response.json().catch(() => null) as { message?: string } | null
  return error?.message ?? fallback
}

export async function fetchCmsPage(pageKey: 'home' | 'artists', options: RequestInit = {}): Promise<CmsPage> {
  const response = await fetch(`${API_BASE_URL}/cms/pages/${pageKey}`, options)

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, '페이지 정보를 불러오지 못했습니다.'))
  }

  return response.json()
}

export async function fetchCmsArtists(options: RequestInit = {}): Promise<CmsArtistProfile[]> {
  const response = await fetch(`${API_BASE_URL}/cms/artists`, options)

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, '아티스트 정보를 불러오지 못했습니다.'))
  }

  return response.json()
}
