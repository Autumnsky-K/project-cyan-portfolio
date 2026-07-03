const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'

export type SupportFaq = {
  faqId: number
  category: string
  question: string
  answer: string
  sortOrder: number
  visible: boolean
}

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  const error = await response.json().catch(() => null) as { message?: string } | null
  return error?.message ?? fallback
}

export async function fetchSupportFaqs(options: RequestInit = {}): Promise<SupportFaq[]> {
  const response = await fetch(`${API_BASE_URL}/support/faqs`, options)

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Failed to load FAQ.'))
  }

  return response.json()
}
