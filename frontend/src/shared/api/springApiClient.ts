import { supabase } from '../../api/supabaseClient'

type ApiFetchOptions = RequestInit

type ApiErrorBody = {
  error?: string
  message?: string
}

export const SPRING_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'

export function buildSpringApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path
  }

  return `${SPRING_API_BASE_URL.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`
}

export function isSpringApiUrl(url: string): boolean {
  return url.startsWith(SPRING_API_BASE_URL.replace(/\/+$/, ''))
}

async function getAccessToken(): Promise<string> {
  if (!supabase) {
    return ''
  }

  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? ''
}

async function buildHeaders(
  body: BodyInit | null | undefined,
  headers: HeadersInit = {},
): Promise<Headers> {
  const nextHeaders = new Headers(headers)
  const accessToken = await getAccessToken()

  if (body !== undefined && !(body instanceof FormData) && !nextHeaders.has('Content-Type')) {
    nextHeaders.set('Content-Type', 'application/json; charset=utf-8')
  }

  if (accessToken && !nextHeaders.has('Authorization')) {
    nextHeaders.set('Authorization', `Bearer ${accessToken}`)
  }

  return nextHeaders
}

export async function apiFetch(
  path: string,
  options: ApiFetchOptions = {},
): Promise<Response> {
  const { headers, body, ...fetchOptions } = options

  return fetch(buildSpringApiUrl(path), {
    ...fetchOptions,
    body,
    headers: await buildHeaders(body, headers),
  })
}

export async function parseApiResponse<T = unknown>(
  response: Response,
  fallbackMessage: string,
): Promise<T | null> {
  if (!response.ok) {
    const error = await response.json().catch(() => null) as ApiErrorBody | null
    throw new Error(error?.message ?? error?.error ?? fallbackMessage)
  }

  if (response.status === 204) {
    return null
  }

  return response.json() as Promise<T>
}
