import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, ClipboardCheck, Lock, Save, X } from 'lucide-react'
import { api, ApiError } from '../api/client'
import { Avatar, Button, EmptyState, SelectField, TextField } from '../components/ui'
import { useApp } from '../state/useApp'
import type { Aluno, Atividade } from '../types'
import {
  LIMITE_FALTAS,
  dayKey,
  formatDate,
  formatNum,
  parseNumber,
} from '../utils/format'

export function Lancamentos() {
  const { atividades, turmas, alunos } = useApp()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const [atividadeId, setAtividadeId] = useState(params.get('atividade') ?? '')
  const [dataManual, setDataManual] = useState<string | null>(null)

  const atividade = atividadeId
    ? atividades.find((a) => a.atividadeId === atividadeId)
    : undefined

  const data = dataManual ?? (atividade ? dayKey(atividade.dataRealizacao) : '')
  const turmaNome = (id: string) => turmas.find((t) => t.turmaId === id)?.nome ?? ''

  const alunosDaTurma = useMemo(
    () =>
      atividade
        ? alunos
            .filter((a) => a.turmaId === atividade.turmaId)
            .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
        : [],
    [alunos, atividade],
  )

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Lançamento de notas e faltas</h1>
          <p>Registre a presença da aula e as notas obtidas na atividade escolhida.</p>
          <Button variant="primary" icon={<ArrowLeft size={17} />} onClick={() => navigate('/atividades')}>
            Etapa anterior: Atividades
          </Button>
        </div>
        <Button variant="primary" icon={<ArrowRight size={17} />} onClick={() => navigate('/status')}>
          Ver status de aprovação
        </Button>
      </div>

      <section className="card">
        <div className="pick">
          <SelectField
            label="Atividade"
            value={atividadeId}
            placeholder={atividades.length ? 'Selecione a atividade' : 'Nenhuma atividade cadastrada'}
            options={atividades.map((a) => ({
              value: a.atividadeId,
              label: `${a.titulo} — ${turmaNome(a.turmaId)}`,
            }))}
            onChange={(e) => {
              setAtividadeId(e.target.value)
              setDataManual(null)
            }}
          />
          <TextField
            label="Data da aula"
            type="date"
            value={data}
            disabled={!atividade}
            onChange={(e) => setDataManual(e.target.value)}
          />
        </div>

        {!atividade ? (
          <EmptyState
            icon={<ClipboardCheck size={32} />}
            title="Escolha uma atividade"
            text="Os alunos da turma aparecem aqui para marcar presença e lançar as notas."
          />
        ) : alunosDaTurma.length === 0 ? (
          <EmptyState
            icon={<ClipboardCheck size={32} />}
            title="Esta turma ainda não tem alunos"
            text="Volte à etapa Alunos e cadastre os estudantes da turma."
          />
        ) : !data ? (
          <EmptyState
            icon={<ClipboardCheck size={32} />}
            title="Informe a data da aula"
            text="A presença é registrada por data."
          />
        ) : (
          <Grid key={`${atividade.atividadeId}|${data}`} atividade={atividade} alunos={alunosDaTurma} data={data} />
        )}
      </section>
    </>
  )
}

interface FalhaEnvio {
  label: string
  motivo: string
  payload: string
}

function Grid({
  atividade,
  alunos,
  data,
}: {
  atividade: Atividade
  alunos: Aluno[]
  data: string
}) {
  const { notas, frequencias, reload, notify, addLog } = useApp()
  const max = atividade.notaMaxima ?? 10

  const jaFreq = (alunoId: string) =>
    frequencias.find((f) => f.alunoId === alunoId && dayKey(f.dataAula) === data)
  const jaNota = (alunoId: string) =>
    notas.find((n) => n.alunoId === alunoId && n.atividadeId === atividade.atividadeId)

  const [presente, setPresente] = useState<Record<string, boolean>>({})
  const [valores, setValores] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [falhas, setFalhas] = useState<FalhaEnvio[]>([])

  const estaPresente = (id: string) => {
    const f = jaFreq(id)
    return f ? f.presente : (presente[id] ?? true)
  }

  const faltasAcumuladas = (id: string) => {
    const reg = frequencias.filter((f) => f.alunoId === id)
    const novo = jaFreq(id) ? 0 : 1
    const faltas = reg.filter((f) => !f.presente).length + (novo && !estaPresente(id) ? 1 : 0)
    const total = reg.length + novo
    return { faltas, perc: total ? (faltas / total) * 100 : 0 }
  }

  const notaDigitada = (id: string) => {
    const n = parseNumber(valores[id] ?? '')
    return n !== null && !Number.isNaN(n) ? n : null
  }
  const novasFreq = alunos.filter((a) => !jaFreq(a.alunoId))
  const novasNotas = alunos.filter((a) => !jaNota(a.alunoId) && notaDigitada(a.alunoId) !== null)
  const presentes = alunos.filter((a) => estaPresente(a.alunoId)).length

  const alunosOrdenados = useMemo(() => {
    const pendentes: Aluno[] = []
    const bloqueados: Aluno[] = []
    for (const a of alunos) {
      if (jaFreq(a.alunoId) && jaNota(a.alunoId)) {
        bloqueados.push(a)
      } else {
        pendentes.push(a)
      }
    }
    return [...bloqueados, ...pendentes]
  }, [alunos, frequencias, notas, data, atividade.atividadeId])

  const salvar = async () => {
    if (novasFreq.length === 0 && novasNotas.length === 0) {
      notify('info', 'Nada novo para salvar', 'Estes lançamentos já foram registrados.')
      return
    }
    setSaving(true)
    setFalhas([])

    const jobs: { label: string; payload: unknown; run: () => Promise<unknown> }[] = [
      ...novasFreq.map((a) => {
        const payload = {
          alunoId: a.alunoId,
          dataAula: `${data}T00:00:00`,
          presente: estaPresente(a.alunoId),
        }
        return { label: `presença de ${a.nome}`, payload, run: () => api.criarFrequencia(payload) }
      }),
      ...novasNotas.map((a) => {
        const payload = {
          alunoId: a.alunoId,
          atividadeId: atividade.atividadeId,
          valorNota: notaDigitada(a.alunoId) as number,
        }
        return { label: `nota de ${a.nome}`, payload, run: () => api.criarNota(payload) }
      }),
    ]

    const erros: FalhaEnvio[] = []
    let ok = 0
    for (const j of jobs) {
      try {
        await j.run()
        ok++
      } catch (err) {
        console.error(`Falha ao enviar ${j.label}`, j.payload, err)
        const motivo =
          err instanceof ApiError
            ? `${err.status || 'sem resposta'}: ${err.message}`
            : err instanceof Error
              ? err.message
              : 'erro desconhecido'
        erros.push({ label: j.label, motivo: motivo.slice(0, 400), payload: JSON.stringify(j.payload) })
      }
    }
    setSaving(false)
    setFalhas(erros)

    if (ok > 0)
      addLog(
        `Lançamento em ${atividade.titulo}: ${novasFreq.length} presenças e ${novasNotas.length} notas enviadas`,
      )
    reload()
  }

  return (
    <>
      <div className="launch-row launch-head">
        <span>Aluno</span>
        <span>Presença</span>
        <span>Faltas acumuladas</span>
        <span>Nota (máx. {formatNum(max)})</span>
      </div>

      {alunosOrdenados.map((a) => {
        const f = jaFreq(a.alunoId)
        const n = jaNota(a.alunoId)
        const acc = faltasAcumuladas(a.alunoId)
        const on = estaPresente(a.alunoId)
        return (
          <div className="launch-row" key={a.alunoId || a.matricula}>
            <div className="person">
              <Avatar nome={a.nome} />
              <div>
                <div className="main-cell">{a.nome}</div>
                <div className="sub-cell mono">{a.matricula}</div>
              </div>
            </div>

            <div className="pf" role="group" aria-label={`Presença de ${a.nome}`}>
              <button
                type="button"
                className={on ? 'on-p' : ''}
                disabled={!!f}
                aria-pressed={on}
                onClick={() => setPresente((p) => ({ ...p, [a.alunoId]: true }))}
              >
                {on && <Check size={15} />} Presente
              </button>
              <button
                type="button"
                className={!on ? 'on-f' : ''}
                disabled={!!f}
                aria-pressed={!on}
                onClick={() => setPresente((p) => ({ ...p, [a.alunoId]: false }))}
              >
                {!on && <X size={15} />} Falta
              </button>
            </div>

            <span
              className={`chip ${acc.perc > LIMITE_FALTAS ? 'alert' : ''}`}
              title={acc.perc > LIMITE_FALTAS ? `Acima do limite de ${LIMITE_FALTAS}%` : undefined}
            >
              {acc.faltas} {acc.faltas === 1 ? 'falta' : 'faltas'} ({Math.round(acc.perc)}%)
            </span>

            <div className="grade-cell">
              {n ? (
                <>
                  <input className="input" value={formatNum(n.valorNota)} disabled aria-label={`Nota de ${a.nome}`} />
                  <Lock size={14} color="var(--slate-400)" aria-label="Já lançada" />
                </>
              ) : (
                <>
                  <input
                    className="input"
                    inputMode="decimal"
                    placeholder="—"
                    aria-label={`Nota de ${a.nome}`}
                    value={valores[a.alunoId] ?? ''}
                    onChange={(e) => setValores((v) => ({ ...v, [a.alunoId]: e.target.value }))}
                  />
                  <span>/ {formatNum(max)}</span>
                </>
              )}
            </div>
          </div>
        )
      })}

      {falhas.length > 0 && (
        <div className="banner banner-error" role="alert" style={{ margin: 16 }}>
          <div>
            <strong>O que a respondeu</strong>
            {falhas.map((f, i) => (
              <div key={i} style={{ marginTop: 8 }}>
                <div>
                  <b>{f.label}</b>: {f.motivo}
                </div>
                <code style={{ fontSize: 12, wordBreak: 'break-all' }}>Enviado: {f.payload}</code>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="launch-foot">
        <div className="counts">
          <span>
            <i style={{ background: 'var(--green-500)' }} />
            Presentes: <strong>{presentes}</strong>
          </span>
          <span>
            <i style={{ background: 'var(--rose-500)' }} />
            Faltas: <strong>{alunos.length - presentes}</strong>
          </span>
          <span className="sub-cell">Aula de {formatDate(data)}</span>
        </div>
        <Button variant="success" icon={<Save size={17} />} loading={saving} onClick={salvar}>
          Salvar lançamento
        </Button>
      </div>
      {(alunos.some((a) => jaFreq(a.alunoId)) || alunos.some((a) => jaNota(a.alunoId))) && (
        <p className="list-foot">
          Registros já enviados ficam bloqueados.
        </p>
      )}
    </>
  )
}