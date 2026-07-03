// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Modal from './Modal'

afterEach(cleanup)

describe('Modal', () => {
  it('closes with Escape and backdrop interaction', () => {
    const onClose = vi.fn()
    const { container } = render(
      <Modal ariaLabel="테스트 모달" open onClose={onClose}>
        <button type="button">내부 버튼</button>
      </Modal>,
    )

    fireEvent.keyDown(document, { key: 'Escape' })
    fireEvent.mouseDown(container.querySelector('.ui-modal-backdrop') as Element)
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('does not close when interacting inside the dialog', () => {
    const onClose = vi.fn()
    render(
      <Modal ariaLabel="테스트 모달" open onClose={onClose}>
        <button type="button">내부 버튼</button>
      </Modal>,
    )

    fireEvent.mouseDown(screen.getByRole('button', { name: '내부 버튼' }))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('locks body scrolling while open', () => {
    const { rerender } = render(<Modal ariaLabel="테스트 모달" open onClose={() => {}}>내용</Modal>)
    expect(document.body.style.overflow).toBe('hidden')

    rerender(<Modal ariaLabel="테스트 모달" open={false} onClose={() => {}}>내용</Modal>)
    expect(document.body.style.overflow).toBe('')
  })
})
