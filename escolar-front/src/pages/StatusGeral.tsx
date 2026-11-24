import { useMemo, useState } from 'react'
import { AlertTriangle, BarChart3, History } from 'lucide-react'
import { Avatar, Badge, EmptyState, TableSkeleton } from '../components/ui'
import { useApp } from '../state/useApp'
import type { Boletim } from '../utils/format'
import { LIMITE_FALTAS, TOM_SITUACAO, calcularBoletim, formatNum } from '../utils/format'

const COR = {
  green: 'var(--green-500)',
  amber: 'var(--amber-500)',
  rose: 'var(--rose-500)',
  slate: 'var(--slate-300)',
} as const

/** Explica em uma frase por que o aluno merece atenção. */
function motivo(b: Boletim): string {
  if (b.situacao === 'Reprovado por falta')
    return `${Math.round(b.percFaltas)}% de faltas (limite de ${LIMITE_FALTAS}%)`
  if (b.situacao === 'Reprovado por nota') return `Média ${formatNum(b.media)}, abaixo de 4,0`
  return `Média ${formatNum(b.media)}, precisa chegar a 6,0`
}

export function StatusGeral() {
  const { status, alunos, turmas, atividades, notas, frequencias, log } = useApp()
  const [turmaId, setTurmaId] = useState('')

  const boletins = useMemo(
    () =>
      alunos
        .filter((a) => !turmaId || a.turmaId === turmaId)
        .map((a) => calcularBoletim(a, notas, atividades, frequencias))
        .sort((a, b) => a.aluno.nome.localeCompare(b.aluno.nome, 'pt-BR')),
    [alunos, turmaId, notas, atividades, frequencias],
  )

  const turmaNome = (id: string) => turmas.find((t) => t.turmaId === id)?.nome ?? '—'
  const faltasTotais = frequencias.filter((f) => !f.presente).length
  const emRisco = boletins.filter(
    (b) => b.situacao === 'Reprovado por falta' || b.situacao === 'Reprovado por nota',
  ).length

  const contagem = {
    Aprovado: boletins.filter((b) => b.situacao === 'Aprovado').length,
    Recuperação: boletins.filter((b) => b.situacao === 'Recuperação').length,
    Reprovado: emRisco,
    'Sem notas': boletins.filter((b) => b.situacao === 'Sem notas').length,
  }
  const comNota = boletins.filter((b) => b.media !== null)
  const mediaGeral = comNota.length
    ? comNota.reduce((soma, b) => soma + (b.media as number), 0) / comNota.length
    : null
  const taxaAprovacao = comNota.length ? Math.round((contagem.Aprovado / comNota.length) * 100) : null
  const atencao = boletins.filter(
    (b) => b.situacao !== 'Aprovado' && b.situacao !== 'Sem notas',
  )
  const faixas = [
    { nome: 'Aprovados', n: contagem.Aprovado, cor: COR.green },
    { nome: 'Em recuperação', n: contagem.Recuperação, cor: COR.amber },
    { nome: 'Reprovados', n: contagem.Reprovado, cor: COR.rose },
    { nome: 'Sem notas', n: contagem['Sem notas'], cor: COR.slate },
  ]

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Status de aprovação</h1>
          <p>Boletim consolidado com média, faltas e situação de cada aluno.</p>
        </div>
      </div>

      <section className="kpis" aria-label="Indicadores">
        <div className="kpi">
          <span>Alunos</span>
          <strong>{boletins.length}</strong>
        </div>
        <div className="kpi">
          <span>Média geral</span>
          <strong>{formatNum(mediaGeral)}</strong>
        </div>
        <div className="kpi">
          <span>Taxa de aprovação</span>
          <strong>{taxaAprovacao === null ? '—' : `${taxaAprovacao}%`}</strong>
        </div>
        <div className="kpi">
          <span>Faltas registradas</span>
          <strong>{faltasTotais}</strong>
        </div>
      </section>

      <div className="two-col">
        <section className="card">
          <div className="card-head">
            <h2>
              <BarChart3 size={18} /> Situação da turma
            </h2>
            <span className="sub-cell">
              {atividades.length} {atividades.length === 1 ? 'atividade' : 'atividades'} · {notas.length} {notas.length === 1 ? 'nota' : 'notas'}
            </span>
          </div>
          <div className="dist">
            <div className="dist-bar" role="img" aria-label="Distribuição das situações">
              {faixas.map((f) => (
                <i key={f.nome} style={{ width: `${boletins.length ? (f.n / boletins.length) * 100 : 0}%`, background: f.cor }} />
              ))}
            </div>
            <div className="dist-legend">
              {faixas.map((f) => (
                <span key={f.nome}>
                  <em style={{ background: f.cor }} />
                  {f.nome}: <b>{f.n}</b>
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <h2>
              <AlertTriangle size={18} /> Precisam de atenção
            </h2>
            <span className="sub-cell">{atencao.length} aluno(s)</span>
          </div>
          {atencao.length === 0 ? (
            <p className="list-foot" style={{ borderTop: 0 }}>
              Nenhum aluno em recuperação ou reprovando no momento.
            </p>
          ) : (
            <ul className="attn">
              {atencao.slice(0, 5).map((b) => (
                <li key={b.aluno.alunoId ?? b.aluno.matricula}>
                  <div className="person">
                    <Avatar nome={b.aluno.nome} />
                    <div>
                      <div className="main-cell">{b.aluno.nome}</div>
                      <div className="why">{motivo(b)}</div>
                    </div>
                  </div>
                  <Badge tone={TOM_SITUACAO[b.situacao]}>{b.situacao}</Badge>
                </li>
              ))}
              {atencao.length > 5 && (
                <li>
                  <span className="sub-cell">+ {atencao.length - 5} na tabela abaixo</span>
                </li>
              )}
            </ul>
          )}
        </section>
      </div>

      <section className="card" style={{ marginBottom: 20 }}>
        <div className="card-head">
          <h2>
            <BarChart3 size={18} /> Boletim geral
          </h2>
          <span className="sub-cell">
            {emRisco > 0 ? `${emRisco} aluno(s) reprovando` : 'Nenhum aluno reprovando'}
          </span>
        </div>
        <div className="toolbar">
          <select
            className="select"
            aria-label="Filtrar por turma"
            value={turmaId}
            onChange={(e) => setTurmaId(e.target.value)}
          >
            <option value="">Todas as turmas</option>
            {turmas.map((t) => (
              <option key={t.turmaId} value={t.turmaId}>
                {t.nome}
              </option>
            ))}
          </select>
        </div>

        {status === 'loading' && alunos.length === 0 ? (
          <TableSkeleton />
        ) : boletins.length === 0 ? (
          <EmptyState
            icon={<BarChart3 size={32} />}
            title="Ainda não há alunos para mostrar"
            text="Cadastre alunos e faça lançamentos para ver o boletim."
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Turma</th>
                  <th className="right">Média</th>
                  <th className="right">Faltas</th>
                  <th>Situação</th>
                </tr>
              </thead>
              <tbody>
                {boletins.map((b) => (
                  <tr key={b.aluno.alunoId ?? b.aluno.matricula}>
                    <td>
                      <div className="person">
                        <Avatar nome={b.aluno.nome} />
                        <div>
                          <div className="main-cell">{b.aluno.nome}</div>
                          <div className="sub-cell mono">{b.aluno.matricula}</div>
                        </div>
                      </div>
                    </td>
                    <td>{turmaNome(b.aluno.turmaId)}</td>
                    <td className="right">
                      {formatNum(b.media)}
                      {b.notasLancadas > 0 && (
                        <div className="sub-cell">{b.notasLancadas} {b.notasLancadas === 1 ? 'nota' : 'notas'}</div>
                      )}
                    </td>
                    <td className="right">
                      {b.faltas}
                      <div className="sub-cell">
                        {b.aulas > 0 ? `${Math.round(b.percFaltas)}% de ${b.aulas} ${b.aulas === 1 ? 'aula' : 'aulas'}` : 'sem registros'}
                      </div>
                    </td>
                    <td>
                      <Badge tone={TOM_SITUACAO[b.situacao]}>{b.situacao}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="list-foot">
          Média em escala de 0 a 10: aprovado a partir de 6, recuperação de 4 a 6. Reprova por falta quando passa de{' '}
          {LIMITE_FALTAS}% das aulas registradas.
        </p>
      </section>

      <section className="card">
        <div className="card-head">
          <h2>
            <History size={18} /> Atividade desta sessão
          </h2>
        </div>
        {log.length === 0 ? (
          <EmptyState
            icon={<History size={32} />}
            title="Nada registrado ainda"
            text="Os cadastros e lançamentos feitos agora aparecem aqui."
          />
        ) : (
          <ul className="log">
            {log.map((l) => (
              <li key={l.id}>
                <time dateTime={l.at}>
                  {new Date(l.at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </time>
                {l.text}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
