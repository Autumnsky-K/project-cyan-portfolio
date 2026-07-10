// @vitest-environment jsdom

import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import VtuberChatbotShell from './VtuberChatbotShell'

vi.mock('../../features/vtuber/Live2DCharacter', () => ({
  default: () => <div data-testid="live2d-character" />,
}))

vi.mock('../../features/vtuber/ThreeDCharacter', () => ({
  default: () => <div data-testid="three-character" />,
}))

const defaultProps = {
  actionsCount: 0,
  character: {
    id: 'cyan',
    name: 'Cyan Assistant',
    modelUrl: '/characters/cyan.glb',
    renderMode: 'three3d' as const,
  },
  characterBubbleSequence: 1,
  characterBubbleText: 'Need goods?',
  displayState: 'ready' as const,
  inputPlaceholder: '굿즈를 물어보세요',
  isSendDisabled: false,
  messages: [
    {
      id: 'message-1',
      role: 'assistant' as const,
      text: 'Need goods?',
    },
  ],
  motionKey: null,
  motionTriggerId: 0,
  onSendMessage: vi.fn(() => true),
  statusLabel: 'Ready',
}

function renderShell() {
  return render(<VtuberChatbotShell {...defaultProps} />)
}

describe('VtuberChatbotShell', () => {
  beforeEach(() => {
    window.localStorage.clear()
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1280,
    })
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 900,
    })
    Object.defineProperty(document.documentElement, 'clientWidth', {
      configurable: true,
      value: 1280,
    })
    Object.defineProperty(HTMLElement.prototype, 'setPointerCapture', {
      configurable: true,
      value: vi.fn(),
    })
    Object.defineProperty(HTMLElement.prototype, 'releasePointerCapture', {
      configurable: true,
      value: vi.fn(),
    })
    Object.defineProperty(HTMLElement.prototype, 'hasPointerCapture', {
      configurable: true,
      value: vi.fn(() => true),
    })
    Object.defineProperty(document, 'elementFromPoint', {
      configurable: true,
      value: vi.fn(),
    })
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('collapses only the chat panel into an input-capable mini chat', () => {
    const { container } = renderShell()
    const sidebar = container.querySelector<HTMLElement>('.vtuber-chat-sidebar')
    const collapseButton = container.querySelector<HTMLButtonElement>(
      '.vtuber-chat-sidebar-header .vtuber-chat-toggle-button',
    )

    expect(sidebar?.getAttribute('data-chat-collapsed')).toBe('false')
    expect(container.querySelector('.vtuber-message-list')).not.toBeNull()
    expect(container.querySelector('.vtuber-stage')).not.toBeNull()

    fireEvent.click(collapseButton!)

    expect(sidebar?.getAttribute('data-chat-collapsed')).toBe('true')
    expect(container.querySelector('.vtuber-chat-sidebar-header')).toBeNull()
    expect(container.querySelector('.vtuber-message-list')).toBeNull()
    expect(container.querySelector('.vtuber-stage')).not.toBeNull()

    const input = container.querySelector<HTMLInputElement>('.vtuber-form input')
    expect(input).not.toBeNull()
    expect(input?.disabled).toBe(false)
    expect(container.querySelector('.vtuber-form button[type="submit"]')).not.toBeNull()
    expect(container.querySelector('.vtuber-form .vtuber-chat-toggle-button')).not.toBeNull()
  })

  it('does not render per-message author labels', () => {
    const { container } = render(
      <VtuberChatbotShell
        {...defaultProps}
        messages={[
          ...defaultProps.messages,
          {
            id: 'message-2',
            role: 'user',
            text: 'hello',
          },
        ]}
      />,
    )

    expect(container.textContent).toContain('hello')
    expect(container.textContent).not.toContain('You')
    expect(container.querySelectorAll('.vtuber-message-author')).toHaveLength(0)
  })

  it('renders traffic-light character buttons and reports character changes', () => {
    const onCharacterChange = vi.fn()
    const { container } = render(
      <VtuberChatbotShell
        {...defaultProps}
        characterOptions={[
          { colorLabel: '네온 보라색', id: 'manase', name: 'Manase' },
          { colorLabel: '선명한 노란색', id: 'hiena', name: 'Hiena' },
          { colorLabel: '선명한 주황색', id: 'rikane', name: 'Rikane 10K' },
        ]}
        onCharacterChange={onCharacterChange}
        selectedCharacterId="hiena"
      />,
    )
    const buttons = container.querySelectorAll<HTMLButtonElement>(
      '.vtuber-character-switcher-button',
    )
    const hienaButton = container.querySelector<HTMLButtonElement>(
      '.vtuber-character-switcher-button[data-character-option-id="hiena"]',
    )
    const rikaneButton = container.querySelector<HTMLButtonElement>(
      '.vtuber-character-switcher-button[data-character-option-id="rikane"]',
    )

    expect(buttons).toHaveLength(3)
    expect(hienaButton?.getAttribute('data-selected')).toBe('true')

    fireEvent.click(rikaneButton!)

    expect(onCharacterChange).toHaveBeenCalledWith('rikane')
  })

  it('docks the mini chat to the cart left without inheriting the cart width', async () => {
    vi.stubGlobal(
      'ResizeObserver',
      class MockResizeObserver {
        disconnect = vi.fn()
        observe = vi.fn()
        unobserve = vi.fn()
      },
    )
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
      if (this.classList.contains('goods-cart-side-panel')) {
        return {
          bottom: 176,
          height: 160,
          left: 80,
          right: 384,
          top: 16,
          width: 304,
          x: 80,
          y: 16,
          toJSON: () => ({}),
        } as DOMRect
      }

      return {
        bottom: 0,
        height: 0,
        left: 0,
        right: 0,
        top: 0,
        width: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      } as DOMRect
    })

    const { container } = render(
      <>
        <aside className="goods-cart-side-panel" />
        <VtuberChatbotShell {...defaultProps} />
      </>,
    )
    const sidebar = container.querySelector<HTMLElement>('.vtuber-chat-sidebar')
    const collapseButton = container.querySelector<HTMLButtonElement>(
      '.vtuber-chat-sidebar-header .vtuber-chat-toggle-button',
    )

    await waitFor(() => expect(sidebar?.style.left).toBe('80px'))
    expect(sidebar?.style.width).toBe('')

    fireEvent.click(collapseButton!)

    await waitFor(() => {
      expect(sidebar?.getAttribute('data-chat-collapsed')).toBe('true')
      expect(sidebar?.style.left).toBe('80px')
    })
    expect(sidebar?.style.right).toBe('auto')
    expect(sidebar?.style.bottom).toBe('16px')
    expect(sidebar?.style.width).toBe('')
  })

  it('keeps the mini chat left of a compact cart badge with a gap', async () => {
    vi.stubGlobal(
      'ResizeObserver',
      class MockResizeObserver {
        disconnect = vi.fn()
        observe = vi.fn()
        unobserve = vi.fn()
      },
    )
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
      if (this.classList.contains('goods-cart-side-panel')) {
        return {
          bottom: 140,
          height: 76,
          left: 1173,
          right: 1249,
          top: 64,
          width: 76,
          x: 1173,
          y: 64,
          toJSON: () => ({}),
        } as DOMRect
      }

      return {
        bottom: 0,
        height: 0,
        left: 0,
        right: 0,
        top: 0,
        width: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      } as DOMRect
    })

    const { container } = render(
      <>
        <aside className="goods-cart-side-panel" />
        <VtuberChatbotShell {...defaultProps} />
      </>,
    )
    const sidebar = container.querySelector<HTMLElement>('.vtuber-chat-sidebar')
    const collapseButton = container.querySelector<HTMLButtonElement>(
      '.vtuber-chat-sidebar-header .vtuber-chat-toggle-button',
    )

    fireEvent.click(collapseButton!)

    await waitFor(() => {
      expect(sidebar?.getAttribute('data-chat-collapsed')).toBe('true')
      expect(sidebar?.style.left).toBe('853px')
    })
    expect(sidebar?.style.right).toBe('auto')
    expect(sidebar?.style.width).toBe('')
  })

  it('passes a character click through to the element behind it', () => {
    const behindClick = vi.fn()
    const { container } = render(
      <>
        <button type="button" data-testid="behind-target" onClick={behindClick}>
          Behind target
        </button>
        <VtuberChatbotShell {...defaultProps} />
      </>,
    )
    const dragZone = container.querySelector<HTMLElement>('.vtuber-character-drag-zone')
    const behindTarget = container.querySelector<HTMLElement>('[data-testid="behind-target"]')
    vi.spyOn(document, 'elementFromPoint').mockReturnValue(behindTarget)

    fireEvent.pointerDown(dragZone!, {
      button: 0,
      clientX: 120,
      clientY: 160,
      pointerId: 1,
    })
    fireEvent.pointerUp(dragZone!, {
      button: 0,
      clientX: 120,
      clientY: 160,
      pointerId: 1,
    })

    expect(behindClick).toHaveBeenCalledTimes(1)
  })

  it('moves the character on drag without forwarding a click behind it', () => {
    const behindClick = vi.fn()
    const { container } = render(
      <>
        <button type="button" data-testid="behind-target" onClick={behindClick}>
          Behind target
        </button>
        <VtuberChatbotShell {...defaultProps} />
      </>,
    )
    const dragZone = container.querySelector<HTMLElement>('.vtuber-character-drag-zone')
    const behindTarget = container.querySelector<HTMLElement>('[data-testid="behind-target"]')
    const elementFromPoint = vi.spyOn(document, 'elementFromPoint').mockReturnValue(behindTarget)

    fireEvent.pointerDown(dragZone!, {
      button: 0,
      clientX: 120,
      clientY: 160,
      pointerId: 1,
    })
    fireEvent.pointerMove(dragZone!, {
      button: 0,
      clientX: 150,
      clientY: 190,
      pointerId: 1,
    })
    fireEvent.pointerUp(dragZone!, {
      button: 0,
      clientX: 150,
      clientY: 190,
      pointerId: 1,
    })

    expect(behindClick).not.toHaveBeenCalled()
    expect(elementFromPoint).not.toHaveBeenCalled()
  })
})
