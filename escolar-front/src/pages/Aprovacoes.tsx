import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Check, Eye, Inbox, MessageSquareWarning, X } from 'lucide-react'
import { PageHead } from '../components/PageHead'
import { Button } from '../components/ui/Button'
import { StatusBadge } from '../components/ui/Badge'
import { EmptyState, TableSkeleton } from '../components/ui/Feedback'
import { TextAreaField } from '../components/ui/Field'
import { SearchInput } from '../components/ui/SearchInput'
import { Sheet } from '../components/ui/Sheet'
import { useSimulatedLoading } from '../hooks/useSimulatedLoading'
import { useApp } from '../store/useApp'
import type { Lancamento, StatusLancamento } from '../types'
import {
  STATUS_LABEL,
  formatDate,
  formatDateTime,
  formatNota,
  initials,
  normalize,
} from '../utils/format'
import type { Decisao } from '../store/context'

type Tab = 'pendentes' | 'historico' | 'rascunhos'

const TAB_STATUS: Record<Tab, StatusLancamento[]> = {
  pendentes: ['pendente'],
  historico: ['aprovado', 'rejeitado', 'correcao'],
  rascunhos: ['rascunho'],
}

export function Aprovacoes() {
  const { lancamentos, turmas, disciplinas } = useApp()
  const loading = useSimulatedLoading()
  const [params, setParams] = useSearchParams()
  const [tab, setTab] = useState<Tab>('pendentes')
  const [q, setQ] = useState('')
  const [tipo, setTipo] = useState('')
  const [turma, setTurma] = useState('')
  const [status, setStatus] = useState('')

  const openId = params.get('abrir')
  const opened = lancamentos.find((l) => l.id === openId)
  const close = () => setParams({}, { replace: true })

  const turmaNome = (id: string) => turmas.find((t) => t.id === id)?.nome ?? '—'
  const discNome = (id: string) =>
    disciplinas.find((d) => d.id === id)?.nome ?? '—'

  const counts = {
    pendentes: lancamentos.filter((l) => l.status === 'pendente').length,
    historico: lancamentos.filter((l) => TAB_STATUS.historico.includes(l.status)).length,
    rascunhos: lancamentos.filter((l) => l.status === 'rascunho').length,
  }

  const rows = useMemo(() => {
    const nq = normalize(q.trim())
    return lancamentos
      .filter(
        (l) =>
          TAB_STATUS[tab].includes(l.status) &&
          (!tipo || l.tipo === tipo) &&
          (!turma || l.turmaId === turma) &&
          (!status || l.status === status) &&
          (!nq ||
            normalize(l.responsavel).includes(nq) ||
            normalize(discNome(l.disciplinaId)).includes(nq)),
      )
      .sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lancamentos, tab, q, tipo, turma, status, disciplinas])

  const hasFilter = !!(q || tipo || turma || status)
  const reset = () => {
    setQ('')
    setTipo('')
    setTurma('')
    setStatus('')
  }

  const tabBtn = (id: Tab, label: string) => (
    <button
      type="button"
      role="tab"
      className="tab"
      aria-selected={tab === id}
      onClick={() => {
        setTab(id)
        setStatus('')
      }}
    >
      {label} <span className="count">{counts[id]}</span>
    </button>
  )

  return (
    <>
      <PageHead text="Revise os lançamentos enviados pelos responsáveis antes de eles valerem no boletim." />

      <div className="panel">
        <div className="tabs" role="tablist">
          {tabBtn('pendentes', 'Em análise')}
          {tabBtn('historico', 'Histórico')}
          {tabBtn('rascunhos', 'Rascunhos')}
        </div>

        <div className="toolbar">
          <SearchInput
            value={q}
            onChange={setQ}
            placeholder="Buscar por responsável ou disciplina"
          />
          <select
            className="select"
            aria-label="Filtrar por tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            <option value="">Notas e faltas</option>
            <option value="nota">Notas</option>
            <option value="falta">Faltas</option>
          </select>
          <select
            className="select"
            aria-label="Filtrar por turma"
            value={turma}
            onChange={(e) => setTurma(e.target.value)}
          >
            <option value="">Todas as turmas</option>
            {turmas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
          {tab === 'historico' && (
            <select
              className="select"
              aria-label="Filtrar por resultado"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Todos os resultados</option>
              {TAB_STATUS.historico.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          )}
          {hasFilter && (
            <Button variant="ghost" size="sm" onClick={reset}>
              Limpar filtros
            </Button>
          )}
        </div>

        {loading ? (
          <TableSkeleton />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<Inbox size={24} />}
            title={
              hasFilter
                ? 'Nenhum lançamento encontrado'
                : tab === 'pendentes'
                  ? 'Nada aguardando aprovação'
                  : tab === 'historico'
                    ? 'Ainda não há decisões registradas'
                    : 'Nenhum rascunho em andamento'
            }
            text={
              hasFilter
                ? 'Ajuste a busca ou remova alguns filtros.'
                : tab === 'pendentes'
                  ? 'Quando um responsável enviar notas ou faltas, elas aparecem aqui para revisão.'
                  : tab === 'historico'
                    ? 'Os lançamentos aprovados, rejeitados ou devolvidos para correção ficam aqui.'
                    : 'Lançamentos salvos e ainda não enviados aparecem nesta aba.'
            }
            action={hasFilter ? <Button onClick={reset}>Limpar filtros</Button> : undefined}
          />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Responsável</th>
                  <th>Lançamento</th>
                  <th>Turma e disciplina</th>
                  <th>{tab === 'rascunhos' ? 'Atualizado' : 'Enviado em'}</th>
                  <th className="right">Alunos</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((l) => (
                  <tr
                    key={l.id}
                    className="clickable"
                    onClick={() => setParams({ abrir: l.id })}
                  >
                    <td>
                      <div className="row">
                        <span className="avatar sm">{initials(l.responsavel)}</span>
                        <span className="cell-main">{l.responsavel}</span>
                      </div>
                    </td>
                    <td>{l.tipo === 'nota' ? 'Notas' : 'Faltas'}</td>
                    <td>
                      <div className="cell-main">{discNome(l.disciplinaId)}</div>
                      <div className="cell-sub">{turmaNome(l.turmaId)}</div>
                    </td>
                    <td className="num">
                      {formatDateTime(tab === 'rascunhos' ? l.atualizadoEm : l.enviadoEm)}
                    </td>
                    <td className="right num">{l.itens.length}</td>
                    <td>
                      <StatusBadge status={l.status} />
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="row-actions">
                        <Button
                          size="sm"
                          variant={l.status === 'pendente' ? 'primary' : 'default'}
                          icon={<Eye size={15} />}
                          onClick={() => setParams({ abrir: l.id })}
                        >
                          {l.status === 'pendente' ? 'Revisar' : 'Detalhes'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {opened && <Detalhe key={opened.id} lancamento={opened} onClose={close} />}
    </>
  )
}

function FlowRail({ status }: { status: StatusLancamento }) {
  const finalLabel =
    status === 'aprovado'
      ? 'Aprovado'
      : status === 'rejeitado'
        ? 'Rejeitado'
        : status === 'correcao'
          ? 'Correção'
          : 'Decisão'
  const stage = status === 'rascunho' ? 0 : status === 'pendente' ? 1 : 2
  const tone = status === 'aprovado' ? 'good' : stage === 2 ? 'bad' : ''
  const steps = ['Rascunho', 'Em análise', finalLabel]
  return (
    <div className="flow" aria-label={`Etapa atual: ${STATUS_LABEL[status]}`}>
      {steps.map((label, i) => (
        <div key={label} style={{ display: 'contents' }}>
          <div
            className={`flow-step ${i < stage ? 'done' : ''} ${i === stage ? `current ${tone}` : ''}`}
          >
            <span className="flow-dot">
              {(i < stage || (i === stage && (tone === 'good' || tone === 'bad'))) && (
                <Check size={12} strokeWidth={3} />
              )}
            </span>
            {label}
          </div>
          {i < steps.length - 1 && <div className={`flow-line ${i < stage ? 'done' : ''}`} />}
        </div>
      ))}
    </div>
  )
}

function Detalhe({
  lancamento: l,
  onClose,
}: {
  lancamento: Lancamento
  onClose: () => void
}) {
  const { alunos, turmas, disciplinas, atividades, decidir, notify } = useApp()
  const [busy, setBusy] = useState<Decisao | null>(null)
  const [ask, setAsk] = useState<Exclude<Decisao, 'aprovado'> | null>(null)
  const [comment, setComment] = useState('')
  const [commentError, setCommentError] = useState<string | undefined>()

  const turma = turmas.find((t) => t.id === l.turmaId)
  const disc = disciplinas.find((d) => d.id === l.disciplinaId)
  const atividade = atividades.find((a) => a.id === l.atividadeId)
  const nome = (id: string) => alunos.find((a) => a.id === id)

  const valores = l.itens.map((i) => i.nota).filter((n): n is number => n !== null)
  const media = valores.length ? valores.reduce((s, n) => s + n, 0) / valores.length : null
  const totalFaltas = l.itens.reduce((s, i) => s + i.faltas, 0)

  const run = async (d: Decisao, text?: string) => {
    setBusy(d)
    await decidir(l.id, d, text)
    setBusy(null)
    setAsk(null)
    setComment('')
    notify(
      d === 'aprovado' ? 'success' : 'info',
      d === 'aprovado'
        ? 'Lançamento aprovado'
        : d === 'rejeitado'
          ? 'Lançamento rejeitado'
          : 'Correção solicitada',
      d === 'aprovado'
        ? `${l.responsavel} será notificado.`
        : `${l.responsavel} recebeu o motivo e pode reenviar.`,
    )
  }

  const confirmAsk = () => {
    if (comment.trim().length < 10) {
      setCommentError('Explique o motivo com pelo menos 10 caracteres.')
      return
    }
    if (ask) void run(ask, comment.trim())
  }

  const toneOf = (a: string) =>
    a === 'aprovado' ? 'ok' : a === 'rejeitado' ? 'bad' : a === 'correcao' ? 'warn' : ''
  const labelOf: Record<string, string> = {
    criado: 'Rascunho criado',
    enviado: 'Enviado para aprovação',
    aprovado: 'Aprovado',
    rejeitado: 'Rejeitado',
    correcao: 'Correção solicitada',
  }

  return (
    <>
      <Sheet
        variant="drawer"
        wide
        title={`${l.tipo === 'nota' ? 'Notas' : 'Faltas'} · ${disc?.nome ?? ''}`}
        subtitle={`${turma?.nome ?? ''} · enviado por ${l.responsavel}`}
        onClose={onClose}
        footer={
          l.status === 'pendente' ? (
            <>
              <Button
                variant="danger"
                icon={<X size={16} />}
                disabled={busy !== null}
                onClick={() => setAsk('rejeitado')}
              >
                Rejeitar
              </Button>
              <Button
                icon={<MessageSquareWarning size={16} />}
                disabled={busy !== null}
                onClick={() => setAsk('correcao')}
              >
                Solicitar correção
              </Button>
              <Button
                variant="primary"
                icon={<Check size={16} />}
                loading={busy === 'aprovado'}
                disabled={busy !== null}
                onClick={() => run('aprovado')}
              >
                Aprovar lançamento
              </Button>
            </>
          ) : (
            <Button onClick={onClose}>Fechar</Button>
          )
        }
      >
        <div className="stack" style={{ gap: 22 }}>
          <FlowRail status={l.status} />

          <dl className="kv">
            <div>
              <dt>Status</dt>
              <dd>
                <StatusBadge status={l.status} />
              </dd>
            </div>
            <div>
              <dt>Enviado em</dt>
              <dd>{formatDateTime(l.enviadoEm)}</dd>
            </div>
            <div>
              <dt>{l.tipo === 'nota' ? 'Atividade' : 'Período'}</dt>
              <dd>
                {l.tipo === 'nota'
                  ? (atividade?.titulo ?? '—')
                  : `${formatDate(l.periodoInicio)} a ${formatDate(l.periodoFim)}`}
              </dd>
            </div>
            <div>
              <dt>Alunos envolvidos</dt>
              <dd>{l.itens.length}</dd>
            </div>
            <div>
              <dt>{l.tipo === 'nota' ? 'Média da turma' : 'Total de faltas'}</dt>
              <dd>
                {l.tipo === 'nota'
                  ? `${formatNota(media)}${atividade ? ` de ${formatNota(atividade.notaMaxima)}` : ''}`
                  : `${totalFaltas} em ${l.aulasNoPeriodo ?? '—'} aulas`}
              </dd>
            </div>
          </dl>

          <div>
            <h3 style={{ marginBottom: 8 }}>Lançamento por aluno</h3>
            <div className="panel" style={{ boxShadow: 'none' }}>
              <div className="table-wrap" style={{ maxHeight: 280, overflowY: 'auto' }}>
                <table className="table detail-table">
                  <thead>
                    <tr>
                      <th>Aluno</th>
                      <th className="right">{l.tipo === 'nota' ? 'Nota' : 'Faltas'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {l.itens.map((i) => (
                      <tr key={i.alunoId}>
                        <td>
                          {nome(i.alunoId)?.nome ?? 'Aluno removido'}
                          <span className="cell-sub"> · {nome(i.alunoId)?.matricula}</span>
                        </td>
                        <td className="right num">
                          {l.tipo === 'nota' ? formatNota(i.nota) : i.faltas}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ marginBottom: 12 }}>Histórico de aprovação</h3>
            <ol className="timeline">
              {[...l.historico].reverse().map((h) => (
                <li key={h.id} className={toneOf(h.acao)}>
                  <strong>{labelOf[h.acao]}</strong>
                  <div className="when">
                    {h.autor} · {formatDateTime(h.data)}
                  </div>
                  {h.comentario && <blockquote>{h.comentario}</blockquote>}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Sheet>

      {ask && (
        <Sheet
          variant="modal"
          title={ask === 'rejeitado' ? 'Rejeitar lançamento' : 'Solicitar correção'}
          subtitle={`${disc?.nome} · ${turma?.nome}`}
          onClose={() => busy === null && setAsk(null)}
          footer={
            <>
              <Button onClick={() => setAsk(null)} disabled={busy !== null}>
                Cancelar
              </Button>
              <Button
                variant={ask === 'rejeitado' ? 'danger' : 'primary'}
                loading={busy === ask}
                onClick={confirmAsk}
              >
                {ask === 'rejeitado' ? 'Rejeitar lançamento' : 'Enviar solicitação'}
              </Button>
            </>
          }
        >
          <TextAreaField
            label="Motivo"
            value={comment}
            error={commentError}
            hint={
              ask === 'rejeitado'
                ? 'O responsável verá este texto e poderá criar um novo lançamento.'
                : 'O responsável verá este texto e poderá corrigir e reenviar.'
            }
            placeholder="Descreva o que precisa ser revisado"
            onChange={(e) => {
              setComment(e.target.value)
              setCommentError(undefined)
            }}
            autoFocus
          />
        </Sheet>
      )}
    </>
  )
}
