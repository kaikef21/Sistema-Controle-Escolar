export type Situacao = 'Ativo' | 'Trancado' | 'Inativo' | 'Formado'
export type TipoAtividade = 'Prova' | 'Trabalho' | 'Atividade Prática'

export interface Turma {
  id: string
  nome: string
  anoLetivo: number
  curso: string
}

export interface Disciplina {
  id: string
  nome: string
}

export interface Aluno {
  id: string
  nome: string
  matricula: string
  turmaId: string
  curso: string
  situacao: Situacao
  email: string
  /** Período de ingresso, por exemplo 2026.1 */
  periodo: string
}

export interface Atividade {
  id: string
  titulo: string
  descricao: string
  tipo: TipoAtividade
  disciplinaId: string
  turmaId: string
  dataAplicacao: string
  notaMaxima: number
  prazoLancamento: string
}

export type StatusLancamento =
  | 'rascunho'
  | 'pendente'
  | 'aprovado'
  | 'rejeitado'
  | 'correcao'

export type TipoLancamento = 'nota' | 'falta'

export interface LancamentoItem {
  alunoId: string
  /** Nota lançada (tipo "nota") */
  nota: number | null
  /** Quantidade de faltas no período (tipo "falta") */
  faltas: number
}

export type AcaoHistorico =
  | 'criado'
  | 'enviado'
  | 'aprovado'
  | 'rejeitado'
  | 'correcao'

export interface EventoHistorico {
  id: string
  acao: AcaoHistorico
  autor: string
  data: string
  comentario?: string
}

export interface Lancamento {
  id: string
  tipo: TipoLancamento
  turmaId: string
  disciplinaId: string
  atividadeId?: string
  /** Período de faltas */
  periodoInicio?: string
  periodoFim?: string
  aulasNoPeriodo?: number
  responsavel: string
  status: StatusLancamento
  enviadoEm?: string
  atualizadoEm: string
  itens: LancamentoItem[]
  historico: EventoHistorico[]
}

export interface ToastMsg {
  id: number
  kind: 'success' | 'error' | 'info'
  title: string
  text?: string
}
