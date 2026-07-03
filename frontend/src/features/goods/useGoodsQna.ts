import { useCallback, useEffect, useState } from 'react'
import {
  createGoodsInquiry,
  fetchGoodsInquiries,
  type GoodsInquiry,
  type PageResponse,
} from '../../api/goods'
import { hasSpringApiSession } from '../../shared/api/springApiClient'

export type QnaStatus = 'loading' | 'data' | 'error'

export function useGoodsQna(goodsId: number, onRequireSignIn: () => void) {
  const [inquiriesPage, setInquiriesPage] = useState<PageResponse<GoodsInquiry> | null>(null)
  const [status, setStatus] = useState<QnaStatus>('loading')
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [secret, setSecret] = useState(true)
  const [formMessage, setFormMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const loadInquiries = useCallback(async (signal?: AbortSignal) => {
    const signedIn = await hasSpringApiSession()
    const nextInquiriesPage = await fetchGoodsInquiries(goodsId, page, 10, signal ? { signal } : {})
    return { nextInquiriesPage, signedIn }
  }, [goodsId, page])

  useEffect(() => {
    const controller = new AbortController()

    async function loadInitialInquiries() {
      setStatus('loading')
      setError('')
      const { nextInquiriesPage, signedIn } = await loadInquiries(controller.signal)

      if (controller.signal.aborted) return
      setInquiriesPage(nextInquiriesPage)
      setIsSignedIn(signedIn)
      setStatus('data')
    }

    loadInitialInquiries().catch((loadError) => {
      if (loadError instanceof DOMException && loadError.name === 'AbortError') return
      setError(loadError instanceof Error ? loadError.message : '문의를 불러오지 못했습니다.')
      setStatus('error')
    })

    return () => controller.abort()
  }, [loadInquiries])

  async function submitInquiry() {
    if (!isSignedIn) {
      onRequireSignIn()
      return
    }

    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()
    if (!trimmedTitle || !trimmedContent) {
      setFormMessage('제목과 내용을 입력해 주세요.')
      return
    }

    setIsSaving(true)
    setFormMessage('')
    try {
      await createGoodsInquiry(goodsId, { title: trimmedTitle, content: trimmedContent, secret })
      setTitle('')
      setContent('')
      setSecret(true)
      setFormMessage('문의가 등록되었습니다.')
      setIsFormOpen(false)
      const { nextInquiriesPage } = await loadInquiries()
      setInquiriesPage(nextInquiriesPage)
    } catch (submitError) {
      setFormMessage(submitError instanceof Error ? submitError.message : '문의를 등록하지 못했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  return {
    content,
    error,
    formMessage,
    inquiriesPage,
    isFormOpen,
    isSaving,
    isSignedIn,
    page,
    secret,
    setContent,
    setIsFormOpen,
    setPage,
    setSecret,
    setTitle,
    status,
    submitInquiry,
    title,
  }
}
