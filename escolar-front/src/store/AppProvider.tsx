import { useCallback, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  alunosIniciais,
  atividadesIniciais,
  disciplinas,
  lancamentosIniciais,
  turmas,
  USUARIO,
} from '../data/mock'
import type {
  Aluno,
  Atividade,
  EventoHistorico,
  Lancamento,
  ToastMsg,
} from '../types'
import { AppContext } from './context'
import type { AppContextValue, Decisao, LancamentoDraft } from './context'

const wait = (ms = 650) => new Promise<void>((r) => setTimeout(r, ms))
let seq = 1000
const uid = (p: string) => `${p}${++seq}`

function evento(
  acao: EventoHistorico['acao'],
  comentario?: string,
): EventoHistorico {
  return {
    id: uid('e'),
    acao,
    autor: USUARIO.nome,
    data: new Date().toISOString(),
    comentario,
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [alunos, setAlunos] = useState<Aluno[]>(alunosIniciais)
  const [atividades, setAtividades] = useState<Atividade[]>(atividadesIniciais)
  const [lancamentos, setLancamentos] =
    useState<Lancamento[]>(lancamentosIniciais)
  const [toasts, setToasts] = useState<ToastMsg[]>([])
  const toastId = useRef(0)

  const dismissToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const notify = useCallback<AppContextValue['notify']>(
    (kind, title, text) => {
      const id = ++toastId.current
      setToasts((t) => [...t, { id, kind, title, text }])
      setTimeout(() => dismissToast(id), 5000)
    },
    [dismissToast],
  )

  const saveAluno = useCallback<AppContextValue['saveAluno']>(async (data) => {
    await wait()
    const saved: Aluno = { ...data, id: data.id ?? uid('a') }
    setAlunos((list) =>
      data.id
        ? list.map((a) => (a.id === data.id ? saved : a))
        : [saved, ...list],
    )
    return saved
  }, [])

  const saveAtividade = useCallback<AppContextValue['saveAtividade']>(
    async (data) => {
      await wait()
      const saved: Atividade = { ...data, id: data.id ?? uid('at') }
      setAtividades((list) =>
        data.id
          ? list.map((a) => (a.id === data.id ? saved : a))
          : [saved, ...list],
      )
      return saved
    },
    [],
  )

  const saveLancamento = useCallback<AppContextValue['saveLancamento']>(
    async (draft: LancamentoDraft, submit) => {
      const existing = draft.id
        ? lancamentos.find((l) => l.id === draft.id)
        : undefined
      const now = new Date().toISOString()
      const historico = existing ? [...existing.historico] : [evento('criado')]
      if (submit) historico.push(evento('enviado'))
      const result: Lancamento = {
        id: existing?.id ?? uid('l'),
        tipo: draft.tipo,
        turmaId: draft.turmaId,
        disciplinaId: draft.disciplinaId,
        atividadeId: draft.atividadeId,
        periodoInicio: draft.periodoInicio,
        periodoFim: draft.periodoFim,
        aulasNoPeriodo: draft.aulasNoPeriodo,
        itens: draft.itens,
        responsavel: existing?.responsavel ?? USUARIO.nome,
        status: submit ? 'pendente' : (existing?.status ?? 'rascunho'),
        enviadoEm: submit ? now : existing?.enviadoEm,
        atualizadoEm: now,
        historico,
      }
      await wait(750)
      setLancamentos((list) =>
        list.some((l) => l.id === result.id)
          ? list.map((l) => (l.id === result.id ? result : l))
          : [result, ...list],
      )
      return result
    },
    [lancamentos],
  )

  const decidir = useCallback<AppContextValue['decidir']>(
    async (id: string, decisao: Decisao, comentario?: string) => {
      await wait(600)
      setLancamentos((list) =>
        list.map((l) =>
          l.id === id
            ? {
                ...l,
                status: decisao,
                atualizadoEm: new Date().toISOString(),
                historico: [...l.historico, evento(decisao, comentario)],
              }
            : l,
        ),
      )
    },
    [],
  )

  const value = useMemo<AppContextValue>(
    () => ({
      turmas,
      disciplinas,
      alunos,
      atividades,
      lancamentos,
      toasts,
      notify,
      dismissToast,
      saveAluno,
      saveAtividade,
      saveLancamento,
      decidir,
    }),
    [
      alunos,
      atividades,
      lancamentos,
      toasts,
      notify,
      dismissToast,
      saveAluno,
      saveAtividade,
      saveLancamento,
      decidir,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
