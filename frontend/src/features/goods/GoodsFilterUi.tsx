import { useEffect, useState } from 'react'
import type { GoodsFilterOption } from '../../api/goods'

export type GoodsFilterParam = 'categoryIds' | 'artistIds' | 'tags'
export type GoodsSelectedFilters = Record<GoodsFilterParam, string[]>
export type GoodsFilterGroup = {
  title: string
  param: GoodsFilterParam
  options: GoodsFilterOption[]
}

type FilterContentsProps = {
  groups: GoodsFilterGroup[]
  filterStatus: 'loading' | 'data' | 'error'
  selectedFilters: GoodsSelectedFilters
  onToggle: (param: GoodsFilterParam, value: string) => void
}

type GoodsFilterUiProps = FilterContentsProps & {
  isMobileOpen: boolean
  onCloseMobile: () => void
  onOpenMobile: () => void
  onApplyMobile: (selectedFilters: GoodsSelectedFilters) => void
  onReset: () => void
}

const CATEGORY_FILTER_SECTIONS = [
  { type: 'PHYSICAL', label: '실물 굿즈' },
  { type: 'DIGITAL', label: '디지털 굿즈' },
]

function copySelectedFilters(selectedFilters: GoodsSelectedFilters): GoodsSelectedFilters {
  return {
    categoryIds: [...selectedFilters.categoryIds],
    artistIds: [...selectedFilters.artistIds],
    tags: [...selectedFilters.tags],
  }
}

function optionFulfillmentType(option: GoodsFilterOption) {
  return (option.fulfillmentType ?? 'PHYSICAL').toUpperCase()
}

function renderFilterOption(
  group: GoodsFilterGroup,
  option: GoodsFilterOption,
  selectedFilters: GoodsSelectedFilters,
  onToggle: (param: GoodsFilterParam, value: string) => void,
) {
  return (
    <label key={option.value}>
      <input
        type="checkbox"
        checked={selectedFilters[group.param].includes(option.value)}
        onChange={() => onToggle(group.param, option.value)}
      />
      <span>{option.label}</span>
    </label>
  )
}

function FilterContents({
  groups,
  filterStatus,
  selectedFilters,
  onToggle,
}: FilterContentsProps) {
  return (
    <>
      {filterStatus === 'loading' && <p className="filter-note">필터를 불러오는 중입니다.</p>}
      {filterStatus === 'error' && <p className="filter-note">필터를 불러오지 못했습니다.</p>}
      {groups.map((group) => (
        <fieldset className="filter-group" key={group.title}>
          <legend>{group.title}</legend>
          {group.param === 'categoryIds' ? (
            <div className="filter-options filter-options-sectioned">
              {CATEGORY_FILTER_SECTIONS
                .map((section) => ({
                  ...section,
                  options: group.options.filter((option) => optionFulfillmentType(option) === section.type),
                }))
                .filter((section) => section.options.length > 0)
                .map((section) => (
                  <div className="filter-option-section" key={section.type}>
                    <div className="filter-option-divider"><span>{section.label}</span></div>
                    {section.options.map((option) => renderFilterOption(group, option, selectedFilters, onToggle))}
                  </div>
                ))}
            </div>
          ) : (
            <div className="filter-options">
              {group.options.map((option) => renderFilterOption(group, option, selectedFilters, onToggle))}
            </div>
          )}
        </fieldset>
      ))}
    </>
  )
}

function GoodsFilterUi({
  groups,
  filterStatus,
  selectedFilters,
  isMobileOpen,
  onCloseMobile,
  onOpenMobile,
  onApplyMobile,
  onReset,
  onToggle,
}: GoodsFilterUiProps) {
  const selectedCount = Object.values(selectedFilters).reduce((total, values) => total + values.length, 0)
  const [draftSelectedFilters, setDraftSelectedFilters] = useState(() => copySelectedFilters(selectedFilters))

  function openMobileFilters() {
    setDraftSelectedFilters(copySelectedFilters(selectedFilters))
    onOpenMobile()
  }

  function toggleDraftFilter(param: GoodsFilterParam, value: string) {
    setDraftSelectedFilters((current) => {
      const currentValues = current[param]
      return {
        ...current,
        [param]: currentValues.includes(value)
          ? currentValues.filter((currentValue) => currentValue !== value)
          : [...currentValues, value],
      }
    })
  }

  function applyMobileFilters() {
    onApplyMobile(copySelectedFilters(draftSelectedFilters))
    onCloseMobile()
  }

  useEffect(() => {
    if (!isMobileOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onCloseMobile()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMobileOpen, onCloseMobile])

  return (
    <>
      <button className="mobile-filter-trigger" type="button" onClick={openMobileFilters}>
        필터 {selectedCount > 0 && <span>{selectedCount}</span>}
      </button>

      <aside className="filter-panel desktop-filter-panel" aria-label="굿즈 필터">
        <div className="panel-heading">
          <h2>필터</h2>
          <button type="button" onClick={onReset}>초기화</button>
        </div>
        <FilterContents
          groups={groups}
          filterStatus={filterStatus}
          selectedFilters={selectedFilters}
          onToggle={onToggle}
        />
      </aside>

      {isMobileOpen && (
        <div className="mobile-filter-layer" role="presentation" onMouseDown={onCloseMobile}>
          <section
            className="mobile-filter-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-filter-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mobile-filter-header">
              <h2 id="mobile-filter-title">필터</h2>
              <button type="button" aria-label="필터 닫기" onClick={onCloseMobile}>×</button>
            </div>
            <div className="mobile-filter-body">
              <FilterContents
                groups={groups}
                filterStatus={filterStatus}
                selectedFilters={draftSelectedFilters}
                onToggle={toggleDraftFilter}
              />
            </div>
            <div className="mobile-filter-actions">
              <button
                type="button"
                onClick={() => setDraftSelectedFilters({ categoryIds: [], artistIds: [], tags: [] })}
              >
                초기화
              </button>
              <button className="mobile-filter-apply" type="button" onClick={applyMobileFilters}>
                적용
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  )
}

export default GoodsFilterUi
