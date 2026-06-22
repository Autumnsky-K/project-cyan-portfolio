import { useEffect, useMemo, useRef, useState } from 'react'
import type { GoodsQueryParams } from '../../api/goods'
import type { GoodsFilterParam, GoodsSelectedFilters } from './GoodsFilterUi'
import { useDebouncedValue } from './useDebouncedValue'

const ALLOWED_SORTS = new Set(['createdAt,desc', 'price,asc', 'price,desc', 'goodsName,asc'])
const EMPTY_FILTERS: GoodsSelectedFilters = { categoryIds: [], artistIds: [], tags: [] }

function readFilterParam(params: URLSearchParams, key: string) {
  const raw = params.get(key) ?? ''
  const separator = raw.includes(';') ? ';' : ','
  return raw.split(separator).map((value) => value.trim()).filter(Boolean)
}

function expandFilterValues(values: string[]) {
  return values.flatMap((value) => value.split('|')).filter(Boolean)
}

function readState() {
  const params = new URLSearchParams(window.location.search)
  const requestedSort = params.get('sort') ?? 'createdAt,desc'
  const requestedPage = Number(params.get('page') ?? 1)
  return {
    query: params.get('q') ?? '',
    sort: ALLOWED_SORTS.has(requestedSort) ? requestedSort : 'createdAt,desc',
    page: Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage - 1 : 0,
    selectedFilters: {
      categoryIds: readFilterParam(params, 'categories'),
      artistIds: readFilterParam(params, 'artists'),
      tags: readFilterParam(params, 'tags'),
    } satisfies GoodsSelectedFilters,
  }
}

function createUrl(query: string, sort: string, page: number, filters: GoodsSelectedFilters) {
  const params = new URLSearchParams()
  if (query.trim()) params.set('q', query.trim())
  if (sort !== 'createdAt,desc') params.set('sort', sort)
  if (page > 0) params.set('page', String(page + 1))
  if (filters.categoryIds.length) params.set('categories', filters.categoryIds.join(';'))
  if (filters.artistIds.length) params.set('artists', filters.artistIds.join(';'))
  if (filters.tags.length) params.set('tags', filters.tags.join(';'))
  return `${window.location.pathname}${params.size ? `?${params.toString()}` : ''}`
}

export function useGoodsListQueryState() {
  const [initialState] = useState(readState)
  const [query, setQuery] = useState(initialState.query)
  const [sort, setSort] = useState(initialState.sort)
  const [page, setPage] = useState(initialState.page)
  const [selectedFilters, setSelectedFilters] = useState(initialState.selectedFilters)
  const committedQueryRef = useRef(initialState.query.trim())
  const debouncedQuery = useDebouncedValue(query, 300)

  const requestParams = useMemo<GoodsQueryParams>(() => ({
    q: debouncedQuery,
    sort,
    page,
    size: 12,
    categoryIds: expandFilterValues(selectedFilters.categoryIds).join(','),
    artistIds: expandFilterValues(selectedFilters.artistIds).join(','),
    tags: expandFilterValues(selectedFilters.tags).join(','),
  }), [debouncedQuery, page, selectedFilters, sort])

  useEffect(() => {
    window.history.replaceState(null, '', createUrl(
      committedQueryRef.current,
      sort,
      page,
      selectedFilters,
    ))
  }, [page, selectedFilters, sort])

  useEffect(() => {
    function restoreHistoryState() {
      const restored = readState()
      committedQueryRef.current = restored.query.trim()
      setQuery(restored.query)
      setSort(restored.sort)
      setPage(restored.page)
      setSelectedFilters(restored.selectedFilters)
    }

    window.addEventListener('popstate', restoreHistoryState)
    return () => window.removeEventListener('popstate', restoreHistoryState)
  }, [])

  function toggleFilter(param: GoodsFilterParam, value: string) {
    setPage(0)
    setSelectedFilters((current) => ({
      ...current,
      [param]: current[param].includes(value)
        ? current[param].filter((currentValue) => currentValue !== value)
        : [...current[param], value],
    }))
  }

  function reset() {
    committedQueryRef.current = ''
    setQuery('')
    setSort('createdAt,desc')
    setPage(0)
    setSelectedFilters(EMPTY_FILTERS)
  }

  function commitSearch(value: string) {
    const normalizedValue = value.trim()
    if (normalizedValue === committedQueryRef.current) return
    committedQueryRef.current = normalizedValue
    window.history.pushState(null, '', createUrl(normalizedValue, sort, 0, selectedFilters))
  }

  return {
    query,
    setQuery,
    sort,
    setSort,
    page,
    setPage,
    selectedFilters,
    setSelectedFilters,
    requestParams,
    toggleFilter,
    reset,
    commitSearch,
  }
}
