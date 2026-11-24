import type {
  Aluno,
  Atividade,
  Frequencia,
  Nota,
  Turma,
} from '../types'

export const API_URL: string =
  import.meta.env.VITE_API_URL ?? 'http://localhost:5018'

/** Erro devolvido pela API, já com as mensagens de validação por campo. */
export class ApiError extends Error {
  status: number
  fields: Record<string, string>

  constructor(message: string, status: number, fields: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fields = fields
  }
}

interface ValidationItem {
  field?: string
  error?: string
  Field?: string
  Error?: string
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_URL}/${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    })
  } catch {
    throw new ApiError(
      `Não foi possível conectar à API em ${API_URL}. Confira se o alunoapp está rodando.`,
      0,
    )
  }

  if (!res.ok) {
    const text = await res.text()
    let fields: Record<string, string> = {}
    let message = text || `Erro ${res.status} ao falar com a API.`
    try {
      const body: unknown = JSON.parse(text)
      if (Array.isArray(body)) {
        fields = {}
        for (const item of body as ValidationItem[]) {
          const f = item.field ?? item.Field
          const e = item.error ?? item.Error
          if (f && e) fields[f.charAt(0).toLowerCase() + f.slice(1)] = e
        }
        message = Object.values(fields).join(' ') || message
      }
    } catch {
      /* resposta em texto simples */
    }
    throw new ApiError(message, res.status, fields)
  }

  return (await res.json()) as T
}

const get = <T>(path: string) => request<T>(path)
const post = <T>(path: string, body: unknown) =>
  request<T>(path, { method: 'POST', body: JSON.stringify(body) })

export const api = {
  turmas: () => get<Turma[]>('v1/turma/'),
  alunos: () => get<Aluno[]>('v1/aluno/'),
  atividades: () => get<Atividade[]>('v1/atividade/'),
  notas: () => get<Nota[]>('v1/nota/'),
  frequencias: () => get<Frequencia[]>('v1/frequencia/'),

  criarTurma: (t: { nome: string; anoLetivo: number }) => post<unknown>('v1/turma/', t),
  criarAluno: (a: { nome: string; matricula: string; turmaId: string }) =>
    post<unknown>('v1/aluno/', a),
  criarAtividade: (a: {
    titulo: string
    tipo: string
    turmaId: string
    notaMaxima: number
    dataRealizacao: string
  }) => post<unknown>('v1/atividade/', a),
  criarNota: (n: { alunoId: string; atividadeId: string; valorNota: number }) =>
    post<unknown>('v1/nota/', n),
  criarFrequencia: (f: { alunoId: string; dataAula: string; presente: boolean }) =>
    post<unknown>('v1/frequencia/', f),
}
