// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import IconButton from './IconButton'

describe('IconButton', () => {
  it('requires an accessible label and uses a safe default type', () => {
    render(<IconButton icon={<span>+</span>} label="메뉴 열기" />)
    const button = screen.getByRole('button', { name: '메뉴 열기' })

    expect(button.getAttribute('type')).toBe('button')
    expect(button.classList.contains('ui-icon-button')).toBe(true)
  })

  it('applies icon-specific size and shape classes', () => {
    render(<IconButton icon={<span>×</span>} label="닫기" shape="circle" size="small" variant="ghost" />)
    const button = screen.getByRole('button', { name: '닫기' })

    expect([...button.classList]).toEqual(expect.arrayContaining([
      'ui-icon-button--small',
      'ui-icon-button--circle',
      'ui-button--ghost',
    ]))
  })
})
