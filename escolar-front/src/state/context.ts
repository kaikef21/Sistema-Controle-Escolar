import { createContext } from 'react'
import type {
  Aluno,
  Atividade,
  Frequencia,
  LogEntry,
  Nota,
  ToastMsg,
  Turma,
} from '../types'

export interface AppContextValue {
  status: 'loading' | 'ready' | 'error'
  error: string | null
  /** A API não devolveu os ids (por exemplo, por causa de [JsonIgnore] nos models). */
  idsMissing: boolean
  turmas: Turma[]
  alunos: Aluno[]
  atividades: Atividade[]
  notas: Nota[]
  frequencias: Frequencia[]
  reload: () => void
  toasts: ToastMsg[]
  notify: (kind: ToastMsg['kind'], title: string, text?: string) => void
  dismissToast: (id: number) => void
  log: LogEntry[]
  addLog: (text: string) => void
}

export const AppContext = createContext<AppContextValue | null>(null)
