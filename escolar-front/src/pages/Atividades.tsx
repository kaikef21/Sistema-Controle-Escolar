import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { ClipboardList, Pencil, Plus } from 'lucide-react'
import { PageHead } from '../components/PageHead'
import { Button } from '../components/ui/Button'
import { Badge, StatusBadge } from '../components/ui/Badge'
import {
  SelectField,
  TextAreaField,
  TextField,
} from '../components/ui/Field'
import { EmptyState, TableSkeleton } from '../components/ui/Feedback'
import { Pagination } from '../components/ui/Pagination'
import { SearchInput } from '../components/ui/SearchInput'
import { Sheet } from '../components/ui/Sheet'
import { useSimulatedLoading } from '../hooks/useSimulatedLoading'
import { useApp } from '../store/useApp'
import type { Atividade, TipoAtividade } from '../types'
import { formatDate, formatNota, normalize, todayISO } from '../utils/format'

const TIPOS: TipoAtividade[] = ['Prova', 'Trabalho', 'Atividade Prática']
const PAGE = 8

export function Atividades() {
  const { atividades, turmas, disciplinas, lancamentos } = useApp()
  const loading = useSimulatedLoading()
  const [q, setQ] = useState('')
  const [turma, setTurma] = useState('')
  const [disc, setDisc] = useState('')
  const [tipo, setTipo] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Atividade | 'new' | null>(null)

  const filtered = useMemo(() => {
    const nq = normalize(q.trim())
    return atividades
      .filter(
        (a) =>
          (!nq || normalize(a.titulo).includes(nq)) &&
          (!turma || a.turmaId === turma) &&
          (!disc || a.disciplinaId === disc) &&
          (!tipo || a.tipo === tipo),
      )
      .sort((a, b) => b.dataAplicacao.localeCompare(a.dataAplicacao))
  }, [atividades, q, turma, disc, tipo])

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE))
  const current = Math.min(page, pages)
  const rows = filtered.slice((current - 1) * PAGE, current * PAGE)
  const hasFilter = !!(q || turma || disc || tipo)
  const reset = () => {
    setQ('')
    setTurma('')
    setDisc('')
    setTipo('')
    setPage(1)
  }

  const turmaNome = (id: string) => turmas.find((t) => t.id === id)?.nome ?? '—'
  const discNome = (id: string) =>
    disciplinas.find((d) => d.id === id)?.nome ?? '—'
  const today = todayISO()

  return (
    <>
      <PageHead
        text="Cadastre as provas, trabalhos e atividades práticas de cada turma e acompanhe o prazo de lançamento."
        actions={
          <Button
            variant="primary"
            icon={<Plus size={17} />}
            onClick={() => setEditing('new')}
          >
            Nova atividade
          </Button>
        }
      />

      <div className="panel">
        <div className="toolbar">
          <SearchInput
            value={q}
            onChange={(v) => {
              setQ(v)
              setPage(1)
            }}
            placeholder="Buscar por nome da atividade"
          />
          <select
            className="select"
            aria-label="Filtrar por turma"
            value={turma}
            onChange={(e) => {
              setTurma(e.target.value)
              setPage(1)
            }}
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
            aria-label="Filtrar por disciplina"
            value={disc}
            onChange={(e) => {
              setDisc(e.target.value)
              setPage(1)
            }}
          >
            <option value="">Todas as disciplinas</option>
            {disciplinas.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nome}
              </option>
            ))}
          </select>
          <select
            className="select"
            aria-label="Filtrar por tipo"
            value={tipo}
            onChange={(e) => {
              setTipo(e.target.value)
              setPage(1)
            }}
          >
            <option value="">Todos os tipos</option>
            {TIPOS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          {hasFilter && (
            <Button variant="ghost" size="sm" onClick={reset}>
              Limpar filtros
            </Button>
          )}
        </div>

        {loading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={24} />}
            title={
              hasFilter ? 'Nenhuma atividade encontrada' : 'Nenhuma atividade cadastrada'
            }
            text={
              hasFilter
                ? 'Ajuste a busca ou remova alguns filtros.'
                : 'Crie a primeira atividade para depois lançar as notas da turma.'
            }
            action={
              hasFilter ? (
                <Button onClick={reset}>Limpar filtros</Button>
              ) : (
                <Button
                  variant="primary"
                  icon={<Plus size={17} />}
                  onClick={() => setEditing('new')}
                >
                  Nova atividade
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
                    <th>Atividade</th>
                    <th>Disciplina</th>
                    <th>Turma</th>
                    <th>Aplicação</th>
                    <th className="right">Pontuação</th>
                    <th>Prazo de lançamento</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((a) => {
                    const l = lancamentos.find((x) => x.atividadeId === a.id)
                    const late =
                      a.prazoLancamento < today &&
                      (!l || l.status === 'rascunho' || l.status === 'correcao')
                    return (
                      <tr
                        key={a.id}
                        className="clickable"
                        onClick={() => setEditing(a)}
                      >
                        <td>
                          <div className="cell-main">{a.titulo}</div>
                          <div className="cell-sub">{a.tipo}</div>
                        </td>
                        <td>{discNome(a.disciplinaId)}</td>
                        <td>{turmaNome(a.turmaId)}</td>
                        <td className="num">{formatDate(a.dataAplicacao)}</td>
                        <td className="right num">{formatNota(a.notaMaxima)}</td>
                        <td>
                          <div className="num">{formatDate(a.prazoLancamento)}</div>
                          <div style={{ marginTop: 4 }}>
                            {late ? (
                              <Badge tone="danger">Prazo vencido</Badge>
                            ) : l ? (
                              <StatusBadge status={l.status} />
                            ) : (
                              <span className="cell-sub">Sem lançamento</span>
                            )}
                          </div>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="row-actions">
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label={`Editar ${a.titulo}`}
                              icon={<Pencil size={16} />}
                              onClick={() => setEditing(a)}
                            />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
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

      {editing && (
        <AtividadeForm
          atividade={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  )
}

function AtividadeForm({
  atividade,
  onClose,
}: {
  atividade?: Atividade
  onClose: () => void
}) {
  const { turmas, disciplinas, saveAtividade, notify } = useApp()
  const [f, setF] = useState({
    titulo: atividade?.titulo ?? '',
    descricao: atividade?.descricao ?? '',
    tipo: (atividade?.tipo ?? 'Prova') as TipoAtividade,
    disciplinaId: atividade?.disciplinaId ?? '',
    turmaId: atividade?.turmaId ?? '',
    dataAplicacao: atividade?.dataAplicacao ?? '',
    notaMaxima: String(atividade?.notaMaxima ?? 10),
    prazoLancamento: atividade?.prazoLancamento ?? '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const set = (k: keyof typeof f) => (v: string) =>
    setF((s) => ({ ...s, [k]: v }))

  const validate = () => {
    const e: Record<string, string> = {}
    if (f.titulo.trim().length < 3) e.titulo = 'Dê um nome com pelo menos 3 letras.'
    if (!f.disciplinaId) e.disciplinaId = 'Selecione a disciplina.'
    if (!f.turmaId) e.turmaId = 'Selecione a turma.'
    if (!f.dataAplicacao) e.dataAplicacao = 'Informe a data de aplicação.'
    const max = Number(f.notaMaxima.replace(',', '.'))
    if (!f.notaMaxima || Number.isNaN(max) || max <= 0 || max > 100)
      e.notaMaxima = 'Informe uma pontuação entre 0,1 e 100.'
    if (!f.prazoLancamento) e.prazoLancamento = 'Informe o prazo de lançamento.'
    else if (f.dataAplicacao && f.prazoLancamento < f.dataAplicacao)
      e.prazoLancamento = 'O prazo não pode ser anterior à data de aplicação.'
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
    await saveAtividade({
      id: atividade?.id,
      titulo: f.titulo.trim(),
      descricao: f.descricao.trim(),
      tipo: f.tipo,
      disciplinaId: f.disciplinaId,
      turmaId: f.turmaId,
      dataAplicacao: f.dataAplicacao,
      notaMaxima: Number(f.notaMaxima.replace(',', '.')),
      prazoLancamento: f.prazoLancamento,
    })
    setSaving(false)
    notify(
      'success',
      atividade ? 'Atividade atualizada' : 'Atividade criada',
      f.titulo.trim(),
    )
    onClose()
  }

  return (
    <Sheet
      variant="modal"
      wide
      title={atividade ? 'Editar atividade' : 'Nova atividade'}
      subtitle="Defina a pontuação máxima e até quando as notas podem ser lançadas."
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="atividade-form"
            loading={saving}
          >
            {atividade ? 'Salvar alterações' : 'Criar atividade'}
          </Button>
        </>
      }
    >
      <form id="atividade-form" onSubmit={submit} noValidate className="form-grid">
        <TextField
          className="span-2"
          label="Nome da atividade"
          value={f.titulo}
          error={errors.titulo}
          onChange={(e) => set('titulo')(e.target.value)}
          autoFocus
        />
        <TextAreaField
          className="span-2"
          label="Descrição"
          value={f.descricao}
          hint="Opcional. Conteúdo cobrado, critérios de correção, etc."
          onChange={(e) => set('descricao')(e.target.value)}
        />
        <SelectField
          label="Disciplina"
          value={f.disciplinaId}
          error={errors.disciplinaId}
          placeholder="Selecione"
          options={disciplinas.map((d) => ({ value: d.id, label: d.nome }))}
          onChange={(e) => set('disciplinaId')(e.target.value)}
        />
        <SelectField
          label="Turma"
          value={f.turmaId}
          error={errors.turmaId}
          placeholder="Selecione"
          options={turmas.map((t) => ({ value: t.id, label: t.nome }))}
          onChange={(e) => set('turmaId')(e.target.value)}
        />
        <SelectField
          label="Tipo"
          value={f.tipo}
          options={TIPOS.map((t) => ({ value: t, label: t }))}
          onChange={(e) => set('tipo')(e.target.value)}
        />
        <TextField
          label="Pontuação máxima"
          inputMode="decimal"
          value={f.notaMaxima}
          error={errors.notaMaxima}
          onChange={(e) => set('notaMaxima')(e.target.value)}
        />
        <TextField
          label="Data de aplicação"
          type="date"
          value={f.dataAplicacao}
          error={errors.dataAplicacao}
          onChange={(e) => set('dataAplicacao')(e.target.value)}
        />
        <TextField
          label="Prazo de lançamento"
          type="date"
          value={f.prazoLancamento}
          error={errors.prazoLancamento}
          onChange={(e) => set('prazoLancamento')(e.target.value)}
        />
      </form>
    </Sheet>
  )
}
