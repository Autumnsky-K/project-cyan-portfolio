import { supabase } from '../../api/supabaseClient'
import { navigateToServerError } from './errorNavigation'

type ApiFetchOptions = RequestInit

type ApiErrorBody = {
  error?: string
  message?: string
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
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

export async function hasSpringApiSession(): Promise<boolean> {
  return Boolean(await getAccessToken())
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
  const url = buildSpringApiUrl(path)

  try {
    return await fetch(url, {
      ...fetchOptions,
      body,
      headers: await buildHeaders(body, headers),
    })
  } catch (error) {
    if (
      (error instanceof DOMException && error.name === 'AbortError') ||
      (error instanceof Error && error.name === 'AbortError')
    ) {
      throw error
    }

    throw new Error('서버에 연결할 수 없습니다.', {
      cause: error,
    })
  }
}

type ParseApiResponseOptions = {
  // Skip the automatic redirect to /500 for best-effort/background calls
  // where a server error shouldn't interrupt what the user is doing.
  silent?: boolean
}

export async function parseApiResponse<T = unknown>(
  response: Response,
  fallbackMessage: string,
  options: ParseApiResponseOptions = {},
): Promise<T | null> {
  if (!response.ok) {
    const error = await response.json().catch(() => null) as ApiErrorBody | null
    const apiError = new ApiError(error?.message ?? error?.error ?? fallbackMessage, response.status)

    if (!options.silent && apiError.status >= 500) {
      navigateToServerError()
    }

    throw apiError
  }

  if (response.status === 204) {
    return null
  }

  return response.json() as Promise<T>
}
