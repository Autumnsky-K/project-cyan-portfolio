import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react'

type GoodsPaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

function GoodsPagination({ currentPage, totalPages, onPageChange }: GoodsPaginationProps) {
  const [isJumpOpen, setIsJumpOpen] = useState(false)
  const [jumpValue, setJumpValue] = useState('')
  const jumpRef = useRef<HTMLDivElement | null>(null)

  const pageNumbers = useMemo(() => {
    const maxVisiblePages = 5
    const halfWindow = Math.floor(maxVisiblePages / 2)
    const startPage = Math.max(0, Math.min(currentPage - halfWindow, totalPages - maxVisiblePages))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages)
    return Array.from({ length: endPage - startPage }, (_, index) => startPage + index)
  }, [currentPage, totalPages])

  useEffect(() => {
    if (!isJumpOpen) return undefined

    function closeOnOutsideClick(event: MouseEvent) {
      if (!jumpRef.current?.contains(event.target as Node)) setIsJumpOpen(false)
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsJumpOpen(false)
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isJumpOpen])

  if (totalPages < 1) return null

  function changePage(nextPage: number) {
    onPageChange(Math.min(Math.max(nextPage, 0), totalPages - 1))
    setIsJumpOpen(false)
  }

  function submitJump(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const requestedPage = Number(jumpValue)
    if (!Number.isInteger(requestedPage)) return
    changePage(requestedPage - 1)
    setJumpValue('')
  }

  return (
    <nav className="goods-pagination" aria-label="Goods pagination">
      <div className="pagination-controls">
        <button
          className="pagination-arrow"
          aria-label="이전 페이지"
          type="button"
          disabled={currentPage === 0}
          onClick={() => changePage(currentPage - 1)}
        >
          ‹
        </button>
        <div className="page-number-list">
          {pageNumbers.map((pageNumber) => (
            <button
              aria-current={pageNumber === currentPage ? 'page' : undefined}
              key={pageNumber}
              type="button"
              onClick={() => changePage(pageNumber)}
            >
              {pageNumber + 1}
            </button>
          ))}
        </div>
        <button
          className="pagination-arrow"
          aria-label="다음 페이지"
          type="button"
          disabled={currentPage >= totalPages - 1}
          onClick={() => changePage(currentPage + 1)}
        >
          ›
        </button>
      </div>
      <div className="pagination-status-wrap" ref={jumpRef}>
        {isJumpOpen ? (
          <form className="pagination-inline-jump" aria-label="페이지 이동" onSubmit={submitJump}>
            <input
              autoFocus
              aria-label="페이지 번호"
              inputMode="numeric"
              min="1"
              max={totalPages}
              type="number"
              value={jumpValue}
              onChange={(event) => setJumpValue(event.target.value)}
            />
            <span>/ {totalPages}</span>
            <button type="submit" disabled={!jumpValue}>이동</button>
          </form>
        ) : (
          <button
            className="pagination-status"
            aria-expanded="false"
            type="button"
            onClick={() => {
              setJumpValue(String(currentPage + 1))
              setIsJumpOpen(true)
            }}
          >
            {currentPage + 1} / {totalPages}
          </button>
        )}
      </div>
    </nav>
  )
}

export default GoodsPagination
