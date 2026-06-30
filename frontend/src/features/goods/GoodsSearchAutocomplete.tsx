import { type ChangeEvent, type KeyboardEvent, useMemo, useRef, useState } from 'react'

const RECENT_SEARCHES_KEY = 'project-cyan:goods-recent-searches'
const MAX_RECENT_SEARCHES = 5

type GoodsSearchAutocompleteProps = {
  query: string
  suggestions: string[]
  onQueryChange: (value: string) => void
  onSearchCommit: (value: string) => void
}

function readRecentSearches(): string[] {
  try {
    const value = window.localStorage.getItem(RECENT_SEARCHES_KEY)
    const parsed = value ? JSON.parse(value) : []
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

function GoodsSearchAutocomplete({
  query,
  suggestions,
  onQueryChange,
  onSearchCommit,
}: GoodsSearchAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>(readRecentSearches)
  const closeTimerRef = useRef<number | null>(null)
  const skipNextBlurCommitRef = useRef(false)

  const matchingSuggestions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()
    if (!normalizedQuery) {
      return []
    }

    return suggestions
      .filter((suggestion) => suggestion.toLocaleLowerCase().includes(normalizedQuery))
      .filter((suggestion) => suggestion.toLocaleLowerCase() !== normalizedQuery)
      .slice(0, 6)
  }, [query, suggestions])

  const visibleRecentSearches = query.trim() ? [] : recentSearches
  const hasOptions = visibleRecentSearches.length > 0 || matchingSuggestions.length > 0

  function persistRecentSearches(nextSearches: string[]) {
    setRecentSearches(nextSearches)
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(nextSearches))
  }

  function saveSearch(value: string) {
    const normalizedValue = value.trim()
    if (!normalizedValue) {
      return
    }

    const nextSearches = [
      normalizedValue,
      ...recentSearches.filter((item) => item.toLocaleLowerCase() !== normalizedValue.toLocaleLowerCase()),
    ].slice(0, MAX_RECENT_SEARCHES)
    persistRecentSearches(nextSearches)
  }

  function selectSearch(value: string) {
    skipNextBlurCommitRef.current = true
    onQueryChange(value)
    saveSearch(value)
    setIsOpen(false)
    onSearchCommit(value)
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onQueryChange(event.target.value)
    setIsOpen(true)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      saveSearch(query)
      setIsOpen(false)
      onSearchCommit(query)
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      skipNextBlurCommitRef.current = true
      setIsOpen(false)
      event.currentTarget.blur()
    }
  }

  function handleFocus() {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current)
    }
    setIsOpen(true)
  }

  function handleBlur() {
    closeTimerRef.current = window.setTimeout(() => setIsOpen(false), 120)
    if (skipNextBlurCommitRef.current) {
      skipNextBlurCommitRef.current = false
      return
    }
    onSearchCommit(query)
  }

  function removeRecentSearch(value: string) {
    persistRecentSearches(recentSearches.filter((item) => item !== value))
  }

  return (
    <div className="goods-search-autocomplete">
      <label className="search-field">
        <span>검색</span>
        <input
          type="search"
          placeholder="굿즈, 아티스트, 카테고리 검색"
          value={query}
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls="goods-search-suggestions"
          aria-expanded={isOpen && hasOptions}
          onBlur={handleBlur}
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
        />
      </label>

      {isOpen && hasOptions && (
        <div className="goods-search-menu" id="goods-search-suggestions" role="listbox">
          {visibleRecentSearches.length > 0 && (
            <section aria-label="최근 검색어">
              <div className="goods-search-menu-heading">
                <strong>최근 검색어</strong>
                <button type="button" onMouseDown={() => persistRecentSearches([])}>
                  모두 지우기
                </button>
              </div>
              {visibleRecentSearches.map((item) => (
                <div className="goods-search-option-row" key={item}>
                  <button type="button" role="option" onMouseDown={() => selectSearch(item)}>
                    <span aria-hidden="true">↺</span>
                    {item}
                  </button>
                  <button
                    className="goods-search-remove"
                    type="button"
                    aria-label={`${item} 최근 검색어에서 삭제`}
                    onMouseDown={() => removeRecentSearch(item)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </section>
          )}

          {matchingSuggestions.length > 0 && (
            <section aria-label="검색 제안">
              <div className="goods-search-menu-heading">
                <strong>추천 검색어</strong>
              </div>
              {matchingSuggestions.map((item) => (
                <button
                  className="goods-search-suggestion"
                  type="button"
                  role="option"
                  key={item}
                  onMouseDown={() => selectSearch(item)}
                >
                  <span aria-hidden="true">⌕</span>
                  {item}
                </button>
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  )
}

export default GoodsSearchAutocomplete
