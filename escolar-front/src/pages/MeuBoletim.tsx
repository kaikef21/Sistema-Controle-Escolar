import { Navigate } from 'react-router-dom'
import { CalendarCheck, ClipboardList } from 'lucide-react'
import { Avatar, Badge, EmptyState, TableSkeleton } from '../components/ui'
import { getMatricula } from '../state/session'
import { useApp } from '../state/useApp'
import {
  LIMITE_FALTAS,
  TOM_SITUACAO,
  calcularBoletim,
  dayKey,
  formatDate,
  formatNum,
  todayISO,
} from '../utils/format'
import type { Boletim } from '../utils/format'

function resumo(b: Boletim): string {
  switch (b.situacao) {
    case 'Aprovado':
      return `Parabéns! Sua média é ${formatNum(b.media)} e você está aprovado até agora.`
    case 'Recuperação':
      return `Sua média é ${formatNum(b.media)}. Para ser aprovado, ela precisa chegar a 6,0.`
    case 'Reprovado por nota':
      return `Sua média é ${formatNum(b.media)}, abaixo do mínimo de 4,0. Procure o professor.`
    case 'Reprovado por falta':
      return `Você faltou ${Math.round(b.percFaltas)}% das aulas, acima do limite de ${LIMITE_FALTAS}%.`
    default:
      return 'Ainda não há notas lançadas para você. Elas aparecem aqui assim que o professor lançar.'
  }
}

export function MeuBoletim() {
  const { status, alunos, turmas, atividades, notas, frequencias } = useApp()
  const matricula = getMatricula()

  if (!matricula) return <Navigate to="/" replace />
  if (status === 'loading' && alunos.length === 0) return <TableSkeleton />

  const aluno = alunos.find((a) => a.matricula === matricula)
  if (!aluno) {
    if (status !== 'ready') return null
    return <Navigate to="/" replace />
  }

  const b = calcularBoletim(aluno, notas, atividades, frequencias)
  const turma = turmas.find((t) => t.turmaId === aluno.turmaId)
  const hoje = todayISO()

  const minhasAtividades = atividades
    .filter((a) => a.turmaId === aluno.turmaId)
    .sort((x, y) => y.dataRealizacao.localeCompare(x.dataRealizacao))
  const notaDe = (id: string) => notas.find((n) => n.alunoId === aluno.alunoId && n.atividadeId === id)
  const minhasFreq = frequencias
    .filter((f) => f.alunoId === aluno.alunoId)
    .sort((x, y) => y.dataAula.localeCompare(x.dataAula))

  return (
    <>
      <div className="page-head">
        <div className="person person-lg">
          <Avatar nome={aluno.nome} size={56} />
          <div>
            <h1>Olá, {aluno.nome.split(' ')[0]}</h1>
            <p>
              {turma?.nome ?? 'Sem turma'} · Matrícula {aluno.matricula}
            </p>
          </div>
        </div>
      </div>

      <section className={`me-status tone-${TOM_SITUACAO[b.situacao]}`}>
        <Badge tone={TOM_SITUACAO[b.situacao]}>{b.situacao}</Badge>
        <p>{resumo(b)}</p>
      </section>

      <section className="kpis" aria-label="Resumo">
        <div className="kpi">
          <span>Média</span>
          <strong>{formatNum(b.media)}</strong>
        </div>
        <div className="kpi">
          <span>Atividades avaliadas</span>
          <strong>
            {b.notasLancadas} <small>de {minhasAtividades.length}</small>
          </strong>
        </div>
        <div className="kpi">
          <span>Faltas</span>
          <strong>{b.faltas}</strong>
        </div>
        <div className="kpi">
          <span>Percentual de faltas</span>
          <strong>{b.aulas ? `${Math.round(b.percFaltas)}%` : '—'}</strong>
        </div>
      </section>

      <div className="two-col two-col-wide">
        <section className="card">
          <div className="card-head">
            <h2>
              <ClipboardList size={18} /> Atividades da turma
            </h2>
            <span className="sub-cell">{minhasAtividades.length} no total</span>
          </div>
          {minhasAtividades.length === 0 ? (
            <EmptyState
              icon={<ClipboardList size={32} />}
              title="Nenhuma atividade ainda"
              text="Quando o professor cadastrar atividades para a sua turma, elas aparecem aqui."
            />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Atividade</th>
                    <th>Data</th>
                    <th className="right">Sua nota</th>
                  </tr>
                </thead>
                <tbody>
                  {minhasAtividades.map((a) => {
                    const n = notaDe(a.atividadeId)
                    const futura = dayKey(a.dataRealizacao) > hoje
                    return (
                      <tr key={a.atividadeId}>
                        <td>
                          <div className="main-cell">{a.titulo}</div>
                          <div className="sub-cell">{a.tipo}</div>
                        </td>
                        <td>{formatDate(a.dataRealizacao)}</td>
                        <td className="right">
                          {n ? (
                            <strong>
                              {formatNum(n.valorNota)} <span className="sub-cell">/ {formatNum(a.notaMaxima ?? 10)}</span>
                            </strong>
                          ) : futura ? (
                            <Badge tone="indigo">Agendada</Badge>
                          ) : (
                            <Badge tone="slate">Aguardando nota</Badge>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="card">
          <div className="card-head">
            <h2>
              <CalendarCheck size={18} /> Presença
            </h2>
            <span className="sub-cell">{minhasFreq.length} aulas registradas</span>
          </div>
          {minhasFreq.length === 0 ? (
            <EmptyState
              icon={<CalendarCheck size={32} />}
              title="Sem registros de presença"
              text="As presenças e faltas lançadas pelo professor aparecem aqui."
            />
          ) : (
            <ul className="attn">
              {minhasFreq.map((f) => (
                <li key={f.frequenciaId ?? f.dataAula}>
                  <span className="main-cell">{formatDate(f.dataAula)}</span>
                  <Badge tone={f.presente ? 'green' : 'rose'}>{f.presente ? 'Presente' : 'Falta'}</Badge>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}
