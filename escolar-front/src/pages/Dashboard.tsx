import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  CheckCheck,
  ClipboardList,
  FileClock,
  Hourglass,
  MessageSquareWarning,
  PenLine,
  Send,
  ShieldCheck,
  Undo2,
  Users,
  XCircle,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { PageHead } from '../components/PageHead'
import { PerformanceChart } from '../components/PerformanceChart'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/Feedback'
import { desempenho } from '../data/mock'
import { useApp } from '../store/useApp'
import type { AcaoHistorico } from '../types'
import { formatDate, formatDateTime, todayISO } from '../utils/format'

interface Pendencia {
  key: string
  icon: ReactNode
  tone: 'info' | 'warn' | 'bad'
  title: string
  text: string
  to: string
}

const ACAO: Record<AcaoHistorico, { verbo: string; icon: ReactNode; tone: string }> = {
  criado: { verbo: 'criou o rascunho de', icon: <PenLine size={15} />, tone: '' },
  enviado: { verbo: 'enviou para aprovação', icon: <Send size={15} />, tone: 'info' },
  aprovado: { verbo: 'aprovou', icon: <CheckCheck size={15} />, tone: 'ok' },
  rejeitado: { verbo: 'rejeitou', icon: <XCircle size={15} />, tone: 'bad' },
  correcao: { verbo: 'pediu correção de', icon: <Undo2 size={15} />, tone: 'warn' },
}

export function Dashboard() {
  const { alunos, atividades, lancamentos, turmas, disciplinas } = useApp()
  const navigate = useNavigate()
  const [serie, setSerie] = useState('geral')

  const ativos = alunos.filter((a) => a.situacao === 'Ativo').length
  const aguardando = lancamentos.filter((l) => l.status === 'pendente').length
  const aprovados = lancamentos.filter((l) => l.status === 'aprovado').length
  const abertos = lancamentos.filter(
    (l) => l.status === 'rascunho' || l.status === 'correcao' || l.status === 'rejeitado',
  ).length

  const turmaNome = (id: string) => turmas.find((t) => t.id === id)?.nome ?? ''
  const discNome = (id: string) => disciplinas.find((d) => d.id === id)?.nome ?? ''
  const tipoNome = (t: string) => (t === 'nota' ? 'notas' : 'faltas')

  const pendencias = useMemo<Pendencia[]>(() => {
    const out: Pendencia[] = []
    const today = todayISO()
    lancamentos
      .filter((l) => l.status === 'pendente')
      .forEach((l) =>
        out.push({
          key: `p-${l.id}`,
          icon: <Hourglass size={16} />,
          tone: 'info',
          title: `Revisar ${tipoNome(l.tipo)} de ${discNome(l.disciplinaId)}`,
          text: `${turmaNome(l.turmaId)} · enviado por ${l.responsavel}`,
          to: `/aprovacoes?abrir=${l.id}`,
        }),
      )
    lancamentos
      .filter((l) => l.status === 'correcao' || l.status === 'rejeitado')
      .forEach((l) =>
        out.push({
          key: `c-${l.id}`,
          icon: <MessageSquareWarning size={16} />,
          tone: 'warn',
          title: `${l.responsavel} ainda não reenviou ${tipoNome(l.tipo)}`,
          text: `${discNome(l.disciplinaId)} · ${turmaNome(l.turmaId)} · ${
            l.status === 'correcao' ? 'correção solicitada' : 'rejeitado'
          }`,
          to: `/aprovacoes?abrir=${l.id}`,
        }),
      )
    atividades
      .filter(
        (a) =>
          a.prazoLancamento < today &&
          !lancamentos.some(
            (l) =>
              l.atividadeId === a.id &&
              (l.status === 'pendente' || l.status === 'aprovado'),
          ),
      )
      .forEach((a) =>
        out.push({
          key: `a-${a.id}`,
          icon: <AlertTriangle size={16} />,
          tone: 'bad',
          title: `Prazo vencido: ${a.titulo}`,
          text: `${turmaNome(a.turmaId)} · prazo era ${formatDate(a.prazoLancamento)}`,
          to: '/notas',
        }),
      )
    return out.slice(0, 6)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lancamentos, atividades, turmas, disciplinas])

  const movimentos = useMemo(
    () =>
      lancamentos
        .flatMap((l) => l.historico.map((h) => ({ h, l })))
        .sort((a, b) => b.h.data.localeCompare(a.h.data))
        .slice(0, 6),
    [lancamentos],
  )

  const label = serie === 'geral' ? 'todas as turmas' : turmaNome(serie)
  const atual = desempenho[serie][desempenho[serie].length - 1]
  const anterior = desempenho[serie][desempenho[serie].length - 2]
  const delta = atual - anterior

  return (
    <>
      <PageHead
        text="Resumo do andamento dos lançamentos e do desempenho das turmas neste período."
        actions={
          <Button
            variant="primary"
            icon={<ShieldCheck size={17} />}
            onClick={() => navigate('/aprovacoes')}
          >
            Revisar aprovações
          </Button>
        }
      />

      <section className="stat-strip" aria-label="Indicadores">
        <div className="stat">
          <span className="stat-label">
            <Users size={16} /> Alunos
          </span>
          <span className="stat-value">{alunos.length}</span>
          <span className="stat-note">{ativos} com matrícula ativa</span>
        </div>
        <div className="stat">
          <span className="stat-label">
            <ClipboardList size={16} /> Atividades
          </span>
          <span className="stat-value">{atividades.length}</span>
          <span className="stat-note">em {turmas.length} turmas</span>
        </div>
        <button type="button" className="stat" onClick={() => navigate('/aprovacoes')}>
          <span className="stat-label">
            <FileClock size={16} /> Pendentes de envio
          </span>
          <span className="stat-value">{abertos}</span>
          <span className="stat-note">rascunhos e correções</span>
        </button>
        <button
          type="button"
          className="stat accent"
          onClick={() => navigate('/aprovacoes')}
        >
          <span className="stat-label">
            <Hourglass size={16} /> Aguardando aprovação
          </span>
          <span className="stat-value">{aguardando}</span>
          <span className="stat-note">na sua fila</span>
        </button>
        <button type="button" className="stat" onClick={() => navigate('/aprovacoes')}>
          <span className="stat-label">
            <CheckCheck size={16} /> Aprovados
          </span>
          <span className="stat-value">{aprovados}</span>
          <span className="stat-note">lançamentos concluídos</span>
        </button>
      </section>

      <div className="dash-grid">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Desempenho acadêmico</h2>
              <p className="cell-sub">
                Média mensal de {label}: <strong>{atual.toFixed(1).replace('.', ',')}</strong>{' '}
                ({delta >= 0 ? '+' : ''}
                {delta.toFixed(1).replace('.', ',')} em relação ao mês anterior)
              </p>
            </div>
          </div>
          <div className="panel-body" style={{ paddingBottom: 0 }}>
            <div className="chart-select" role="group" aria-label="Escolher turma do gráfico">
              <button
                type="button"
                className="chip"
                aria-pressed={serie === 'geral'}
                onClick={() => setSerie('geral')}
              >
                Geral
              </button>
              {turmas.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className="chip"
                  aria-pressed={serie === t.id}
                  onClick={() => setSerie(t.id)}
                >
                  {t.nome}
                </button>
              ))}
            </div>
          </div>
          <PerformanceChart serie={serie} label={label} />
          {serie !== 'geral' && (
            <div className="legend" style={{ paddingBottom: 16 }}>
              <span>
                <i style={{ background: 'var(--sea-600)' }} />
                {turmaNome(serie)}
              </span>
              <span>
                <i style={{ background: 'var(--luau-500)' }} />
                Média geral
              </span>
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2>Exigem atenção</h2>
          </div>
          {pendencias.length === 0 ? (
            <EmptyState
              icon={<CheckCheck size={24} />}
              title="Tudo em dia"
              text="Não há lançamentos parados ou prazos vencidos no momento."
            />
          ) : (
            <ul className="feed">
              {pendencias.map((p) => (
                <li key={p.key} className="link" onClick={() => navigate(p.to)}>
                  <span className={`feed-icon ${p.tone}`}>{p.icon}</span>
                  <div>
                    <strong>{p.title}</strong>
                    <span>{p.text}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="panel">
        <div className="panel-head">
          <h2>Últimas movimentações</h2>
        </div>
        <ul className="feed">
          {movimentos.map(({ h, l }) => {
            const a = ACAO[h.acao]
            return (
              <li
                key={h.id}
                className="link"
                onClick={() => navigate(`/aprovacoes?abrir=${l.id}`)}
              >
                <span className={`feed-icon ${a.tone}`}>{a.icon}</span>
                <div>
                  <strong>
                    {h.autor} {a.verbo} {tipoNome(l.tipo)} de {discNome(l.disciplinaId)}
                  </strong>
                  <span>
                    {turmaNome(l.turmaId)} · {formatDateTime(h.data)}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      </section>
    </>
  )
}
