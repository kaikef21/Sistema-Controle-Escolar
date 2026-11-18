import type { ReactNode } from 'react'
import { CheckCircle2, Info, XCircle, X } from 'lucide-react'
import { useApp } from '../../store/useApp'

export function Toasts() {
  const { toasts, dismissToast } = useApp()
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.kind}`}>
          {t.kind === 'success' ? (
            <CheckCircle2 size={18} />
          ) : t.kind === 'error' ? (
            <XCircle size={18} />
          ) : (
            <Info size={18} />
          )}
          <div>
            <strong>{t.title}</strong>
            {t.text && <span>{t.text}</span>}
          </div>
          <button
            type="button"
            onClick={() => dismissToast(t.id)}
            aria-label="Dispensar"
          >
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
  action,
}: {
  icon: ReactNode
  title: string
  text: string
  action?: ReactNode
}) {
  return (
    <div className="empty">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  )
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div className="sk-row" key={i}>
          <div className="skeleton" style={{ height: 14, width: '28%' }} />
          <div className="skeleton" style={{ height: 14, width: '14%' }} />
          <div className="skeleton" style={{ height: 14, width: '18%' }} />
          <div className="skeleton" style={{ height: 14, width: '10%' }} />
        </div>
      ))}
    </div>
  )
}

export function Alert({
  tone,
  icon,
  children,
}: {
  tone: 'info' | 'warn' | 'danger' | 'ok'
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <div className={`alert alert-${tone}`} role="note">
      {icon}
      <div>{children}</div>
    </div>
  )
}
