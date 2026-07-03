import { forwardRef, type ButtonHTMLAttributes } from 'react'
import './Button.css'

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'small' | 'medium' | 'large'
export type ButtonShape = 'rounded' | 'pill' | 'square'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean
  shape?: ButtonShape
  size?: ButtonSize
  variant?: ButtonVariant
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({
  className = '',
  fullWidth = false,
  shape = 'rounded',
  size = 'medium',
  type = 'button',
  variant = 'outline',
  ...props
}, ref) {
  const classes = [
    'ui-button',
    `ui-button--${variant}`,
    `ui-button--${size}`,
    `ui-button--${shape}`,
    fullWidth ? 'ui-button--full-width' : '',
    className,
  ].filter(Boolean).join(' ')

  return <button ref={ref} className={classes} type={type} {...props} />
})

export default Button
