import { useCallback, useEffect, useRef, useState } from 'react'
import type { GoodsFilterGroup, GoodsFilterParam, GoodsSelectedFilters } from './GoodsFilterUi'
import { useDismissiblePopover } from './useDismissiblePopover'

type GoodsActiveFilterChipsProps = {
  groups: GoodsFilterGroup[]
  selectedFilters: GoodsSelectedFilters
  onRemoveFilter: (param: GoodsFilterParam, value: string) => void
}

function GoodsActiveFilterChips({
  groups,
  selectedFilters,
  onRemoveFilter,
}: GoodsActiveFilterChipsProps) {
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
  const closeMorePopover = useCallback(() => setIsMoreOpen(false), [])

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

  useDismissiblePopover({
    containerRef: moreRef,
    enabled: isMoreOpen,
    onDismiss: closeMorePopover,
  })

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
      aria-label={hasActiveFilters ? '적용된 필터' : undefined}
      aria-hidden={!hasActiveFilters}
    >
      {hasActiveFilters && (
        <>
          <span className="active-filter-label">적용됨</span>
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

export default GoodsActiveFilterChips
