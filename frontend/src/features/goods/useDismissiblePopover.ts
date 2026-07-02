import { useEffect, type RefObject } from 'react'

type UseDismissiblePopoverArgs<T extends HTMLElement> = {
  containerRef: RefObject<T | null>
  enabled: boolean
  onDismiss: () => void
}

export function useDismissiblePopover<T extends HTMLElement>({
  containerRef,
  enabled,
  onDismiss,
}: UseDismissiblePopoverArgs<T>) {
  useEffect(() => {
    if (!enabled) return undefined

    function closeOnOutsideClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) onDismiss()
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onDismiss()
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [containerRef, enabled, onDismiss])
}
