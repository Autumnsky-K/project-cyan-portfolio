import { type FormEvent, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useGoodsQna } from './useGoodsQna'

function formatInquiryDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' }).format(date)
}

function GoodsQnaPanel({ goodsId }: { goodsId: number }) {
  const location = useLocation()
  const navigate = useNavigate()

  const navigateToLogin = useCallback(() => {
    const returnTo = `${location.pathname}${location.search}${location.hash}`
    window.sessionStorage.setItem('project-cyan:login-return-to', returnTo)
    navigate('/login', { state: { from: returnTo } })
  }, [location.hash, location.pathname, location.search, navigate])

  const {
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
  } = useGoodsQna(goodsId, navigateToLogin)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void submitInquiry()
  }

  return (
    <section className="goods-reviews goods-qna" aria-labelledby="goods-qna-heading">
      <div className="review-compose-bar">
        <div>
          <strong id="goods-qna-heading">상품이 궁금하신가요?</strong>
          {formMessage && <p className="review-form-message" role="status">{formMessage}</p>}
        </div>
        <button
          type="button"
          aria-expanded={isFormOpen}
          onClick={() => setIsFormOpen((value) => !value)}
        >
          {isFormOpen ? '작성 취소' : '문의하기'}
        </button>
      </div>

      {isFormOpen && (
        <form className="review-form" onSubmit={handleSubmit}>
          {!isSignedIn ? (
            <div className="review-state">
              <strong>로그인 후 문의를 남길 수 있습니다.</strong>
              <button type="button" onClick={navigateToLogin}>로그인</button>
            </div>
          ) : (
            <>
              <label>
                <span>제목</span>
                <input
                  maxLength={100}
                  placeholder="문의 제목을 입력해 주세요."
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </label>
              <label>
                <span>내용</span>
                <textarea
                  maxLength={1000}
                  placeholder="상품에 대해 궁금한 점을 남겨주세요."
                  rows={4}
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                />
              </label>
              <label className="qna-secret-toggle">
                <input
                  checked={secret}
                  type="checkbox"
                  onChange={(event) => setSecret(event.target.checked)}
                />
                <span>비밀글로 작성 (작성자만 내용을 볼 수 있습니다)</span>
              </label>
              <div className="review-form-actions">
                <span>{content.trim().length}/1000</span>
                <button disabled={isSaving} type="submit">
                  {isSaving ? '등록 중...' : '문의 등록'}
                </button>
              </div>
            </>
          )}
        </form>
      )}

      <div className="review-list-heading">
        <h2>상품 Q&amp;A</h2>
      </div>

      {status === 'loading' && <div className="review-state">문의를 불러오는 중입니다...</div>}
      {status === 'error' && <div className="review-state error-state">{error}</div>}
      {status === 'data' && (inquiriesPage?.content.length ?? 0) === 0 && (
        <div className="review-state">아직 등록된 문의가 없습니다.</div>
      )}
      {status === 'data' && (inquiriesPage?.content ?? []).map((inquiry) => (
        <article className="review-item" key={inquiry.inquiryId}>
          <div className="review-item-meta">
            <strong>{inquiry.secret && '🔒 '}{inquiry.title}</strong>
            <span aria-label="답변 상태">{inquiry.status === 'ANSWERED' ? '답변완료' : '답변대기'}</span>
            <time dateTime={inquiry.createdAt}>{formatInquiryDate(inquiry.createdAt)}</time>
          </div>
          {inquiry.content !== null ? (
            <p>{inquiry.content}</p>
          ) : (
            <p>비밀글입니다. 작성자만 내용을 확인할 수 있습니다.</p>
          )}
          {inquiry.answerContent && (
            <p className="qna-answer">
              <strong>답변</strong> {inquiry.answerContent}
            </p>
          )}
        </article>
      ))}

      {(inquiriesPage?.totalPages ?? 0) > 1 && (
        <nav className="review-pagination" aria-label="문의 페이지">
          <button disabled={page === 0} type="button" onClick={() => setPage((value) => value - 1)}>
            이전
          </button>
          <span>{page + 1} / {inquiriesPage?.totalPages}</span>
          <button
            disabled={page >= (inquiriesPage?.totalPages ?? 1) - 1}
            type="button"
            onClick={() => setPage((value) => value + 1)}
          >
            다음
          </button>
        </nav>
      )}
    </section>
  )
}

export default GoodsQnaPanel
