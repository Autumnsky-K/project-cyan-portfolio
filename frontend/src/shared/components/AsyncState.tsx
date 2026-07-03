import type { ReactNode } from 'react'
import Button, { type ButtonVariant } from './Button'
import './AsyncState.css'

export type AsyncStateKind = 'empty' | 'error' | 'info' | 'loading'

type AsyncStateProps = {
  actionLabel?: string
  actionVariant?: ButtonVariant
  actions?: ReactNode
  className?: string
  kind: AsyncStateKind
  marker?: ReactNode
  message?: ReactNode
  onAction?: () => void
  size?: 'compact' | 'regular'
  title: ReactNode
}

const DEFAULT_MARKERS: Record<AsyncStateKind, string> = {
  empty: '0',
  error: '!',
  info: 'i',
  loading: '…',
}

function AsyncState({
  actionLabel,
  actionVariant = 'primary',
  actions,
  className = '',
  kind,
  marker = DEFAULT_MARKERS[kind],
  message,
  onAction,
  size = 'regular',
  title,
}: AsyncStateProps) {
  const classes = ['async-state', `async-state--${kind}`, `async-state--${size}`, className]
    .filter(Boolean)
    .join(' ')
  const role = kind === 'error' ? 'alert' : 'status'

  return (
    <div
      aria-busy={kind === 'loading' ? true : undefined}
      aria-live={kind === 'error' ? 'assertive' : 'polite'}
      className={classes}
      role={role}
    >
      <span className="async-state__marker" aria-hidden="true">{marker}</span>
      <strong className="async-state__title">{title}</strong>
      {message && <span className="async-state__message">{message}</span>}
      {(actions || (actionLabel && onAction)) && (
        <div className="async-state__actions">
          {actions}
          {actionLabel && onAction && (
            <Button variant={actionVariant} onClick={onAction}>{actionLabel}</Button>
          )}
        </div>
      )}
    </div>
  )
}

export default AsyncState
