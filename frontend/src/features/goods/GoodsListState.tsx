import Button from '../../shared/components/Button'

type GoodsListStateProps = {
  kind: 'empty' | 'error'
  message?: string
  onAction: () => void
}

export function GoodsCardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="goods-grid goods-skeleton-grid" aria-label="굿즈를 불러오는 중" aria-busy="true">
      {Array.from({ length: count }, (_, index) => (
        <article className="goods-card goods-card-skeleton" aria-hidden="true" key={index}>
          <div className="goods-image skeleton-block" />
          <div className="goods-card-body">
            <span className="skeleton-line skeleton-line-short" />
            <span className="skeleton-line skeleton-line-title" />
            <span className="skeleton-line skeleton-line-medium" />
            <span className="skeleton-line" />
            <span className="skeleton-line skeleton-line-short" />
          </div>
        </article>
      ))}
    </div>
  )
}

function GoodsListState({ kind, message, onAction }: GoodsListStateProps) {
  const isError = kind === 'error'

  return (
    <div className={`goods-state ${isError ? 'error-state' : ''}`} role={isError ? 'alert' : 'status'}>
      <span className="goods-state-mark" aria-hidden="true">
        {isError ? '!' : '0'}
      </span>
      <strong>{isError ? '굿즈를 불러오지 못했습니다' : '조건에 맞는 상품이 없습니다'}</strong>
      <span>
        {isError
          ? message || '잠시 후 다시 시도해 주세요.'
          : '다른 검색어를 입력하거나 적용된 필터를 초기화해 주세요.'}
      </span>
      <Button variant="primary" onClick={onAction}>
        {isError ? '다시 시도' : '필터 초기화'}
      </Button>
    </div>
  )
}

export default GoodsListState
