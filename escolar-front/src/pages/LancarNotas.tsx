import { useMemo, useState } from 'react'
import { ClipboardList, Info, Lock, MessageSquareWarning, Send, Save } from 'lucide-react'
import { PageHead } from '../components/PageHead'
import { Button } from '../components/ui/Button'
import { Alert, EmptyState } from '../components/ui/Feedback'
import { SelectField } from '../components/ui/Field'
import { StatusBadge } from '../components/ui/Badge'
import { Sheet } from '../components/ui/Sheet'
import { useApp } from '../store/useApp'
import type { Atividade, Lancamento } from '../types'
import { formatDate, formatNota, initials } from '../utils/format'

const parse = (s: string): number | null => {
  const t = s.trim().replace(',', '.')
  if (t === '') return null
  const n = Number(t)
  return Number.isNaN(n) ? NaN : n
}

export function LancarNotas() {
  const { turmas, disciplinas, atividades, lancamentos } = useApp()
  const [turmaId, setTurmaId] = useState('')
  const [discId, setDiscId] = useState('')
  const [atId, setAtId] = useState('')

  const discOptions = useMemo(() => {
    const ids = new Set(
      atividades.filter((a) => a.turmaId === turmaId).map((a) => a.disciplinaId),
    )
    return disciplinas.filter((d) => ids.has(d.id))
  }, [atividades, disciplinas, turmaId])

  const atOptions = atividades.filter(
    (a) => a.turmaId === turmaId && a.disciplinaId === discId,
  )
  const atividade = atividades.find((a) => a.id === atId)
  const lancamento = lancamentos.find(
    (l) => l.tipo === 'nota' && l.atividadeId === atId,
  )

  return (
    <>
      <PageHead text="Escolha a turma, a disciplina e a atividade, lance as notas e envie para a aprovação da coordenação." />

      <div className="panel">
        <div className="picker">
          <SelectField
            label="Turma"
            value={turmaId}
            placeholder="Selecione a turma"
            options={turmas.map((t) => ({ value: t.id, label: t.nome }))}
            onChange={(e) => {
              setTurmaId(e.target.value)
              setDiscId('')
              setAtId('')
            }}
          />
          <SelectField
            label="Disciplina"
            value={discId}
            disabled={!turmaId}
            placeholder={turmaId ? 'Selecione a disciplina' : 'Escolha a turma primeiro'}
            options={discOptions.map((d) => ({ value: d.id, label: d.nome }))}
            onChange={(e) => {
              setDiscId(e.target.value)
              setAtId('')
            }}
          />
          <SelectField
            label="Atividade"
            value={atId}
            disabled={!discId}
            placeholder={discId ? 'Selecione a atividade' : 'Escolha a disciplina primeiro'}
            options={atOptions.map((a) => ({ value: a.id, label: a.titulo }))}
            onChange={(e) => setAtId(e.target.value)}
          />
        </div>

        {!atividade ? (
          <EmptyState
            icon={<ClipboardList size={24} />}
            title="Nenhuma atividade selecionada"
            text={
              turmaId && discOptions.length === 0
                ? 'Esta turma ainda não tem atividades cadastradas. Cadastre uma em Atividades para lançar notas.'
                : 'Selecione turma, disciplina e atividade para listar os alunos e lançar as notas.'
            }
          />
        ) : (
          <NotaGrid
            key={atividade.id}
            atividade={atividade}
            lancamento={lancamento}
            turmaId={turmaId}
            disciplinaId={discId}
          />
        )}
      </div>
    </>
  )
}

interface GridProps {
  atividade: Atividade
  lancamento?: Lancamento
  turmaId: string
  disciplinaId: string
}

function NotaGrid({ atividade, lancamento, turmaId, disciplinaId }: GridProps) {
  const { alunos, saveLancamento, notify } = useApp()
  const alunosTurma = useMemo(
    () =>
      alunos
        .filter((a) => a.turmaId === turmaId && a.situacao === 'Ativo')
        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
    [alunos, turmaId],
  )

  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    lancamento?.itens.forEach((i) => {
      if (i.nota !== null) init[i.alunoId] = String(i.nota).replace('.', ',')
    })
    return init
  })
  const [saving, setSaving] = useState<'draft' | 'send' | null>(null)
  const [confirm, setConfirm] = useState(false)

  const locked = lancamento?.status === 'pendente' || lancamento?.status === 'aprovado'
  const max = atividade.notaMaxima

  const errorOf = (id: string): string | null => {
    const n = parse(values[id] ?? '')
    if (n === null) return null
    if (Number.isNaN(n)) return 'Use apenas números.'
    if (n < 0) return 'Nota negativa.'
    if (n > max) return `Máximo ${formatNota(max)}.`
    return null
  }

  const parsed = alunosTurma.map((a) => parse(values[a.id] ?? ''))
  const filled = parsed.filter((n) => n !== null).length
  const invalid = alunosTurma.filter((a) => errorOf(a.id)).length
  const valid = parsed.filter(
    (n): n is number => n !== null && !Number.isNaN(n) && n >= 0 && n <= max,
  )
  const media = valid.length ? valid.reduce((s, n) => s + n, 0) / valid.length : null
  const complete = filled === alunosTurma.length && invalid === 0

  const buildDraft = () => ({
    id: lancamento?.id,
    tipo: 'nota' as const,
    turmaId,
    disciplinaId,
    atividadeId: atividade.id,
    itens: alunosTurma.map((a) => {
      const n = parse(values[a.id] ?? '')
      return { alunoId: a.id, nota: n === null || Number.isNaN(n) ? null : n, faltas: 0 }
    }),
  })

  const save = async (submit: boolean) => {
    if (invalid > 0) {
      notify('error', 'Há notas inválidas', 'Corrija os campos destacados antes de salvar.')
      return
    }
    setSaving(submit ? 'send' : 'draft')
    await saveLancamento(buildDraft(), submit)
    setSaving(null)
    setConfirm(false)
    notify(
      'success',
      submit ? 'Enviado para aprovação' : 'Rascunho salvo',
      submit
        ? `${alunosTurma.length} notas de ${atividade.titulo} aguardam a coordenação.`
        : `${filled} de ${alunosTurma.length} notas salvas.`,
    )
  }

  const lastFeedback = [...(lancamento?.historico ?? [])]
    .reverse()
    .find((h) => h.acao === 'correcao' || h.acao === 'rejeitado')

  return (
    <>
      <div className="entry-head">
        <div>
          <strong>{atividade.titulo}</strong>
          <div className="cell-sub">
            {atividade.tipo} · aplicada em {formatDate(atividade.dataAplicacao)} ·
            lançar até {formatDate(atividade.prazoLancamento)} · pontuação máxima{' '}
            {formatNota(max)}
          </div>
        </div>
        <div className="row">
          {lancamento && <StatusBadge status={lancamento.status} />}
        </div>
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
          text="Cadastre ou reative alunos em Alunos para poder lançar notas."
        />
      ) : (
        <>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Matrícula</th>
                  <th className="right">Nota (0 a {formatNota(max)})</th>
                </tr>
              </thead>
              <tbody>
                {alunosTurma.map((a) => {
                  const err = errorOf(a.id)
                  return (
                    <tr key={a.id}>
                      <td>
                        <div className="row">
                          <span className="avatar sm">{initials(a.nome)}</span>
                          <span className="cell-main">{a.nome}</span>
                        </div>
                      </td>
                      <td className="num">{a.matricula}</td>
                      <td className="right">
                        <div
                          className={err ? 'has-error' : ''}
                          style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}
                        >
                          <input
                            className="input grade-input"
                            inputMode="decimal"
                            aria-label={`Nota de ${a.nome}`}
                            aria-invalid={!!err || undefined}
                            disabled={locked}
                            placeholder="—"
                            value={values[a.id] ?? ''}
                            onChange={(e) =>
                              setValues((v) => ({ ...v, [a.id]: e.target.value }))
                            }
                          />
                          {err && <span className="cell-error">{err}</span>}
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
              Preenchidas <strong>{filled}</strong> de <strong>{alunosTurma.length}</strong>
            </span>
            <span>
              Média da turma <strong>{media === null ? '—' : formatNota(media)}</strong>
            </span>
            {invalid > 0 && (
              <span style={{ color: 'var(--danger-fg)' }}>
                <strong style={{ color: 'inherit' }}>{invalid}</strong>{' '}
                {invalid === 1 ? 'nota inválida' : 'notas inválidas'}
              </span>
            )}
          </div>

          {!locked && (
            <div className="sheet-foot" style={{ background: 'transparent', borderTop: '1px solid var(--line)' }}>
              <Button
                icon={<Save size={16} />}
                loading={saving === 'draft'}
                disabled={saving !== null || filled === 0}
                onClick={() => save(false)}
              >
                Salvar rascunho
              </Button>
              <Button
                variant="primary"
                icon={<Send size={16} />}
                disabled={!complete || saving !== null}
                title={
                  complete
                    ? undefined
                    : 'Preencha a nota de todos os alunos para enviar.'
                }
                onClick={() => setConfirm(true)}
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
          subtitle={atividade.titulo}
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
                Enviar notas
              </Button>
            </>
          }
        >
          <p>
            Serão enviadas <strong>{alunosTurma.length} notas</strong> com média{' '}
            <strong>{media === null ? '—' : formatNota(media)}</strong>. Depois do
            envio, o lançamento só pode ser alterado se a coordenação pedir correção.
          </p>
        </Sheet>
      )}
    </>
  )
}
