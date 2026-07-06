import { useEffect, useState } from 'react'
import { fetchGoodsFilters, type GoodsFilterOption } from '../../api/goods'
import type { GoodsFilterGroup } from './GoodsFilterUi'

export type FilterStatus = 'loading' | 'data' | 'error'

function uniqueFilterOptions(options: GoodsFilterOption[] = []) {
  return [...new Map(
    options.map((option) => [
      `${option.label.trim().toLocaleLowerCase()}:${option.fulfillmentType ?? ''}:${option.groupValue ?? option.groupName ?? ''}`,
      option,
    ]),
  ).values()]
}

export function useGoodsFilters() {
  const [filters, setFilters] = useState<GoodsFilterGroup[]>([])
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('loading')

  useEffect(() => {
    const controller = new AbortController()

    async function loadFilters() {
      setFilterStatus('loading')

      try {
        const data = await fetchGoodsFilters({ signal: controller.signal })
        setFilters([
          { title: '카테고리', param: 'categoryIds', options: uniqueFilterOptions(data.categories) },
          { title: '아티스트', param: 'artistIds', options: uniqueFilterOptions(data.artists) },
          { title: '태그', param: 'tags', options: uniqueFilterOptions(data.tags) },
        ])
        setFilterStatus('data')
      } catch (loadError) {
        if (loadError instanceof Error && loadError.name === 'AbortError') {
          return
        }
        setFilters([])
        setFilterStatus('error')
      }
    }

    loadFilters()

    return () => {
      controller.abort()
    }
  }, [])

  return { filters, filterStatus }
}
