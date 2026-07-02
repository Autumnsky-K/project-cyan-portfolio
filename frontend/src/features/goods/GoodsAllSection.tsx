import type { MouseEvent, RefObject } from 'react'
import type { GoodsSummary } from '../../api/goods'
import GoodsCards from './GoodsCards'
import GoodsFilterUi, { GoodsActiveFilterChips, type GoodsFilterGroup, type GoodsSelectedFilters } from './GoodsFilterUi'
import GoodsListState, { GoodsCardSkeleton } from './GoodsListState'
import GoodsPagination from './GoodsPagination'
import GoodsSearchAutocomplete from './GoodsSearchAutocomplete'
import GoodsViewToggle from './GoodsViewToggle'
import type { LoadStatus } from './useGoodsListData'
import type { GoodsViewMode } from './useGoodsListQueryState'

type GoodsAllSectionProps = {
  clearRecommendations: () => void
  currentPage: number
  emptyResultsMinHeight: number
  error: string
  filterStatus: 'loading' | 'data' | 'error'
  filters: GoodsFilterGroup[]
  goodsResultsRef: RefObject<HTMLDivElement | null>
  hasGoods: boolean
  isLiked: (goodsId: number) => boolean
  isLikePending: (goodsId: number) => boolean
  isMobileFilterOpen: boolean
  isViewCountSort: boolean
  onApplyMobileFilters: (nextFilters: GoodsSelectedFilters) => void
  onCloseMobileFilters: () => void
  onOpenDetail: (event: MouseEvent<HTMLAnchorElement>, goodsId: number) => void
  onOpenMobileFilters: () => void
  onPageChange: (page: number) => void
  onQueryChange: (query: string) => void
  onResetFilters: () => void
  onRetryGoods: () => void
  onSearchCommit: (query: string) => void
  onSortChange: (sort: string) => void
  onToggleFilter: (param: 'categoryIds' | 'artistIds' | 'tags', value: string) => void
  onToggleLike: (item: GoodsSummary) => void | Promise<void>
  onViewModeChange: (viewMode: GoodsViewMode) => void
  onViewPeriodChange: (viewPeriod: string) => void
  query: string
  recommendedGoodsIds: string[]
  resultsStartRef: RefObject<HTMLDivElement | null>
  searchSuggestions: string[]
  searchToolbarRef: RefObject<HTMLElement | null>
  selectedFilters: GoodsSelectedFilters
  sort: string
  status: LoadStatus
  totalElements: number
  totalPages: number
  viewMode: GoodsViewMode
  viewPeriod: string
  visibleGoods: GoodsSummary[]
}

function GoodsAllSection({
  clearRecommendations,
  currentPage,
  emptyResultsMinHeight,
  error,
  filterStatus,
  filters,
  goodsResultsRef,
  hasGoods,
  isLiked,
  isLikePending,
  isMobileFilterOpen,
  isViewCountSort,
  onApplyMobileFilters,
  onCloseMobileFilters,
  onOpenDetail,
  onOpenMobileFilters,
  onPageChange,
  onQueryChange,
  onResetFilters,
  onRetryGoods,
  onSearchCommit,
  onSortChange,
  onToggleFilter,
  onToggleLike,
  onViewModeChange,
  onViewPeriodChange,
  query,
  recommendedGoodsIds,
  resultsStartRef,
  searchSuggestions,
  searchToolbarRef,
  selectedFilters,
  sort,
  status,
  totalElements,
  totalPages,
  viewMode,
  viewPeriod,
  visibleGoods,
}: GoodsAllSectionProps) {
  return (
    <>
      <section className="store-toolbar" ref={searchToolbarRef} aria-label="굿즈 검색 및 정렬">
        <GoodsSearchAutocomplete
          query={query}
          suggestions={searchSuggestions}
          onQueryChange={onQueryChange}
          onSearchCommit={onSearchCommit}
        />
        <label className="sort-field">
          <span>정렬</span>
          <select value={sort} onChange={(event) => onSortChange(event.target.value)}>
            <option value="createdAt,desc">최신순</option>
            <option value="viewCount,desc">조회순</option>
            <option value="likeCount,desc">좋아요순</option>
            <option value="price,asc">낮은 가격순</option>
            <option value="price,desc">높은 가격순</option>
            <option value="goodsName,asc">이름순</option>
          </select>
        </label>
      </section>

      <section className="store-layout" id="goods">
        <GoodsFilterUi
          groups={filters}
          filterStatus={filterStatus}
          selectedFilters={selectedFilters}
          isMobileOpen={isMobileFilterOpen}
          onCloseMobile={onCloseMobileFilters}
          onOpenMobile={onOpenMobileFilters}
          onApplyMobile={onApplyMobileFilters}
          onReset={onResetFilters}
          onToggle={onToggleFilter}
        />

        <div className="goods-content">
          {recommendedGoodsIds.length >= 2 && (
            <div className="active-filter-bar" role="status">
              <span className="active-filter-label">
                AI 추천 상품 {recommendedGoodsIds.length}개
              </span>
              <button type="button" onClick={clearRecommendations}>전체 상품 보기</button>
            </div>
          )}
          <GoodsActiveFilterChips
            groups={filters}
            selectedFilters={selectedFilters}
            onRemoveFilter={onToggleFilter}
          />
          <div className="result-summary" ref={resultsStartRef}>
            <div>
              <p>
                {status === 'loading'
                  ? '굿즈를 불러오는 중'
                  : `총 ${totalElements}개의 상품`}
              </p>
            </div>
            <div className="result-controls">
              <label className="view-period-field" aria-hidden={!isViewCountSort} data-visible={isViewCountSort}>
                <span>조회 기간</span>
                <select
                  value={viewPeriod}
                  tabIndex={isViewCountSort ? undefined : -1}
                  onChange={(event) => onViewPeriodChange(event.target.value)}
                >
                  <option value="all">전체</option>
                  <option value="day">최근 24시간</option>
                  <option value="7d">최근 7일</option>
                  <option value="30d">최근 30일</option>
                </select>
              </label>
              <GoodsViewToggle
                label="보기 방식"
                viewMode={viewMode}
                onViewModeChange={onViewModeChange}
              />
            </div>
          </div>

          <div
            className="goods-results"
            ref={goodsResultsRef}
            style={status === 'empty' ? { minHeight: emptyResultsMinHeight } : undefined}
          >
            {status === 'loading' && !hasGoods && <GoodsCardSkeleton />}

            {status === 'error' && (
              <GoodsListState kind="error" message={error} onAction={onRetryGoods} />
            )}

            {status === 'empty' && !hasGoods && <GoodsListState kind="empty" onAction={onResetFilters} />}

            {hasGoods && (
              <div data-refreshing={status === 'refreshing'}>
                <GoodsCards
                  items={visibleGoods}
                  viewMode={viewMode}
                  isLiked={isLiked}
                  isLikePending={isLikePending}
                  toggleLike={onToggleLike}
                  onOpenDetail={onOpenDetail}
                />
              </div>
            )}
          </div>

          <GoodsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      </section>
    </>
  )
}

export default GoodsAllSection
