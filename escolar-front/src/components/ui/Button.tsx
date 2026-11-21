import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'sea' | 'danger' | 'ghost'
  size?: 'md' | 'sm'
  loading?: boolean
  icon?: ReactNode
}

export function Button({
  variant = 'default',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  type = 'button',
  ...rest
}: Props) {
  const v = variant === 'default' ? '' : `btn-${variant}`
  const s = size === 'sm' ? 'btn-sm' : ''
  return (
    <button
      type={type}
      className={`btn ${v} ${s} ${className}`.trim()}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <span className="spinner" aria-hidden /> : icon}
      {children}
    </button>
  )
}
