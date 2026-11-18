import type { ReactNode } from 'react'
import type { Situacao, StatusLancamento } from '../../types'
import { STATUS_LABEL, STATUS_TONE } from '../../utils/format'

type Tone = 'neutral' | 'info' | 'ok' | 'warn' | 'danger'

export function Badge({
  tone = 'neutral',
  children,
}: {
  tone?: Tone
  children: ReactNode
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}

export function StatusBadge({ status }: { status: StatusLancamento }) {
  return <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>
}

const SIT_TONE: Record<Situacao, Tone> = {
  Ativo: 'ok',
  Trancado: 'warn',
  Inativo: 'neutral',
  Formado: 'info',
}

export function SituacaoBadge({ situacao }: { situacao: Situacao }) {
  return <Badge tone={SIT_TONE[situacao]}>{situacao}</Badge>
}
