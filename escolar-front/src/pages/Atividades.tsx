import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ClipboardList, FilePlus2, PenLine } from 'lucide-react'
import { api, ApiError } from '../api/client'
import {
  Badge,
  Button,
  EmptyState,
  SelectField,
  TableSkeleton,
  TextField,
} from '../components/ui'
import { useApp } from '../state/useApp'
import { TIPOS_ATIVIDADE } from '../types'
import { formatDate, formatNum, parseNumber, todayISO } from '../utils/format'

const TOM: Record<string, 'indigo' | 'amber' | 'green'> = {
  Prova: 'indigo',
  Trabalho: 'amber',
  'Atividade Prática': 'green',
}

export function Atividades() {
  const { status, turmas, alunos, atividades, notas, reload, notify, addLog } = useApp()
  const navigate = useNavigate()

  const [titulo, setTitulo] = useState('')
  const [tipo, setTipo] = useState<string>(TIPOS_ATIVIDADE[0])
  const [turmaId, setTurmaId] = useState('')
  const [notaMaxima, setNotaMaxima] = useState('10')
  const [data, setData] = useState(todayISO())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [filtroTurma, setFiltroTurma] = useState('')

  const turmaNome = (id: string) => turmas.find((t) => t.turmaId === id)?.nome ?? '—'

  const lista = useMemo(
    () =>
      atividades
        .filter((a) => !filtroTurma || a.turmaId === filtroTurma)
        .sort((a, b) => b.dataRealizacao.localeCompare(a.dataRealizacao)),
    [atividades, filtroTurma],
  )

  const submit = async (ev: FormEvent) => {
    ev.preventDefault()
    const e: Record<string, string> = {}
    if (titulo.trim().length < 3) e.titulo = 'Dê um nome para a atividade.'
    if (!turmaId) e.turmaId = 'Selecione a turma.'
    const max = parseNumber(notaMaxima)
    if (max === null || Number.isNaN(max) || max <= 0 || max > 100)
      e.notaMaxima = 'Informe um valor entre 0,1 e 100.'
    if (!data) e.dataRealizacao = 'Informe a data.'
    setErrors(e)
    if (Object.keys(e).length) return

    setSaving(true)
    try {
      await api.criarAtividade({
        titulo: titulo.trim(),
        tipo,
        turmaId,
        notaMaxima: max as number,
        dataRealizacao: data,
      })
      notify('success', 'Atividade cadastrada', titulo.trim())
      addLog(`Atividade cadastrada: ${titulo.trim()} (${turmaNome(turmaId)})`)
      setTitulo('')
      reload()
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fields)
        notify('error', 'Não foi possível cadastrar', err.message)
      } else {
        notify('error', 'Não foi possível cadastrar')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Cadastro de atividades</h1>
          <p>Registre provas, trabalhos e atividades práticas de cada turma.</p>
        </div>
        <Button variant="primary" icon={<ArrowRight size={17} />} onClick={() => navigate('/lancamentos')}>
          Próxima etapa: Lançamentos
        </Button>
      </div>

      <div className="split">
        <section className="card">
          <div className="card-head">
            <h2>
              <FilePlus2 size={18} /> Nova atividade
            </h2>
          </div>
          <form className="card-body form" onSubmit={submit} noValidate>
            <TextField
              label="Título"
              placeholder="Ex.: Prova 1 de Matemática"
              value={titulo}
              error={errors.titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
            <div className="row2">
              <SelectField
                label="Tipo"
                value={tipo}
                error={errors.tipo}
                options={TIPOS_ATIVIDADE.map((t) => ({ value: t, label: t }))}
                onChange={(e) => setTipo(e.target.value)}
              />
              <TextField
                label="Nota máxima"
                inputMode="decimal"
                value={notaMaxima}
                error={errors.notaMaxima}
                onChange={(e) => setNotaMaxima(e.target.value)}
              />
            </div>
            <SelectField
              label="Turma"
              value={turmaId}
              error={errors.turmaId}
              placeholder={turmas.length ? 'Selecione a turma' : 'Cadastre uma turma na etapa Alunos'}
              options={turmas.map((t) => ({ value: t.turmaId, label: t.nome }))}
              onChange={(e) => setTurmaId(e.target.value)}
            />
            <TextField
              label="Data de realização"
              type="date"
              value={data}
              error={errors.dataRealizacao}
              onChange={(e) => setData(e.target.value)}
            />
            <Button variant="primary" type="submit" block loading={saving} disabled={status === 'error'}>
              Cadastrar atividade
            </Button>
          </form>
        </section>

        <section className="card">
          <div className="card-head">
            <h2>
              <ClipboardList size={18} /> Atividades cadastradas
            </h2>
            <span className="sub-cell">{atividades.length} no total</span>
          </div>
          <div className="toolbar">
            <select
              className="select"
              aria-label="Filtrar por turma"
              value={filtroTurma}
              onChange={(e) => setFiltroTurma(e.target.value)}
            >
              <option value="">Todas as turmas</option>
              {turmas.map((t) => (
                <option key={t.turmaId} value={t.turmaId}>
                  {t.nome}
                </option>
              ))}
            </select>
          </div>

          {status === 'loading' && atividades.length === 0 ? (
            <TableSkeleton />
          ) : lista.length === 0 ? (
            <EmptyState
              icon={<ClipboardList size={32} />}
              title="Nenhuma atividade por aqui"
              text={
                atividades.length === 0
                  ? 'Cadastre a primeira atividade para poder lançar notas.'
                  : 'Não há atividades para a turma escolhida.'
              }
            />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Atividade</th>
                    <th>Turma</th>
                    <th>Data</th>
                    <th>Notas lançadas</th>
                    <th className="right">Máx.</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {lista.map((a) => {
                    const lancadas = notas.filter((n) => n.atividadeId === a.atividadeId).length
                    const total = alunos.filter((x) => x.turmaId === a.turmaId).length
                    const pct = total ? Math.min(100, Math.round((lancadas / total) * 100)) : 0
                    return (
                      <tr key={a.atividadeId ?? a.titulo}>
                        <td>
                          <div className="main-cell">{a.titulo}</div>
                          <div className="sub-cell">
                            {a.tipo && <Badge tone={TOM[a.tipo] ?? 'slate'}>{a.tipo}</Badge>}
                          </div>
                        </td>
                        <td>{turmaNome(a.turmaId)}</td>
                        <td>{formatDate(a.dataRealizacao)}</td>
                        <td>
                          <div className="progress" title={`${lancadas} de ${total} notas lançadas`}>
                            <i style={{ width: `${pct}%` }} />
                          </div>
                          <div className="sub-cell">
                            {lancadas} de {total} notas
                          </div>
                        </td>
                        <td className="right">{formatNum(a.notaMaxima)}</td>
                        <td className="right">
                          <Button
                            size="sm"
                            icon={<PenLine size={15} />}
                            onClick={() => navigate(`/lancamentos?atividade=${a.atividadeId}`)}
                          >
                            Lançar
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  )
}
