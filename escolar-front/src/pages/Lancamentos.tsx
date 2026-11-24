import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Check, ClipboardCheck, Lock, Save, X } from 'lucide-react'
import { api } from '../api/client'
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

  const atividade = atividades.find((a) => a.atividadeId === atividadeId)
  // Se a pessoa não escolheu outra data, usa a data de realização da atividade.
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
        </div>
        <Button variant="dark" icon={<ArrowRight size={17} />} onClick={() => navigate('/status')}>
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
              const id = e.target.value
              setAtividadeId(id)
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

  const estaPresente = (id: string) => {
    const f = jaFreq(id)
    return f ? f.presente : (presente[id] ?? true)
  }

  const erroNota = (id: string): string | null => {
    const n = parseNumber(valores[id] ?? '')
    if (n === null) return null
    if (Number.isNaN(n)) return 'Use apenas números.'
    if (n < 0) return 'A nota não pode ser negativa.'
    if (n > max) return `A nota máxima é ${formatNum(max)}.`
    return null
  }

  const faltasAcumuladas = (id: string) => {
    const reg = frequencias.filter((f) => f.alunoId === id)
    const novo = jaFreq(id) ? 0 : 1
    const faltas = reg.filter((f) => !f.presente).length + (novo && !estaPresente(id) ? 1 : 0)
    const total = reg.length + novo
    return { faltas, perc: total ? (faltas / total) * 100 : 0 }
  }

  const novasFreq = alunos.filter((a) => !jaFreq(a.alunoId))
  const novasNotas = alunos.filter(
    (a) => !jaNota(a.alunoId) && parseNumber(valores[a.alunoId] ?? '') !== null,
  )
  const comErro = alunos.filter((a) => erroNota(a.alunoId)).length
  const presentes = alunos.filter((a) => estaPresente(a.alunoId)).length
  const nada = novasFreq.length === 0 && novasNotas.length === 0

  const salvar = async () => {
    if (comErro > 0) {
      notify('error', 'Há notas inválidas', 'Corrija os campos destacados antes de salvar.')
      return
    }
    if (nada) {
      notify('info', 'Nada novo para salvar', 'Estes lançamentos já foram registrados.')
      return
    }
    setSaving(true)
    const jobs: { label: string; run: () => Promise<unknown> }[] = [
      ...novasFreq.map((a) => ({
        label: `presença de ${a.nome}`,
        run: () =>
          api.criarFrequencia({
            alunoId: a.alunoId,
            dataAula: data,
            presente: estaPresente(a.alunoId),
          }),
      })),
      ...novasNotas.map((a) => ({
        label: `nota de ${a.nome}`,
        run: () =>
          api.criarNota({
            alunoId: a.alunoId,
            atividadeId: atividade.atividadeId,
            valorNota: parseNumber(valores[a.alunoId] ?? '') as number,
          }),
      })),
    ]
    const results = await Promise.allSettled(jobs.map((j) => j.run()))
    const falhas = results.filter((r) => r.status === 'rejected').length
    const ok = results.length - falhas
    setSaving(false)

    if (ok > 0)
      addLog(
        `Lançamento em ${atividade.titulo}: ${novasFreq.length} presenças e ${novasNotas.length} notas enviadas`,
      )
    if (falhas === 0) {
      notify('success', 'Lançamento salvo', `${ok} registros enviados para a API.`)
    } else {
      const primeira = results.find((r): r is PromiseRejectedResult => r.status === 'rejected')
      notify(
        'error',
        `${falhas} de ${results.length} registros falharam`,
        primeira?.reason instanceof Error ? primeira.reason.message : undefined,
      )
    }
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

      {alunos.map((a) => {
        const f = jaFreq(a.alunoId)
        const n = jaNota(a.alunoId)
        const acc = faltasAcumuladas(a.alunoId)
        const err = erroNota(a.alunoId)
        const on = estaPresente(a.alunoId)
        return (
          <div className="launch-row" key={a.alunoId}>
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

            <div className={`grade-cell ${err ? 'has-error' : ''}`}>
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
                    aria-invalid={!!err || undefined}
                    value={valores[a.alunoId] ?? ''}
                    onChange={(e) => setValores((v) => ({ ...v, [a.alunoId]: e.target.value }))}
                  />
                  <span>/ {formatNum(max)}</span>
                </>
              )}
            </div>
            {err && <div className="err-text">{err}</div>}
          </div>
        )
      })}

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
          Registros já enviados ficam bloqueados: a API ainda não permite alterar uma nota ou presença depois de salva.
        </p>
      )}
    </>
  )
}
