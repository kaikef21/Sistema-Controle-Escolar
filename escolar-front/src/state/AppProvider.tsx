import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { api, ApiError } from '../api/client'
import type {
  Aluno,
  Atividade,
  Frequencia,
  LogEntry,
  Nota,
  ToastMsg,
  Turma,
} from '../types'
import { AppContext } from './context'
import type { AppContextValue } from './context'

interface Data {
  turmas: Turma[]
  alunos: Aluno[]
  atividades: Atividade[]
  notas: Nota[]
  frequencias: Frequencia[]
}

const EMPTY: Data = {
  turmas: [],
  alunos: [],
  atividades: [],
  notas: [],
  frequencias: [],
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>(EMPTY)
  const [status, setStatus] = useState<AppContextValue['status']>('loading')
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  const [toasts, setToasts] = useState<ToastMsg[]>([])
  const [log, setLog] = useState<LogEntry[]>([])
  const seq = useRef(0)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      api.turmas(),
      api.alunos(),
      api.atividades(),
      api.notas(),
      api.frequencias(),
    ])
      .then(([turmas, alunos, atividades, notas, frequencias]) => {
        if (cancelled) return
        setData({ turmas, alunos, atividades, notas, frequencias })
        setError(null)
        setStatus('ready')
      })
      .catch((e: unknown) => {
        if (cancelled) return
        setError(
          e instanceof ApiError ? e.message : 'Erro inesperado ao carregar os dados.',
        )
        setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [tick])

  const reload = useCallback(() => {
    setStatus('loading')
    setTick((t) => t + 1)
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const notify = useCallback<AppContextValue['notify']>(
    (kind, title, text) => {
      const id = ++seq.current
      setToasts((t) => [...t, { id, kind, title, text }])
      setTimeout(() => dismissToast(id), 5500)
    },
    [dismissToast],
  )

  const addLog = useCallback((text: string) => {
    setLog((l) =>
      [{ id: ++seq.current, at: new Date().toISOString(), text }, ...l].slice(0, 30),
    )
  }, [])

  const idsMissing =
    (data.alunos.length > 0 && !data.alunos[0].alunoId) ||
    (data.turmas.length > 0 && !data.turmas[0].turmaId) ||
    (data.atividades.length > 0 && !data.atividades[0].atividadeId)

  const value = useMemo<AppContextValue>(
    () => ({
      status,
      error,
      idsMissing,
      ...data,
      reload,
      toasts,
      notify,
      dismissToast,
      log,
      addLog,
    }),
    [status, error, idsMissing, data, reload, toasts, notify, dismissToast, log, addLog],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
