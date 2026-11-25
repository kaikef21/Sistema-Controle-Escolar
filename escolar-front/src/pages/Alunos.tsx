import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, UserPlus, Users } from 'lucide-react'
import { api, ApiError } from '../api/client'
import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  Modal,
  SearchInput,
  SelectField,
  TableSkeleton,
  TextField,
} from '../components/ui'
import { useApp } from '../state/useApp'
import { TOM_SITUACAO, calcularBoletim, formatNum, normalize } from '../utils/format'

export function Alunos() {
  const { status, turmas, alunos, atividades, notas, frequencias, reload, notify, addLog } = useApp()
  const navigate = useNavigate()

  const [nome, setNome] = useState('')
  const [matricula, setMatricula] = useState('')
  const [turmaId, setTurmaId] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [novaTurma, setNovaTurma] = useState(false)

  const [q, setQ] = useState('')
  const [filtroTurma, setFiltroTurma] = useState('')

  const turmaNome = (id: string) => turmas.find((t) => t.turmaId === id)?.nome ?? '—'

  // Garante que o turmaId nunca fique vazio quando já existe turma cadastrada.
  useEffect(() => {
    if (!turmaId && turmas.length > 0) setTurmaId(turmas[0].turmaId)
  }, [turmas, turmaId])

  const lista = useMemo(() => {
    const nq = normalize(q.trim())
    return alunos
      .filter(
        (a) =>
          (!filtroTurma || a.turmaId === filtroTurma) &&
          (!nq || normalize(a.nome).includes(nq) || (a.matricula ?? '').includes(nq)),
      )
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  }, [alunos, q, filtroTurma])

  const submit = async (ev: FormEvent) => {
    ev.preventDefault()
    const erros: Record<string, string> = {}
    if (nome.trim().length < 3) erros.nome = 'Informe o nome completo.'
    if (!matricula.trim()) erros.matricula = 'Informe a matrícula.'
    if (!turmaId) erros.turmaId = 'Selecione a turma.'
    setErrors(erros)
    if (Object.keys(erros).length) return

    setSaving(true)
    try {
      await api.criarAluno({
        nome: nome.trim(),
        matricula: matricula.trim(),
        turmaId,
      })
      notify('success', 'Aluno cadastrado', `${nome.trim()} entrou em ${turmaNome(turmaId)}.`)
      addLog(`Aluno cadastrado: ${nome.trim()} (${turmaNome(turmaId)})`)
      setNome('')
      setMatricula('')
      reload()
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fields)
        notify('error', 'Não foi possível cadastrar', err.message)
      } else {
        const msg = err instanceof Error ? err.message : 'Não foi possível cadastrar.'
        notify('error', 'Não foi possível cadastrar', msg)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Cadastro de alunos</h1>
          <p>Adicione os estudantes matriculados em cada turma.</p>
          <Button variant="primary" icon={<ArrowLeft size={17} />} onClick={() => navigate('/')}>
            Etapa anterior: Início
          </Button>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button variant="primary" icon={<ArrowRight size={17} />} onClick={() => navigate('/atividades')}>
            Próxima etapa: Atividades
          </Button>
        </div>
      </div>

      <div className="split">
        <section className="card">
          <div className="card-head">
            <h2>
              <UserPlus size={18} /> Novo aluno
            </h2>
          </div>
          <form className="card-body form" onSubmit={submit} noValidate>
            <TextField
              label="Nome completo"
              placeholder="Ex.: Ana Clara Souza"
              value={nome}
              error={errors.nome}
              onChange={(e) => setNome(e.target.value)}
            />
            <TextField
              label="Matrícula"
              placeholder="Ex.: 2026001"
              value={matricula}
              error={errors.matricula}
              onChange={(e) => setMatricula(e.target.value)}
            />
            <SelectField
              label="Turma"
              value={turmaId}
              error={errors.turmaId}
              placeholder={turmas.length ? 'Selecione a turma' : 'Nenhuma turma cadastrada'}
              options={turmas.map((t) => ({
                value: t.turmaId,
                label: `${t.nome} (${t.anoLetivo})`,
              }))}
              onChange={(e) => setTurmaId(e.target.value)}
              action={
                <button type="button" className="link-btn" onClick={() => setNovaTurma(true)}>
                  Criar turma
                </button>
              }
            />
            <Button variant="primary" type="submit" block loading={saving} disabled={status === 'error'}>
              Cadastrar aluno
            </Button>
          </form>
        </section>

        <section className="card">
          <div className="card-head">
            <h2>
              <Users size={18} /> Alunos cadastrados
            </h2>
            <span className="sub-cell">{alunos.length} no total</span>
          </div>
          <div className="toolbar">
            <SearchInput value={q} onChange={setQ} placeholder="Buscar por nome ou matrícula" />
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

          {status === 'loading' && alunos.length === 0 ? (
            <TableSkeleton />
          ) : lista.length === 0 ? (
            <EmptyState
              icon={<Users size={32} />}
              title={alunos.length === 0 ? 'Nenhum aluno cadastrado' : 'Nenhum aluno encontrado'}
              text={
                alunos.length === 0
                  ? 'Use o formulário ao lado para cadastrar o primeiro aluno.'
                  : 'Ajuste a busca ou escolha outra turma.'
              }
            />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Aluno</th>
                    <th>Matrícula</th>
                    <th>Turma</th>
                    <th className="right">Média</th>
                    <th>Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map((a) => {
                    const b = calcularBoletim(a, notas, atividades, frequencias)
                    return (
                      <tr key={a.alunoId ?? a.matricula}>
                        <td>
                          <div className="person">
                            <Avatar nome={a.nome} />
                            <span className="main-cell">{a.nome}</span>
                          </div>
                        </td>
                        <td className="mono">{a.matricula ?? '—'}</td>
                        <td>{turmaNome(a.turmaId)}</td>
                        <td className="right">{formatNum(b.media)}</td>
                        <td>
                          <Badge tone={TOM_SITUACAO[b.situacao]}>{b.situacao}</Badge>
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

      {novaTurma && (
        <NovaTurma
          onClose={() => setNovaTurma(false)}
          onCreated={(nomeTurma) => {
            setNovaTurma(false)
            notify('success', 'Turma criada', nomeTurma)
            addLog(`Turma criada: ${nomeTurma}`)
            reload()
          }}
        />
      )}
    </>
  )
}

function NovaTurma({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: (nome: string) => void
}) {
  const { notify } = useApp()
  const [nome, setNome] = useState('')
  const [ano, setAno] = useState(String(new Date().getFullYear()))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const submit = async (ev: FormEvent) => {
    ev.preventDefault()
    setErrors({})
    setSaving(true)
    try {
      await api.criarTurma({ nome: nome.trim(), anoLetivo: Number(ano) })
      onCreated(nome.trim())
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fields)
        notify('error', 'Não foi possível criar a turma', err.message)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="Nova turma" onClose={onClose}>
      <form className="form" onSubmit={submit} noValidate>
        <TextField
          label="Nome da turma"
          placeholder="Ex.: 9º Ano A"
          value={nome}
          error={errors.nome}
          onChange={(e) => setNome(e.target.value)}
          autoFocus
        />
        <TextField
          label="Ano letivo"
          inputMode="numeric"
          value={ano}
          error={errors.anoLetivo}
          onChange={(e) => setAno(e.target.value)}
        />
        <div className="modal-actions">
          <Button onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" loading={saving}>
            Criar turma
          </Button>
        </div>
      </form>
    </Modal>
  )
}