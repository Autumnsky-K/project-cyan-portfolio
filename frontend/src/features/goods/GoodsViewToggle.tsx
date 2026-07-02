import type { GoodsViewMode } from './useGoodsListQueryState'

type GoodsViewToggleProps = {
  label: string
  viewMode: GoodsViewMode
  onViewModeChange: (viewMode: GoodsViewMode) => void
}

function GoodsViewToggle({ label, viewMode, onViewModeChange }: GoodsViewToggleProps) {
  return (
    <div className="view-toggle" aria-label={label}>
      <button
        type="button"
        aria-label="그리드 보기"
        aria-pressed={viewMode === 'grid'}
        onClick={() => onViewModeChange('grid')}
      >
        <span className="view-icon view-icon-grid" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="리스트 보기"
        aria-pressed={viewMode === 'list'}
        onClick={() => onViewModeChange('list')}
      >
        <span className="view-icon view-icon-list" aria-hidden="true" />
      </button>
    </div>
  )
}

export default GoodsViewToggle
