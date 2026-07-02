import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { GoodsQueryParams } from '../../api/goods'
import type { GoodsFilterParam, GoodsSelectedFilters } from './GoodsFilterUi'
import { useDebouncedValue } from './useDebouncedValue'

export type GoodsSection = 'all' | 'favorites'
export type GoodsViewMode = 'grid' | 'list'

const VIEW_COUNT_SORT = 'viewCount,desc'
const LIKE_COUNT_SORT = 'likeCount,desc'
const DEFAULT_VIEW_PERIOD = 'all'
const ALLOWED_SORTS = new Set(['createdAt,desc', VIEW_COUNT_SORT, LIKE_COUNT_SORT, 'price,asc', 'price,desc', 'goodsName,asc'])
const ALLOWED_VIEW_PERIODS = new Set([DEFAULT_VIEW_PERIOD, 'day', '7d', '30d'])
const EMPTY_FILTERS: GoodsSelectedFilters = { categoryIds: [], artistIds: [], tags: [] }
const GOODS_LIST_SCROLL_STATE_KEY = 'goodsListScrollY'
const MAX_RECOMMENDED_GOODS = 20
const SHOW_RECOMMENDATIONS_EVENT = 'project-cyan:show-recommendations'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readHistoryScrollY(state: unknown) {
  if (!isRecord(state)) return null
  const scrollY = state[GOODS_LIST_SCROLL_STATE_KEY]
  return typeof scrollY === 'number' && Number.isFinite(scrollY) && scrollY >= 0 ? scrollY : null
}

function saveCurrentHistoryScroll() {
  const currentState = isRecord(window.history.state) ? window.history.state : {}
  window.history.replaceState({
    ...currentState,
    [GOODS_LIST_SCROLL_STATE_KEY]: Math.round(window.scrollY),
  }, '')
}

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
  const requestedViewPeriod = params.get('viewPeriod') ?? DEFAULT_VIEW_PERIOD
  const requestedPage = Number(params.get('page') ?? 1)
  return {
    query: params.get('q') ?? '',
    sort: ALLOWED_SORTS.has(requestedSort) ? requestedSort : 'createdAt,desc',
    viewPeriod: ALLOWED_VIEW_PERIODS.has(requestedViewPeriod) ? requestedViewPeriod : DEFAULT_VIEW_PERIOD,
    page: Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage - 1 : 0,
    section: params.get('section') === 'favorites' ? 'favorites' as const : 'all' as const,
    viewMode: params.get('view') === 'list' ? 'list' as const : 'grid' as const,
    recommendedGoodsIds: [...new Set(
      readFilterParam(params, 'recommendations').filter((value) => /^\d+$/.test(value)),
    )].slice(0, MAX_RECOMMENDED_GOODS),
    selectedFilters: {
      categoryIds: readFilterParam(params, 'categories'),
      artistIds: readFilterParam(params, 'artists'),
      tags: readFilterParam(params, 'tags'),
    } satisfies GoodsSelectedFilters,
  }
}

function createUrl(
  query: string,
  sort: string,
  viewPeriod: string,
  page: number,
  filters: GoodsSelectedFilters,
  section: GoodsSection,
  viewMode: GoodsViewMode,
  recommendedGoodsIds: string[],
) {
  const params = new URLSearchParams()
  if (query.trim()) params.set('q', query.trim())
  if (sort !== 'createdAt,desc') params.set('sort', sort)
  if (sort === VIEW_COUNT_SORT && viewPeriod !== DEFAULT_VIEW_PERIOD) params.set('viewPeriod', viewPeriod)
  if (page > 0) params.set('page', String(page + 1))
  if (filters.categoryIds.length) params.set('categories', filters.categoryIds.join(';'))
  if (filters.artistIds.length) params.set('artists', filters.artistIds.join(';'))
  if (filters.tags.length) params.set('tags', filters.tags.join(';'))
  if (section === 'favorites') params.set('section', 'favorites')
  if (viewMode === 'list') params.set('view', 'list')
  if (recommendedGoodsIds.length >= 2) {
    params.set('recommendations', recommendedGoodsIds.join(','))
  }
  return `${window.location.pathname}${params.size ? `?${params.toString()}` : ''}`
}

export function useGoodsListQueryState() {
  const [initialState] = useState(readState)
  const [query, setQueryState] = useState(initialState.query)
  const [sort, setSort] = useState(initialState.sort)
  const [viewPeriod, setViewPeriod] = useState(initialState.viewPeriod)
  const [page, setPage] = useState(initialState.page)
  const [section, setSection] = useState<GoodsSection>(initialState.section)
  const [viewMode, setViewMode] = useState<GoodsViewMode>(initialState.viewMode)
  const [selectedFilters, setSelectedFilters] = useState(initialState.selectedFilters)
  const [recommendedGoodsIds, setRecommendedGoodsIds] = useState(
    initialState.recommendedGoodsIds,
  )
  const [pendingHistoryScrollY, setPendingHistoryScrollY] = useState<number | null>(null)
  const committedQueryRef = useRef(initialState.query.trim())
  const pageHistoryActionRef = useRef<'push' | 'replace'>('replace')
  const debouncedQuery = useDebouncedValue(query, 300)
  const clearPendingHistoryScroll = useCallback(() => setPendingHistoryScrollY(null), [])

  const requestParams = useMemo<GoodsQueryParams>(() => ({
    q: debouncedQuery,
    sort,
    viewPeriod: sort === VIEW_COUNT_SORT ? viewPeriod : undefined,
    page,
    size: 12,
    categoryIds: expandFilterValues(selectedFilters.categoryIds).join(','),
    artistIds: expandFilterValues(selectedFilters.artistIds).join(','),
    tags: expandFilterValues(selectedFilters.tags).join(','),
    goodsIds: recommendedGoodsIds.join(','),
  }), [debouncedQuery, page, recommendedGoodsIds, selectedFilters, sort, viewPeriod])

  useEffect(() => {
    const nextUrl = createUrl(
      committedQueryRef.current,
      sort,
      viewPeriod,
      page,
      selectedFilters,
      section,
      viewMode,
      recommendedGoodsIds,
    )
    if (pageHistoryActionRef.current === 'push') {
      window.history.pushState(null, '', nextUrl)
      pageHistoryActionRef.current = 'replace'
      return
    }
    window.history.replaceState(window.history.state, '', nextUrl)
  }, [page, recommendedGoodsIds, section, selectedFilters, sort, viewMode, viewPeriod])

  useEffect(() => {
    function restoreHistoryState(event: PopStateEvent) {
      const restored = readState()
      committedQueryRef.current = restored.query.trim()
      setPendingHistoryScrollY(readHistoryScrollY(event.state))
      setQueryState(restored.query)
      setSort(restored.sort)
      setViewPeriod(restored.viewPeriod)
      setPage(restored.page)
      setSection(restored.section)
      setViewMode(restored.viewMode)
      setSelectedFilters(restored.selectedFilters)
      setRecommendedGoodsIds(restored.recommendedGoodsIds)
    }

    window.addEventListener('popstate', restoreHistoryState)
    return () => window.removeEventListener('popstate', restoreHistoryState)
  }, [])

  useEffect(() => {
    function showRecommendations(event: Event) {
      if (!(event instanceof CustomEvent) || !Array.isArray(event.detail?.goodsIds)) {
        return
      }
      const goodsIds = [...new Set(
        event.detail.goodsIds.filter((value: unknown): value is string => (
          typeof value === 'string' && /^\d+$/.test(value)
        )),
      )].slice(0, MAX_RECOMMENDED_GOODS)
      if (goodsIds.length < 2) return

      committedQueryRef.current = ''
      setQueryState('')
      setPage(0)
      setSection('all')
      setSelectedFilters(EMPTY_FILTERS)
      setRecommendedGoodsIds(goodsIds)
    }

    window.addEventListener(SHOW_RECOMMENDATIONS_EVENT, showRecommendations)
    return () => window.removeEventListener(SHOW_RECOMMENDATIONS_EVENT, showRecommendations)
  }, [])

  function toggleFilter(param: GoodsFilterParam, value: string) {
    setPage(0)
    setRecommendedGoodsIds([])
    setSelectedFilters((current) => ({
      ...current,
      [param]: current[param].includes(value)
        ? current[param].filter((currentValue) => currentValue !== value)
        : [...current[param], value],
    }))
  }

  function reset() {
    committedQueryRef.current = ''
    setQueryState('')
    setSort('createdAt,desc')
    setViewPeriod(DEFAULT_VIEW_PERIOD)
    setPage(0)
    setSelectedFilters(EMPTY_FILTERS)
    setRecommendedGoodsIds([])
  }

  function setQuery(value: string) {
    setRecommendedGoodsIds([])
    setQueryState(value)
  }

  function updateSelectedFilters(filters: GoodsSelectedFilters) {
    setRecommendedGoodsIds([])
    setSelectedFilters(filters)
  }

  function clearRecommendations() {
    setRecommendedGoodsIds([])
    setPage(0)
  }

  function commitSearch(value: string) {
    const normalizedValue = value.trim()
    if (normalizedValue === committedQueryRef.current) return
    committedQueryRef.current = normalizedValue
    setRecommendedGoodsIds([])
    window.history.pushState(null, '', createUrl(
      normalizedValue,
      sort,
      viewPeriod,
      0,
      selectedFilters,
      section,
      viewMode,
      [],
    ))
  }

  function goToPage(nextPage: number) {
    setPage((currentPage) => {
      if (currentPage === nextPage) {
        pageHistoryActionRef.current = 'replace'
        return currentPage
      }
      saveCurrentHistoryScroll()
      pageHistoryActionRef.current = 'push'
      return nextPage
    })
  }

  return {
    query,
    setQuery,
    sort,
    setSort,
    viewPeriod,
    setViewPeriod,
    page,
    setPage,
    section,
    setSection,
    viewMode,
    setViewMode,
    selectedFilters,
    setSelectedFilters: updateSelectedFilters,
    recommendedGoodsIds,
    clearRecommendations,
    requestParams,
    pendingHistoryScrollY,
    clearPendingHistoryScroll,
    toggleFilter,
    reset,
    commitSearch,
    goToPage,
  }
}
