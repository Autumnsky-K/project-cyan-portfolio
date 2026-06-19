import { useEffect, useRef, useState } from 'react'
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

function copySelectedFilters(selectedFilters: GoodsSelectedFilters): GoodsSelectedFilters {
  return {
    categoryIds: [...selectedFilters.categoryIds],
    artistIds: [...selectedFilters.artistIds],
    tags: [...selectedFilters.tags],
  }
}

function FilterContents({
  groups,
  filterStatus,
  selectedFilters,
  onToggle,
}: FilterContentsProps) {
  return (
    <>
      {filterStatus === 'loading' && <p className="filter-note">Loading filters...</p>}
      {filterStatus === 'error' && <p className="filter-note">Unable to load filters.</p>}
      {groups.map((group) => (
        <fieldset className="filter-group" key={group.title}>
          <legend>{group.title}</legend>
          <div className="filter-options">
            {group.options.map((option) => (
              <label key={option.value}>
                <input
                  type="checkbox"
                  checked={selectedFilters[group.param].includes(option.value)}
                  onChange={() => onToggle(group.param, option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
    </>
  )
}

export function GoodsActiveFilterChips({
  groups,
  selectedFilters,
  onRemoveFilter,
}: {
  groups: GoodsFilterGroup[]
  selectedFilters: GoodsSelectedFilters
  onRemoveFilter: (param: GoodsFilterParam, value: string) => void
}) {
  const chips = groups.flatMap((group) =>
    selectedFilters[group.param].map((value) => ({
      key: `${group.param}:${value}`,
      label: group.options.find((option) => option.value === value)?.label ?? value,
      param: group.param,
      value,
    })),
  )
  const hasActiveFilters = chips.length > 0
  const allChips = chips.map((chip) => ({
    key: chip.key,
    label: chip.label,
    onRemove: () => onRemoveFilter(chip.param, chip.value),
  }))
  const visibleChips = allChips.slice(0, 2)
  const hiddenChips = allChips.slice(visibleChips.length)
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const moreRef = useRef<HTMLDivElement | null>(null)
  const closeTimerRef = useRef<number | null>(null)

  function openMoreFilters() {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    setIsMoreOpen(true)
  }

  function closeMoreFilters() {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current)
    }
    closeTimerRef.current = window.setTimeout(() => {
      setIsMoreOpen(false)
      closeTimerRef.current = null
    }, 220)
  }

  useEffect(() => {
    if (!isMoreOpen) return undefined

    function closeOnOutsideClick(event: MouseEvent) {
      if (!moreRef.current?.contains(event.target as Node)) setIsMoreOpen(false)
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsMoreOpen(false)
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isMoreOpen])

  useEffect(
    () => () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current)
      }
    },
    [],
  )

  return (
    <div
      className="active-filter-bar"
      data-empty={!hasActiveFilters}
      aria-label={hasActiveFilters ? 'Applied filters' : undefined}
      aria-hidden={!hasActiveFilters}
    >
      {hasActiveFilters && (
        <>
          <span className="active-filter-label">Applied</span>
          {visibleChips.map((chip) => (
            <button type="button" key={chip.key} onClick={chip.onRemove}>
              {chip.label} <span aria-hidden="true">×</span>
            </button>
          ))}
          {hiddenChips.length > 0 && (
            <div
              className="active-filter-more-wrap"
              ref={moreRef}
              onMouseEnter={openMoreFilters}
              onMouseLeave={closeMoreFilters}
              onFocus={openMoreFilters}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setIsMoreOpen(false)
              }}
            >
              <button
                className="active-filter-more"
                type="button"
                aria-expanded={isMoreOpen}
                aria-haspopup="menu"
                onClick={() => setIsMoreOpen((current) => !current)}
              >
                +{hiddenChips.length}
              </button>
              {isMoreOpen && (
                <div className="active-filter-popover" role="menu">
                  {hiddenChips.map((chip) => (
                    <button
                      type="button"
                      role="menuitem"
                      key={chip.key}
                      onClick={() => {
                        chip.onRemove()
                      }}
                    >
                      <span>{chip.label}</span>
                      <span aria-hidden="true">×</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
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
        Filters {selectedCount > 0 && <span>{selectedCount}</span>}
      </button>

      <aside className="filter-panel desktop-filter-panel" aria-label="Goods filters">
        <div className="panel-heading">
          <h2>Filters</h2>
          <button type="button" onClick={onReset}>Reset</button>
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
              <div>
                <p>Refine results</p>
                <h2 id="mobile-filter-title">Filters</h2>
              </div>
              <button type="button" aria-label="Close filters" onClick={onCloseMobile}>×</button>
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
                Reset
              </button>
              <button className="mobile-filter-apply" type="button" onClick={applyMobileFilters}>
                View results
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  )
}

export default GoodsFilterUi
