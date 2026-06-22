type GoodsListStateProps = {
  kind: 'empty' | 'error'
  message?: string
  onAction: () => void
}

export function GoodsCardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="goods-grid goods-skeleton-grid" aria-label="Loading goods" aria-busy="true">
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
      <strong>{isError ? 'Unable to load goods' : 'No goods found'}</strong>
      <span>
        {isError
          ? message || 'The store could not be reached. Please try again.'
          : 'Try another search or clear the applied filters.'}
      </span>
      <button type="button" onClick={onAction}>
        {isError ? 'Try again' : 'Clear filters'}
      </button>
    </div>
  )
}

export default GoodsListState
