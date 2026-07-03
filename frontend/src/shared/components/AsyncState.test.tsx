// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import AsyncState from './AsyncState'

afterEach(cleanup)

describe('AsyncState', () => {
  it('marks a loading state as busy', () => {
    render(<AsyncState kind="loading" title="불러오는 중" />)

    expect(screen.getByRole('status').getAttribute('aria-busy')).toBe('true')
  })

  it('announces an error and invokes its action', () => {
    const onAction = vi.fn()
    render(
      <AsyncState
        actionLabel="다시 시도"
        kind="error"
        message="잠시 후 다시 시도해 주세요."
        onAction={onAction}
        title="불러오지 못했습니다"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(screen.getByRole('alert').getAttribute('aria-live')).toBe('assertive')
    expect(onAction).toHaveBeenCalledOnce()
  })

  it('renders custom actions', () => {
    render(
      <AsyncState actions={<a href="/goods">상품 목록</a>} kind="info" title="안내" />,
    )

    expect(screen.getByRole('link', { name: '상품 목록' }).getAttribute('href')).toBe('/goods')
  })
})
