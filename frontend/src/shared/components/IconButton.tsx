import type { ButtonHTMLAttributes, ReactNode } from 'react'
import Button, { type ButtonSize, type ButtonVariant } from './Button'
import './IconButton.css'

type IconButtonShape = 'circle' | 'rounded' | 'square'

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'children'> & {
  icon: ReactNode
  label: string
  shape?: IconButtonShape
  size?: ButtonSize
  variant?: ButtonVariant
}

export default function IconButton({
  className = '',
  icon,
  label,
  shape = 'rounded',
  size = 'medium',
  variant = 'outline',
  ...props
}: IconButtonProps) {
  return (
    <Button
      {...props}
      aria-label={label}
      className={`ui-icon-button ui-icon-button--${size} ui-icon-button--${shape} ${className}`.trim()}
      shape={shape === 'square' ? 'square' : 'rounded'}
      size={size}
      variant={variant}
    >
      <span className="ui-icon-button__icon" aria-hidden="true">
        {icon}
      </span>
    </Button>
  )
}
