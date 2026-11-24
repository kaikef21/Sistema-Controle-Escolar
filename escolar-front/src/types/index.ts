/** Formatos devolvidos pela API alunoapp (JSON em camelCase). */
export interface Turma {
  turmaId: string
  nome: string
  anoLetivo: number
}

export interface Aluno {
  alunoId: string
  nome: string
  matricula: string | null
  turmaId: string
}

export interface Atividade {
  atividadeId: string
  titulo: string
  tipo: string | null
  turmaId: string
  notaMaxima: number | null
  dataRealizacao: string
}

export interface Nota {
  notaId: string
  alunoId: string
  atividadeId: string
  valorNota: number
}

export interface Frequencia {
  frequenciaId: string
  alunoId: string
  dataAula: string
  presente: boolean
}

export const TIPOS_ATIVIDADE = ['Prova', 'Trabalho', 'Atividade Prática'] as const

export interface ToastMsg {
  id: number
  kind: 'success' | 'error' | 'info'
  title: string
  text?: string
}

export interface LogEntry {
  id: number
  at: string
  text: string
}
