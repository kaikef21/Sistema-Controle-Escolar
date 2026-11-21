import type { ReactNode } from 'react'

/** O título da página fica no cabeçalho; aqui vai o contexto da tela e as ações principais. */
export function PageHead({
  text,
  actions,
}: {
  text: string
  actions?: ReactNode
}) {
  return (
    <div className="page-head" style={{ alignItems: 'center' }}>
      <p style={{ margin: 0, maxWidth: 620 }}>{text}</p>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  )
}
