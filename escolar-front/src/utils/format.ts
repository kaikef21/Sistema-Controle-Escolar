import type { StatusLancamento } from '../types'

const BR = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

/** Aceita "2026-11-18" ou ISO completo e devolve "18/11/2026". */
export function formatDate(iso?: string): string {
  if (!iso) return '—'
  const d = iso.length === 10 ? new Date(iso + 'T12:00:00') : new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return BR.format(d)
}

export function formatDateTime(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return (
    BR.format(d) +
    ' às ' +
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  )
}

export function formatNota(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—'
  return n.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  })
}

export function initials(nome: string): string {
  const parts = nome.trim().split(/\s+/)
  const a = parts[0]?.[0] ?? ''
  const b = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (a + b).toUpperCase()
}

export function todayISO(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

export const STATUS_LABEL: Record<StatusLancamento, string> = {
  rascunho: 'Rascunho',
  pendente: 'Pendente de aprovação',
  aprovado: 'Aprovado',
  rejeitado: 'Rejeitado',
  correcao: 'Necessita de correção',
}

export const STATUS_TONE: Record<
  StatusLancamento,
  'neutral' | 'info' | 'ok' | 'danger' | 'warn'
> = {
  rascunho: 'neutral',
  pendente: 'info',
  aprovado: 'ok',
  rejeitado: 'danger',
  correcao: 'warn',
}
