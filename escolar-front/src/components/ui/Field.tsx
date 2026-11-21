import { useId } from 'react'
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { AlertCircle } from 'lucide-react'

interface FieldProps {
  label: string
  error?: string
  hint?: string
  className?: string
  children: (id: string) => ReactNode
}

export function Field({ label, error, hint, className = '', children }: FieldProps) {
  const id = useId()
  return (
    <div className={`field ${error ? 'has-error' : ''} ${className}`.trim()}>
      <label htmlFor={id}>{label}</label>
      {children(id)}
      {error ? (
        <span className="error" role="alert">
          <AlertCircle size={14} /> {error}
        </span>
      ) : hint ? (
        <span className="hint">{hint}</span>
      ) : null}
    </div>
  )
}

type CommonProps = { label: string; error?: string; hint?: string; className?: string }

export function TextField({
  label,
  error,
  hint,
  className,
  ...rest
}: CommonProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Field label={label} error={error} hint={hint} className={className}>
      {(id) => (
        <input
          id={id}
          className="input"
          aria-invalid={!!error || undefined}
          {...rest}
        />
      )}
    </Field>
  )
}

export function SelectField({
  label,
  error,
  hint,
  className,
  placeholder,
  options,
  ...rest
}: CommonProps &
  SelectHTMLAttributes<HTMLSelectElement> & {
    placeholder?: string
    options: { value: string; label: string }[]
  }) {
  return (
    <Field label={label} error={error} hint={hint} className={className}>
      {(id) => (
        <select
          id={id}
          className="select"
          aria-invalid={!!error || undefined}
          {...rest}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  )
}

export function TextAreaField({
  label,
  error,
  hint,
  className,
  ...rest
}: CommonProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Field label={label} error={error} hint={hint} className={className}>
      {(id) => (
        <textarea
          id={id}
          className="textarea"
          aria-invalid={!!error || undefined}
          {...rest}
        />
      )}
    </Field>
  )
}
