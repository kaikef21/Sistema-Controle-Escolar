import { useMemo, useState } from 'react'
import {
  CalendarX2,
  Info,
  Lock,
  MessageSquareWarning,
  Minus,
  Plus,
  Save,
  Send,
} from 'lucide-react'
import { PageHead } from '../components/PageHead'
import { Button } from '../components/ui/Button'
import { Alert, EmptyState } from '../components/ui/Feedback'
import { SelectField, TextField } from '../components/ui/Field'
import { StatusBadge } from '../components/ui/Badge'
import { Sheet } from '../components/ui/Sheet'
import { useApp } from '../store/useApp'
import type { Lancamento } from '../types'
import { formatDate, initials } from '../utils/format'

export function LancarFaltas() {
  const { turmas, disciplinas, lancamentos } = useApp()
  const [turmaId, setTurmaId] = useState('')
  const [discId, setDiscId] = useState('')
  const [ini, setIni] = useState('')
  const [fim, setFim] = useState('')

  const periodOk = !!ini && !!fim && ini <= fim
  const periodError = ini && fim && ini > fim ? 'A data final deve ser depois da inicial.' : undefined
  const ready = !!turmaId && !!discId && periodOk

  const lancamento = lancamentos.find(
    (l) =>
      l.tipo === 'falta' &&
      l.turmaId === turmaId &&
      l.disciplinaId === discId &&
      l.periodoInicio === ini &&
      l.periodoFim === fim,
  )

  return (
    <>
      <PageHead text="Registre as faltas de cada aluno em um período e envie para a aprovação da coordenação." />

      <div className="panel">
        <div className="picker four">
          <SelectField
            label="Turma"
            value={turmaId}
            placeholder="Selecione a turma"
            options={turmas.map((t) => ({ value: t.id, label: t.nome }))}
            onChange={(e) => setTurmaId(e.target.value)}
          />
          <SelectField
            label="Disciplina"
            value={discId}
            placeholder="Selecione a disciplina"
            options={disciplinas.map((d) => ({ value: d.id, label: d.nome }))}
            onChange={(e) => setDiscId(e.target.value)}
          />
          <TextField
            label="Início do período"
            type="date"
            value={ini}
            onChange={(e) => setIni(e.target.value)}
          />
          <TextField
            label="Fim do período"
            type="date"
            value={fim}
            error={periodError}
            onChange={(e) => setFim(e.target.value)}
          />
        </div>

        {!ready ? (
          <EmptyState
            icon={<CalendarX2 size={24} />}
            title="Defina turma, disciplina e período"
            text="Para registrar uma única aula, use a mesma data no início e no fim do período."
          />
        ) : (
          <FaltaGrid
            key={`${turmaId}-${discId}-${ini}-${fim}`}
            lancamento={lancamento}
            turmaId={turmaId}
            disciplinaId={discId}
            ini={ini}
            fim={fim}
          />
        )}
      </div>
    </>
  )
}

interface GridProps {
  lancamento?: Lancamento
  turmaId: string
  disciplinaId: string
  ini: string
  fim: string
}

function FaltaGrid({ lancamento, turmaId, disciplinaId, ini, fim }: GridProps) {
  const { alunos, disciplinas, saveLancamento, notify } = useApp()
  const alunosTurma = useMemo(
    () =>
      alunos
        .filter((a) => a.turmaId === turmaId && a.situacao === 'Ativo')
        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
    [alunos, turmaId],
  )

  const [aulas, setAulas] = useState(String(lancamento?.aulasNoPeriodo ?? ''))
  const [faltas, setFaltas] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {}
    lancamento?.itens.forEach((i) => (init[i.alunoId] = i.faltas))
    return init
  })
  const [aulasError, setAulasError] = useState<string | undefined>()
  const [saving, setSaving] = useState<'draft' | 'send' | null>(null)
  const [confirm, setConfirm] = useState(false)

  const total = Number(aulas)
  const aulasValid = Number.isInteger(total) && total >= 1 && total <= 60
  const locked = lancamento?.status === 'pendente' || lancamento?.status === 'aprovado'
  const overLimit = alunosTurma.filter((a) => (faltas[a.id] ?? 0) > (aulasValid ? total : 0))
  const totalFaltas = alunosTurma.reduce((s, a) => s + (faltas[a.id] ?? 0), 0)
  const comFalta = alunosTurma.filter((a) => (faltas[a.id] ?? 0) > 0).length

  const adjust = (id: string, delta: number) =>
    setFaltas((f) => ({
      ...f,
      [id]: Math.min(aulasValid ? total : 0, Math.max(0, (f[id] ?? 0) + delta)),
    }))

  const validate = (): boolean => {
    if (!aulasValid) {
      setAulasError('Informe quantas aulas houve no período (de 1 a 60).')
      return false
    }
    setAulasError(undefined)
    if (overLimit.length > 0) {
      notify(
        'error',
        'Faltas acima do total de aulas',
        `${overLimit.length} aluno(s) com mais faltas que aulas no período.`,
      )
      return false
    }
    return true
  }

  const save = async (submit: boolean) => {
    if (!validate()) return
    setSaving(submit ? 'send' : 'draft')
    await saveLancamento(
      {
        id: lancamento?.id,
        tipo: 'falta',
        turmaId,
        disciplinaId,
        periodoInicio: ini,
        periodoFim: fim,
        aulasNoPeriodo: total,
        itens: alunosTurma.map((a) => ({
          alunoId: a.id,
          nota: null,
          faltas: faltas[a.id] ?? 0,
        })),
      },
      submit,
    )
    setSaving(null)
    setConfirm(false)
    notify(
      'success',
      submit ? 'Enviado para aprovação' : 'Rascunho salvo',
      submit
        ? `Faltas de ${disciplinas.find((d) => d.id === disciplinaId)?.nome} aguardam a coordenação.`
        : `${totalFaltas} faltas registradas em ${comFalta} alunos.`,
    )
  }

  const lastFeedback = [...(lancamento?.historico ?? [])]
    .reverse()
    .find((h) => h.acao === 'correcao' || h.acao === 'rejeitado')

  return (
    <>
      <div className="entry-head">
        <div className="row" style={{ alignItems: 'flex-end' }}>
          <div style={{ width: 200 }}>
            <TextField
              label="Aulas no período"
              inputMode="numeric"
              value={aulas}
              disabled={locked}
              error={aulasError}
              placeholder="Ex.: 8"
              onChange={(e) => setAulas(e.target.value.replace(/\D/g, ''))}
            />
          </div>
          <div className="cell-sub" style={{ paddingBottom: 8 }}>
            {formatDate(ini)} a {formatDate(fim)}
          </div>
        </div>
        {lancamento && <StatusBadge status={lancamento.status} />}
      </div>

      {locked && (
        <div style={{ padding: '14px 20px 0' }}>
          <Alert tone="info" icon={<Lock size={16} />}>
            {lancamento?.status === 'pendente'
              ? 'Este lançamento está aguardando aprovação e não pode ser editado agora.'
              : 'Este lançamento já foi aprovado e está bloqueado para edição.'}
          </Alert>
        </div>
      )}
      {!locked && lastFeedback && lancamento && (
        <div style={{ padding: '14px 20px 0' }}>
          <Alert tone="warn" icon={<MessageSquareWarning size={16} />}>
            <strong>
              {lancamento.status === 'rejeitado'
                ? 'Lançamento rejeitado.'
                : 'A coordenação pediu correção.'}
            </strong>{' '}
            {lastFeedback.comentario}
          </Alert>
        </div>
      )}

      {alunosTurma.length === 0 ? (
        <EmptyState
          icon={<Info size={24} />}
          title="Nenhum aluno ativo nesta turma"
          text="Cadastre ou reative alunos em Alunos para registrar faltas."
        />
      ) : (
        <>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Matrícula</th>
                  <th className="right">Frequência</th>
                  <th className="right">Faltas</th>
                </tr>
              </thead>
              <tbody>
                {alunosTurma.map((a) => {
                  const f = faltas[a.id] ?? 0
                  const freq = aulasValid ? Math.round((1 - f / total) * 100) : null
                  return (
                    <tr key={a.id}>
                      <td>
                        <div className="row">
                          <span className="avatar sm">{initials(a.nome)}</span>
                          <span className="cell-main">{a.nome}</span>
                        </div>
                      </td>
                      <td className="num">{a.matricula}</td>
                      <td className="right num">
                        {freq === null ? '—' : `${freq}%`}
                      </td>
                      <td className="right">
                        <div className="stepper" role="group" aria-label={`Faltas de ${a.nome}`}>
                          <button
                            type="button"
                            aria-label="Remover uma falta"
                            disabled={locked || f <= 0}
                            onClick={() => adjust(a.id, -1)}
                          >
                            <Minus size={15} />
                          </button>
                          <span>{f}</span>
                          <button
                            type="button"
                            aria-label="Adicionar uma falta"
                            disabled={locked || !aulasValid || f >= total}
                            onClick={() => adjust(a.id, 1)}
                          >
                            <Plus size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="summary-bar">
            <span>
              Total de faltas <strong>{totalFaltas}</strong>
            </span>
            <span>
              Alunos com falta <strong>{comFalta}</strong> de{' '}
              <strong>{alunosTurma.length}</strong>
            </span>
            {!aulasValid && (
              <span style={{ color: 'var(--warn-fg)' }}>
                Informe as aulas no período para liberar o registro.
              </span>
            )}
          </div>

          {!locked && (
            <div
              className="sheet-foot"
              style={{ background: 'transparent', borderTop: '1px solid var(--line)' }}
            >
              <Button
                icon={<Save size={16} />}
                loading={saving === 'draft'}
                disabled={saving !== null || !aulasValid}
                onClick={() => save(false)}
              >
                Salvar rascunho
              </Button>
              <Button
                variant="primary"
                icon={<Send size={16} />}
                disabled={saving !== null || !aulasValid}
                onClick={() => validate() && setConfirm(true)}
              >
                Enviar para aprovação
              </Button>
            </div>
          )}
        </>
      )}

      {confirm && (
        <Sheet
          variant="modal"
          title="Enviar para aprovação?"
          subtitle={`${formatDate(ini)} a ${formatDate(fim)}`}
          onClose={() => saving === null && setConfirm(false)}
          footer={
            <>
              <Button onClick={() => setConfirm(false)} disabled={saving !== null}>
                Voltar e revisar
              </Button>
              <Button
                variant="primary"
                loading={saving === 'send'}
                onClick={() => save(true)}
              >
                Enviar faltas
              </Button>
            </>
          }
        >
          <p>
            Serão enviadas <strong>{totalFaltas} faltas</strong> de{' '}
            <strong>{comFalta} alunos</strong> em {total} aulas. Depois do envio, o
            registro só pode ser alterado se a coordenação pedir correção.
          </p>
        </Sheet>
      )}
    </>
  )
}
