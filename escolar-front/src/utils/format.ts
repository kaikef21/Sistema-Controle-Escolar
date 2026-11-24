import type { Aluno, Atividade, Frequencia, Nota } from '../types'

/** "2026-04-10" ou "2026-04-10T00:00:00" -> "10/04/2026" */
export function formatDate(iso?: string | null): string {
  if (!iso) return '—'
  const [y, m, d] = iso.slice(0, 10).split('-')
  return y && m && d ? `${d}/${m}/${y}` : '—'
}

export function dayKey(iso: string): string {
  return iso.slice(0, 10)
}

export function todayISO(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function formatNum(n: number | null | undefined, digits = 1): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—'
  return n.toLocaleString('pt-BR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: 2,
  })
}

export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

export function parseNumber(s: string): number | null {
  const t = s.trim().replace(',', '.')
  if (t === '') return null
  const n = Number(t)
  return Number.isNaN(n) ? NaN : n
}

export const LIMITE_FALTAS = 25

export type Situacao =
  | 'Aprovado'
  | 'Recuperação'
  | 'Reprovado por nota'
  | 'Reprovado por falta'
  | 'Sem notas'

export interface Boletim {
  aluno: Aluno
  media: number | null
  notasLancadas: number
  faltas: number
  aulas: number
  percFaltas: number
  situacao: Situacao
}

/** Média em escala 0–10, considerando a nota máxima de cada atividade. */
export function calcularBoletim(
  aluno: Aluno,
  notas: Nota[],
  atividades: Atividade[],
  frequencias: Frequencia[],
): Boletim {
  const minhas = notas.filter((n) => n.alunoId === aluno.alunoId)
  const escala = minhas
    .map((n) => {
      const max = atividades.find((a) => a.atividadeId === n.atividadeId)?.notaMaxima ?? 10
      return max > 0 ? (n.valorNota / max) * 10 : null
    })
    .filter((v): v is number => v !== null)
  const media = escala.length ? escala.reduce((s, v) => s + v, 0) / escala.length : null

  const freq = frequencias.filter((f) => f.alunoId === aluno.alunoId)
  const faltas = freq.filter((f) => !f.presente).length
  const percFaltas = freq.length ? (faltas / freq.length) * 100 : 0

  let situacao: Situacao
  if (percFaltas > LIMITE_FALTAS) situacao = 'Reprovado por falta'
  else if (media === null) situacao = 'Sem notas'
  else if (media >= 6) situacao = 'Aprovado'
  else if (media >= 4) situacao = 'Recuperação'
  else situacao = 'Reprovado por nota'

  return {
    aluno,
    media,
    notasLancadas: minhas.length,
    faltas,
    aulas: freq.length,
    percFaltas,
    situacao,
  }
}

/** Cor do selo de cada situação (usada no Status geral e na lista de alunos). */
export const TOM_SITUACAO: Record<Situacao, 'green' | 'amber' | 'rose' | 'slate'> = {
  Aprovado: 'green',
  Recuperação: 'amber',
  'Reprovado por nota': 'rose',
  'Reprovado por falta': 'rose',
  'Sem notas': 'slate',
}
