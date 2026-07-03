// @vitest-environment jsdom

import { act, renderHook, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import { useGoodsListQueryState } from './useGoodsListQueryState'

describe('useGoodsListQueryState recommendation results', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/goods?recommendations=42,84')
  })

  it('requests only recommended goods and can return to all goods', async () => {
    const { result } = renderHook(() => useGoodsListQueryState(), {
      wrapper: BrowserRouter,
    })

    expect(result.current.recommendedGoodsIds).toEqual(['42', '84'])
    expect(result.current.requestParams.goodsIds).toBe('42,84')

    act(() => result.current.clearRecommendations())

    await waitFor(() => {
      expect(result.current.recommendedGoodsIds).toEqual([])
      expect(result.current.requestParams.goodsIds).toBe('')
      expect(window.location.search).toBe('')
    })
  })

  it('updates an already mounted goods page from the chatbot event', async () => {
    window.history.replaceState(null, '', '/goods')
    const { result } = renderHook(() => useGoodsListQueryState(), {
      wrapper: BrowserRouter,
    })

    act(() => window.dispatchEvent(new CustomEvent('project-cyan:show-recommendations', {
      detail: { goodsIds: ['7', '9'] },
    })))

    await waitFor(() => {
      expect(result.current.recommendedGoodsIds).toEqual(['7', '9'])
      expect(result.current.requestParams.goodsIds).toBe('7,9')
    })
  })

  it('accepts filter id query aliases from external links', () => {
    window.history.replaceState(null, '', '/goods?categoryIds=10;11&artistIds=7&tags=Voice')
    const { result } = renderHook(() => useGoodsListQueryState(), {
      wrapper: BrowserRouter,
    })

    expect(result.current.selectedFilters.categoryIds).toEqual(['10', '11'])
    expect(result.current.selectedFilters.artistIds).toEqual(['7'])
    expect(result.current.selectedFilters.tags).toEqual(['Voice'])
    expect(result.current.requestParams.categoryIds).toBe('10,11')
    expect(result.current.requestParams.artistIds).toBe('7')
    expect(result.current.requestParams.tags).toBe('Voice')
  })
})
