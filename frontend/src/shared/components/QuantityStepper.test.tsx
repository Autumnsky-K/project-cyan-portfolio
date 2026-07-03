// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import QuantityStepper from './QuantityStepper'

describe('QuantityStepper', () => {
  it('emits incremented and decremented values', () => {
    const onChange = vi.fn()
    render(<QuantityStepper label="상품 수량" min={1} max={5} value={3} onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: '상품 수량 줄이기' }))
    fireEvent.click(screen.getByRole('button', { name: '상품 수량 늘리기' }))

    expect(onChange).toHaveBeenNthCalledWith(1, 2)
    expect(onChange).toHaveBeenNthCalledWith(2, 4)
  })

  it('disables controls at configured boundaries', () => {
    const { rerender } = render(<QuantityStepper max={2} min={1} value={1} onChange={() => {}} />)
    expect(screen.getByRole('button', { name: '수량 줄이기' }).hasAttribute('disabled')).toBe(true)

    rerender(<QuantityStepper max={2} min={1} value={2} onChange={() => {}} />)
    expect(screen.getByRole('button', { name: '수량 늘리기' }).hasAttribute('disabled')).toBe(true)
  })

  it('clamps direct input to the maximum', () => {
    const onChange = vi.fn()
    render(<QuantityStepper editable max={4} value={2} onChange={onChange} />)

    fireEvent.change(screen.getByRole('spinbutton', { name: '수량 직접 입력' }), { target: { value: '9' } })
    expect(onChange).toHaveBeenCalledWith(4)
  })
})
