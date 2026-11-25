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

export interface UsuarioApi {
  usuarioId?: string
  UsuarioId?: string
  id?: string
  nome?: string
  Nome?: string
  username?: string
  Username?: string
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

type TurmaRaw = Turma & { id?: string; TurmaId?: string; Nome?: string; AnoLetivo?: number }
type AlunoRaw = Aluno & {
  id?: string
  AlunoId?: string
  TurmaId?: string
  Nome?: string
  Matricula?: string
  Status?: string
}
type AtividadeRaw = Atividade & {
  id?: string
  AtividadeId?: string
  TurmaId?: string
  Titulo?: string
  Tipo?: string
  NotaMaxima?: number
  DataRealizacao?: string
}
type NotaRaw = Nota & {
  id?: string
  NotaId?: string
  AlunoId?: string
  AtividadeId?: string
  ValorNota?: number
}
type FrequenciaRaw = Frequencia & {
  id?: string
  FrequenciaId?: string
  AlunoId?: string
  DataAula?: string
  Presente?: boolean
}

export const api = {
  obterUsuarios: async (): Promise<Array<{ nome: string; username: string }>> => {
    const lista = await get<UsuarioApi[]>('v1/usuario')
    return lista.map((u) => ({
      nome: u.nome ?? u.Nome ?? '',
      username: u.username ?? u.Username ?? '',
    }))
  },
  turmas: async (): Promise<Turma[]> => {
    const lista = await get<TurmaRaw[]>('v1/turma/')
    return lista.map((t) => ({
      ...t,
      turmaId: t.turmaId ?? t.TurmaId ?? t.id ?? '',
      nome: t.nome ?? t.Nome ?? '',
      anoLetivo: t.anoLetivo ?? t.AnoLetivo ?? new Date().getFullYear(),
    }))
  },
  alunos: async (): Promise<Aluno[]> => {
    const lista = await get<AlunoRaw[]>('v1/aluno/')
    return lista.map((a) => ({
      ...a,
      alunoId: a.alunoId ?? a.AlunoId ?? a.id ?? '',
      nome: a.nome ?? a.Nome ?? '',
      matricula: a.matricula ?? a.Matricula ?? '',
      status: a.status ?? a.Status ?? '',
      turmaId: a.turmaId ?? a.TurmaId ?? '',
    }))
  },
  atividades: async (): Promise<Atividade[]> => {
    const lista = await get<AtividadeRaw[]>('v1/atividade/')
    return lista.map((a) => ({
      ...a,
      atividadeId: a.atividadeId ?? a.AtividadeId ?? a.id ?? '',
      titulo: a.titulo ?? a.Titulo ?? '',
      tipo: a.tipo ?? a.Tipo ?? '',
      turmaId: a.turmaId ?? a.TurmaId ?? '',
      notaMaxima: a.notaMaxima ?? a.NotaMaxima ?? 10,
      dataRealizacao: a.dataRealizacao ?? a.DataRealizacao ?? '',
    }))
  },
  notas: async (): Promise<Nota[]> => {
    const lista = await get<NotaRaw[]>('v1/nota/')
    return lista.map((n) => ({
      ...n,
      notaId: n.notaId ?? n.NotaId ?? n.id ?? '',
      alunoId: n.alunoId ?? n.AlunoId ?? '',
      atividadeId: n.atividadeId ?? n.AtividadeId ?? '',
      valorNota: n.valorNota ?? n.ValorNota ?? 0,
    }))
  },
  frequencias: async (): Promise<Frequencia[]> => {
    const lista = await get<FrequenciaRaw[]>('v1/frequencia/')
    return lista.map((f) => ({
      ...f,
      frequenciaId: f.frequenciaId ?? f.FrequenciaId ?? f.id ?? '',
      alunoId: f.alunoId ?? f.AlunoId ?? '',
      dataAula: f.dataAula ?? f.DataAula ?? '',
      presente: f.presente ?? f.Presente ?? true,
    }))
  },
  criarUsuario: (u: {
    nome: string
    username: string
    senha: string
    confirmarSenha: string
  }) => post<unknown>('v1/usuario', u),

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