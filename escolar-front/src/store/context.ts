import { createContext } from 'react'
import type {
  Aluno,
  Atividade,
  Disciplina,
  Lancamento,
  LancamentoItem,
  TipoLancamento,
  ToastMsg,
  Turma,
} from '../types'

export interface LancamentoDraft {
  id?: string
  tipo: TipoLancamento
  turmaId: string
  disciplinaId: string
  atividadeId?: string
  periodoInicio?: string
  periodoFim?: string
  aulasNoPeriodo?: number
  itens: LancamentoItem[]
}

export type Decisao = 'aprovado' | 'rejeitado' | 'correcao'

export interface AppContextValue {
  turmas: Turma[]
  disciplinas: Disciplina[]
  alunos: Aluno[]
  atividades: Atividade[]
  lancamentos: Lancamento[]
  toasts: ToastMsg[]
  notify: (kind: ToastMsg['kind'], title: string, text?: string) => void
  dismissToast: (id: number) => void
  saveAluno: (a: Omit<Aluno, 'id'> & { id?: string }) => Promise<Aluno>
  saveAtividade: (
    a: Omit<Atividade, 'id'> & { id?: string },
  ) => Promise<Atividade>
  saveLancamento: (
    draft: LancamentoDraft,
    submit: boolean,
  ) => Promise<Lancamento>
  decidir: (id: string, decisao: Decisao, comentario?: string) => Promise<void>
}

export const AppContext = createContext<AppContextValue | null>(null)
