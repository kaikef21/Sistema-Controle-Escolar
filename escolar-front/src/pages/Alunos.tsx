import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Eye, Pencil, Plus, UserSearch } from 'lucide-react'
import { PageHead } from '../components/PageHead'
import { Button } from '../components/ui/Button'
import { SituacaoBadge } from '../components/ui/Badge'
import { SelectField, TextField } from '../components/ui/Field'
import { EmptyState, TableSkeleton } from '../components/ui/Feedback'
import { Pagination } from '../components/ui/Pagination'
import { SearchInput } from '../components/ui/SearchInput'
import { Sheet } from '../components/ui/Sheet'
import { PERIODOS } from '../data/mock'
import { useSimulatedLoading } from '../hooks/useSimulatedLoading'
import { useApp } from '../store/useApp'
import type { Aluno, Situacao } from '../types'
import { initials, normalize } from '../utils/format'

const SITUACOES: Situacao[] = ['Ativo', 'Trancado', 'Inativo', 'Formado']
const PAGE = 8

type Panel =
  | { mode: 'new' }
  | { mode: 'view'; id: string }
  | { mode: 'edit'; id: string }
  | null

export function Alunos() {
  const { alunos, turmas } = useApp()
  const loading = useSimulatedLoading()
  const [q, setQ] = useState('')
  const [turma, setTurma] = useState('')
  const [situacao, setSituacao] = useState('')
  const [periodo, setPeriodo] = useState('')
  const [page, setPage] = useState(1)
  const [panel, setPanel] = useState<Panel>(null)

  const filtered = useMemo(() => {
    const nq = normalize(q.trim())
    return alunos.filter(
      (a) =>
        (!nq || normalize(a.nome).includes(nq) || a.matricula.includes(nq)) &&
        (!turma || a.turmaId === turma) &&
        (!situacao || a.situacao === situacao) &&
        (!periodo || a.periodo === periodo),
    )
  }, [alunos, q, turma, situacao, periodo])

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE))
  const current = Math.min(page, pages)
  const rows = filtered.slice((current - 1) * PAGE, current * PAGE)
  const hasFilter = !!(q || turma || situacao || periodo)

  const change = <T,>(set: (v: T) => void) => (v: T) => {
    set(v)
    setPage(1)
  }
  const clear = () => {
    setQ('')
    setTurma('')
    setSituacao('')
    setPeriodo('')
    setPage(1)
  }

  const turmaNome = (id: string) => turmas.find((t) => t.id === id)?.nome ?? '—'
  const selected =
    panel && panel.mode !== 'new'
      ? alunos.find((a) => a.id === panel.id)
      : undefined

  return (
    <>
      <PageHead
        text="Consulte, cadastre e atualize os dados dos alunos matriculados."
        actions={
          <Button
            variant="primary"
            icon={<Plus size={17} />}
            onClick={() => setPanel({ mode: 'new' })}
          >
            Cadastrar aluno
          </Button>
        }
      />

      <div className="panel">
        <div className="toolbar">
          <SearchInput
            value={q}
            onChange={change(setQ)}
            placeholder="Buscar por nome ou matrícula"
          />
          <select
            className="select"
            aria-label="Filtrar por turma"
            value={turma}
            onChange={(e) => change(setTurma)(e.target.value)}
          >
            <option value="">Todas as turmas</option>
            {turmas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
          <select
            className="select"
            aria-label="Filtrar por situação"
            value={situacao}
            onChange={(e) => change(setSituacao)(e.target.value)}
          >
            <option value="">Todas as situações</option>
            {SITUACOES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            className="select"
            aria-label="Filtrar por período de ingresso"
            value={periodo}
            onChange={(e) => change(setPeriodo)(e.target.value)}
          >
            <option value="">Todos os períodos</option>
            {PERIODOS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          {hasFilter && (
            <Button variant="ghost" size="sm" onClick={clear}>
              Limpar filtros
            </Button>
          )}
        </div>

        {loading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<UserSearch size={24} />}
            title={hasFilter ? 'Nenhum aluno encontrado' : 'Nenhum aluno cadastrado'}
            text={
              hasFilter
                ? 'Ajuste a busca ou remova alguns filtros para ver mais resultados.'
                : 'Cadastre o primeiro aluno para começar a lançar notas e faltas.'
            }
            action={
              hasFilter ? (
                <Button onClick={clear}>Limpar filtros</Button>
              ) : (
                <Button
                  variant="primary"
                  icon={<Plus size={17} />}
                  onClick={() => setPanel({ mode: 'new' })}
                >
                  Cadastrar aluno
                </Button>
              )
            }
          />
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Aluno</th>
                    <th>Matrícula</th>
                    <th>Turma</th>
                    <th>Curso</th>
                    <th>Ingresso</th>
                    <th>Situação</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((a) => (
                    <tr
                      key={a.id}
                      className="clickable"
                      onClick={() => setPanel({ mode: 'view', id: a.id })}
                    >
                      <td>
                        <div className="row">
                          <span className="avatar sm">{initials(a.nome)}</span>
                          <div>
                            <div className="cell-main">{a.nome}</div>
                            <div className="cell-sub">{a.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="num">{a.matricula}</td>
                      <td>{turmaNome(a.turmaId)}</td>
                      <td>{a.curso}</td>
                      <td className="num">{a.periodo}</td>
                      <td>
                        <SituacaoBadge situacao={a.situacao} />
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="row-actions">
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={`Ver ${a.nome}`}
                            icon={<Eye size={16} />}
                            onClick={() => setPanel({ mode: 'view', id: a.id })}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={`Editar ${a.nome}`}
                            icon={<Pencil size={16} />}
                            onClick={() => setPanel({ mode: 'edit', id: a.id })}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={current}
              pageSize={PAGE}
              total={filtered.length}
              onPage={setPage}
            />
          </>
        )}
      </div>

      {panel?.mode === 'view' && selected && (
        <Sheet
          variant="drawer"
          title={selected.nome}
          subtitle={`Matrícula ${selected.matricula}`}
          onClose={() => setPanel(null)}
          footer={
            <>
              <Button onClick={() => setPanel(null)}>Fechar</Button>
              <Button
                variant="primary"
                icon={<Pencil size={16} />}
                onClick={() => setPanel({ mode: 'edit', id: selected.id })}
              >
                Editar dados
              </Button>
            </>
          }
        >
          <dl className="kv">
            <div>
              <dt>Turma</dt>
              <dd>{turmaNome(selected.turmaId)}</dd>
            </div>
            <div>
              <dt>Curso</dt>
              <dd>{selected.curso}</dd>
            </div>
            <div>
              <dt>Situação</dt>
              <dd>
                <SituacaoBadge situacao={selected.situacao} />
              </dd>
            </div>
            <div>
              <dt>Período de ingresso</dt>
              <dd>{selected.periodo}</dd>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <dt>E-mail</dt>
              <dd>{selected.email}</dd>
            </div>
          </dl>
        </Sheet>
      )}

      {(panel?.mode === 'new' || (panel?.mode === 'edit' && selected)) && (
        <AlunoForm
          aluno={panel.mode === 'edit' ? selected : undefined}
          onClose={() => setPanel(null)}
          onSaved={(a) => setPanel({ mode: 'view', id: a.id })}
        />
      )}
    </>
  )
}

interface FormProps {
  aluno?: Aluno
  onClose: () => void
  onSaved: (a: Aluno) => void
}

function AlunoForm({ aluno, onClose, onSaved }: FormProps) {
  const { alunos, turmas, saveAluno, notify } = useApp()
  const [form, setForm] = useState(() => ({
    nome: aluno?.nome ?? '',
    matricula: aluno?.matricula ?? `2026${1000 + alunos.length + 1}`,
    email: aluno?.email ?? '',
    turmaId: aluno?.turmaId ?? '',
    situacao: (aluno?.situacao ?? 'Ativo') as Situacao,
    periodo: aluno?.periodo ?? '2026.1',
  }))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const set = (k: keyof typeof form) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }))

  const validate = () => {
    const e: Record<string, string> = {}
    if (form.nome.trim().length < 3) e.nome = 'Informe o nome completo do aluno.'
    if (!/^\d{4,12}$/.test(form.matricula.trim()))
      e.matricula = 'Use de 4 a 12 números.'
    else if (
      alunos.some(
        (a) => a.matricula === form.matricula.trim() && a.id !== aluno?.id,
      )
    )
      e.matricula = 'Esta matrícula já está em uso por outro aluno.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      e.email = 'Informe um e-mail válido, como nome@escola.edu.br.'
    if (!form.turmaId) e.turmaId = 'Selecione a turma do aluno.'
    return e
  }

  const submit = async (ev: FormEvent) => {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) {
      notify('error', 'Revise os campos', 'Alguns dados precisam de correção.')
      return
    }
    setSaving(true)
    const turma = turmas.find((t) => t.id === form.turmaId)
    const saved = await saveAluno({
      id: aluno?.id,
      nome: form.nome.trim(),
      matricula: form.matricula.trim(),
      email: form.email.trim().toLowerCase(),
      turmaId: form.turmaId,
      curso: turma?.curso ?? '',
      situacao: form.situacao,
      periodo: form.periodo,
    })
    setSaving(false)
    notify(
      'success',
      aluno ? 'Dados atualizados' : 'Aluno cadastrado',
      `${saved.nome} · matrícula ${saved.matricula}`,
    )
    onSaved(saved)
  }

  return (
    <Sheet
      variant="drawer"
      title={aluno ? 'Editar aluno' : 'Cadastrar aluno'}
      subtitle={aluno ? aluno.nome : 'Preencha os dados de matrícula.'}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="aluno-form"
            loading={saving}
          >
            {aluno ? 'Salvar alterações' : 'Cadastrar aluno'}
          </Button>
        </>
      }
    >
      <form id="aluno-form" onSubmit={submit} noValidate className="form-grid">
        <TextField
          className="span-2"
          label="Nome completo"
          value={form.nome}
          error={errors.nome}
          onChange={(e) => set('nome')(e.target.value)}
          autoFocus
        />
        <TextField
          label="Matrícula"
          value={form.matricula}
          error={errors.matricula}
          inputMode="numeric"
          onChange={(e) => set('matricula')(e.target.value)}
        />
        <SelectField
          label="Turma"
          value={form.turmaId}
          error={errors.turmaId}
          placeholder="Selecione"
          options={turmas.map((t) => ({ value: t.id, label: t.nome }))}
          onChange={(e) => set('turmaId')(e.target.value)}
        />
        <TextField
          className="span-2"
          label="E-mail"
          type="email"
          value={form.email}
          error={errors.email}
          onChange={(e) => set('email')(e.target.value)}
        />
        <SelectField
          label="Situação"
          value={form.situacao}
          options={SITUACOES.map((s) => ({ value: s, label: s }))}
          onChange={(e) => set('situacao')(e.target.value)}
        />
        <SelectField
          label="Período de ingresso"
          value={form.periodo}
          options={PERIODOS.map((p) => ({ value: p, label: p }))}
          onChange={(e) => set('periodo')(e.target.value)}
        />
      </form>
    </Sheet>
  )
}
