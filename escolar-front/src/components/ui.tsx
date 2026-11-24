import { useEffect, useId } from 'react'
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from 'react'
import { AlertCircle, CheckCircle2, Info, Search, X, XCircle } from 'lucide-react'
import { useApp } from '../state/useApp'

/* ---------- Botão ---------- */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'success' | 'dark'
  size?: 'md' | 'sm'
  block?: boolean
  loading?: boolean
  icon?: ReactNode
}

export function Button({
  variant = 'default',
  size = 'md',
  block,
  loading,
  icon,
  children,
  className = '',
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  const cls = [
    'btn',
    variant !== 'default' && `btn-${variant}`,
    size === 'sm' && 'btn-sm',
    block && 'btn-block',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <button type={type} className={cls} disabled={disabled || loading} {...rest}>
      {loading ? <span className="spinner" aria-hidden /> : icon}
      {children}
    </button>
  )
}

/* ---------- Campos ---------- */
interface FieldShellProps {
  label: string
  error?: string
  hint?: string
  action?: ReactNode
  children: (id: string) => ReactNode
}

function FieldShell({ label, error, hint, action, children }: FieldShellProps) {
  const id = useId()
  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <label htmlFor={id}>{label}</label>
        {action}
      </div>
      {children(id)}
      {error ? (
        <span className="field-error" role="alert">
          <AlertCircle size={14} /> {error}
        </span>
      ) : hint ? (
        <span className="field-hint">{hint}</span>
      ) : null}
    </div>
  )
}

type Extra = { label: string; error?: string; hint?: string; action?: ReactNode }

export function TextField({
  label,
  error,
  hint,
  action,
  ...rest
}: Extra & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldShell label={label} error={error} hint={hint} action={action}>
      {(id) => (
        <input id={id} className="input" aria-invalid={!!error || undefined} {...rest} />
      )}
    </FieldShell>
  )
}

export function SelectField({
  label,
  error,
  hint,
  action,
  placeholder,
  options,
  ...rest
}: Extra &
  SelectHTMLAttributes<HTMLSelectElement> & {
    placeholder?: string
    options: { value: string; label: string }[]
  }) {
  return (
    <FieldShell label={label} error={error} hint={hint} action={action}>
      {(id) => (
        <select id={id} className="select" aria-invalid={!!error || undefined} {...rest}>
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  )
}

export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <div className="search">
      <Search size={16} />
      <input
        className="input"
        type="search"
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

/* ---------- Badge ---------- */
export function Badge({
  tone,
  children,
}: {
  tone: 'green' | 'amber' | 'rose' | 'indigo' | 'slate'
  children: ReactNode
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}

/* ---------- Modal ---------- */
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

/* ---------- Feedback ---------- */
export function Toasts() {
  const { toasts, dismissToast } = useApp()
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.kind}`}>
          {t.kind === 'success' ? (
            <CheckCircle2 size={18} color="var(--green-600)" />
          ) : t.kind === 'error' ? (
            <XCircle size={18} color="var(--rose-500)" />
          ) : (
            <Info size={18} color="var(--indigo-600)" />
          )}
          <div>
            <strong>{t.title}</strong>
            {t.text && <span>{t.text}</span>}
          </div>
          <button type="button" onClick={() => dismissToast(t.id)} aria-label="Dispensar">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  text,
}: {
  icon: ReactNode
  title: string
  text: string
}) {
  return (
    <div className="empty">
      {icon}
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div style={{ padding: 20, display: 'grid', gap: 14 }} aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 18, width: `${90 - (i % 3) * 14}%` }} />
      ))}
    </div>
  )
}

/** Círculo com as iniciais do aluno; a cor vem do nome, então é sempre a mesma pessoa = mesma cor. */
export function Avatar({ nome, size = 36 }: { nome: string; size?: number }) {
  const partes = nome.trim().split(/\s+/)
  const iniciais = ((partes[0]?.[0] ?? '') + (partes.length > 1 ? (partes[partes.length - 1][0] ?? '') : '')).toUpperCase()
  let h = 0
  for (const ch of nome) h = (h * 31 + ch.charCodeAt(0)) % 5
  return (
    <span className={`avatar av-${h}`} style={{ width: size, height: size, fontSize: size * 0.38 }} aria-hidden="true">
      {iniciais}
    </span>
  )
}
