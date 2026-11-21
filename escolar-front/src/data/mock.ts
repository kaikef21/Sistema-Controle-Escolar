import type {
  Aluno,
  Atividade,
  Disciplina,
  EventoHistorico,
  Lancamento,
  LancamentoItem,
  Situacao,
  Turma,
} from '../types'

export const USUARIO = {
  nome: 'Marina Albuquerque',
  perfil: 'Coordenação pedagógica',
}

export const turmas: Turma[] = [
  { id: 't1', nome: '1º Ano A', anoLetivo: 2026, curso: 'Ensino Médio' },
  { id: 't2', nome: '1º Ano B', anoLetivo: 2026, curso: 'Ensino Médio' },
  { id: 't3', nome: '2º Ano A', anoLetivo: 2026, curso: 'Ensino Médio' },
  { id: 't4', nome: '3º Ano A', anoLetivo: 2026, curso: 'Ensino Médio' },
]

export const disciplinas: Disciplina[] = [
  { id: 'd1', nome: 'Matemática' },
  { id: 'd2', nome: 'Língua Portuguesa' },
  { id: 'd3', nome: 'Física' },
  { id: 'd4', nome: 'Química' },
  { id: 'd5', nome: 'Biologia' },
  { id: 'd6', nome: 'História' },
]

export const PERIODOS = ['2023.1', '2024.1', '2025.1', '2026.1']

/** Gerador pseudoaleatório determinístico, para os dados não mudarem a cada recarga. */
function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

const nomes = [
  'Ana Clara',
  'Bruno',
  'Camila',
  'Daniel',
  'Eduarda',
  'Felipe',
  'Gabriela',
  'Henrique',
  'Isabela',
  'João Pedro',
  'Karina',
  'Lucas',
  'Marina',
  'Nicolas',
  'Olívia',
  'Pedro',
  'Rafaela',
  'Samuel',
  'Tainá',
  'Vinícius',
]
const sobrenomes = [
  'Almeida',
  'Barbosa',
  'Carvalho',
  'Duarte',
  'Esteves',
  'Ferreira',
  'Gomes',
  'Henriques',
  'Ibrahim',
  'Junqueira',
  'Lacerda',
  'Moreira',
  'Nogueira',
  'Oliveira',
  'Pacheco',
  'Queiroz',
  'Ribeiro',
  'Siqueira',
  'Teixeira',
  'Vasconcelos',
]

function buildAlunos(): Aluno[] {
  const r = rng(42)
  const out: Aluno[] = []
  let n = 0
  for (const t of turmas) {
    for (let i = 0; i < 10; i++) {
      const nome = `${nomes[(n * 3) % nomes.length]} ${
        sobrenomes[(n * 7 + Math.floor(n / 20) * 5 + 1) % sobrenomes.length]
      }`
      const roll = r()
      const situacao: Situacao =
        roll < 0.85 ? 'Ativo' : roll < 0.93 ? 'Trancado' : 'Inativo'
      const periodo =
        t.id === 't4' ? '2024.1' : t.id === 't3' ? '2025.1' : '2026.1'
      n++
      out.push({
        id: `a${n}`,
        nome,
        matricula: `2026${String(1000 + n)}`,
        turmaId: t.id,
        curso: t.curso,
        situacao,
        email: `${nome
          .toLowerCase()
          .normalize('NFD')
          .replace(/[̀-ͯ]/g, '')
          .replace(/\s+/g, '.')}@escola.edu.br`,
        periodo,
      })
    }
  }
  return out
}

export const alunosIniciais: Aluno[] = buildAlunos()

export const atividadesIniciais: Atividade[] = [
  {
    id: 'at1',
    titulo: 'Prova 1 de Matemática',
    descricao: 'Funções do 1º grau, equações e problemas de proporção.',
    tipo: 'Prova',
    disciplinaId: 'd1',
    turmaId: 't1',
    dataAplicacao: '2026-10-20',
    notaMaxima: 10,
    prazoLancamento: '2026-10-30',
  },
  {
    id: 'at2',
    titulo: 'Redação: crônica do cotidiano',
    descricao: 'Texto de 25 a 30 linhas com revisão em sala.',
    tipo: 'Trabalho',
    disciplinaId: 'd2',
    turmaId: 't1',
    dataAplicacao: '2026-11-03',
    notaMaxima: 10,
    prazoLancamento: '2026-11-13',
  },
  {
    id: 'at3',
    titulo: 'Relatório de laboratório: queda livre',
    descricao: 'Relatório individual com análise dos dados coletados.',
    tipo: 'Atividade Prática',
    disciplinaId: 'd3',
    turmaId: 't3',
    dataAplicacao: '2026-11-05',
    notaMaxima: 5,
    prazoLancamento: '2026-11-17',
  },
  {
    id: 'at4',
    titulo: 'Simulado de Matemática',
    descricao: 'Simulado com 30 questões no formato do vestibular.',
    tipo: 'Prova',
    disciplinaId: 'd1',
    turmaId: 't4',
    dataAplicacao: '2026-10-27',
    notaMaxima: 10,
    prazoLancamento: '2026-11-06',
  },
  {
    id: 'at5',
    titulo: 'Seminário: Era Vargas',
    descricao: 'Apresentação em grupos de quatro alunos.',
    tipo: 'Trabalho',
    disciplinaId: 'd6',
    turmaId: 't2',
    dataAplicacao: '2026-11-04',
    notaMaxima: 10,
    prazoLancamento: '2026-11-11',
  },
  {
    id: 'at6',
    titulo: 'Prova bimestral de Biologia',
    descricao: 'Genética mendeliana e herança ligada ao sexo.',
    tipo: 'Prova',
    disciplinaId: 'd5',
    turmaId: 't3',
    dataAplicacao: '2026-11-10',
    notaMaxima: 10,
    prazoLancamento: '2026-11-24',
  },
  {
    id: 'at7',
    titulo: 'Lista de exercícios: estequiometria',
    descricao: 'Lista com 20 exercícios resolvidos em dupla.',
    tipo: 'Trabalho',
    disciplinaId: 'd4',
    turmaId: 't2',
    dataAplicacao: '2026-11-12',
    notaMaxima: 4,
    prazoLancamento: '2026-11-26',
  },
  {
    id: 'at8',
    titulo: 'Prova de Física: cinemática',
    descricao: 'Movimento uniforme e uniformemente variado.',
    tipo: 'Prova',
    disciplinaId: 'd3',
    turmaId: 't1',
    dataAplicacao: '2026-11-17',
    notaMaxima: 10,
    prazoLancamento: '2026-11-27',
  },
  {
    id: 'at9',
    titulo: 'Análise de texto: Machado de Assis',
    descricao: 'Leitura dirigida e questões dissertativas.',
    tipo: 'Atividade Prática',
    disciplinaId: 'd2',
    turmaId: 't4',
    dataAplicacao: '2026-11-09',
    notaMaxima: 6,
    prazoLancamento: '2026-11-16',
  },
]

function itensDaTurma(
  turmaId: string,
  notaMax: number | null,
  seed: number,
): LancamentoItem[] {
  const r = rng(seed)
  return alunosIniciais
    .filter((a) => a.turmaId === turmaId && a.situacao !== 'Inativo')
    .map((a) => ({
      alunoId: a.id,
      nota:
        notaMax === null
          ? null
          : Math.round((notaMax * (0.45 + r() * 0.55)) * 10) / 10,
      faltas: notaMax === null ? Math.floor(r() * r() * 5) : 0,
    }))
}

let evSeq = 0
function ev(
  acao: EventoHistorico['acao'],
  autor: string,
  data: string,
  comentario?: string,
): EventoHistorico {
  evSeq++
  return { id: `e${evSeq}`, acao, autor, data, comentario }
}

const COORD = USUARIO.nome

export const lancamentosIniciais: Lancamento[] = [
  {
    id: 'l1',
    tipo: 'nota',
    turmaId: 't1',
    disciplinaId: 'd1',
    atividadeId: 'at1',
    responsavel: 'Helena Rocha',
    status: 'aprovado',
    enviadoEm: '2026-10-28T14:20:00',
    atualizadoEm: '2026-10-29T09:05:00',
    itens: itensDaTurma('t1', 10, 11),
    historico: [
      ev('criado', 'Helena Rocha', '2026-10-27T16:40:00'),
      ev('enviado', 'Helena Rocha', '2026-10-28T14:20:00'),
      ev('aprovado', COORD, '2026-10-29T09:05:00'),
    ],
  },
  {
    id: 'l2',
    tipo: 'nota',
    turmaId: 't1',
    disciplinaId: 'd2',
    atividadeId: 'at2',
    responsavel: 'Rogério Tavares',
    status: 'pendente',
    enviadoEm: '2026-11-16T17:42:00',
    atualizadoEm: '2026-11-16T17:42:00',
    itens: itensDaTurma('t1', 10, 22),
    historico: [
      ev('criado', 'Rogério Tavares', '2026-11-15T10:10:00'),
      ev('enviado', 'Rogério Tavares', '2026-11-16T17:42:00'),
    ],
  },
  {
    id: 'l3',
    tipo: 'nota',
    turmaId: 't3',
    disciplinaId: 'd3',
    atividadeId: 'at3',
    responsavel: 'Paulo Mendonça',
    status: 'pendente',
    enviadoEm: '2026-11-17T11:15:00',
    atualizadoEm: '2026-11-17T11:15:00',
    itens: itensDaTurma('t3', 5, 33),
    historico: [
      ev('criado', 'Paulo Mendonça', '2026-11-17T09:30:00'),
      ev('enviado', 'Paulo Mendonça', '2026-11-17T11:15:00'),
    ],
  },
  {
    id: 'l4',
    tipo: 'falta',
    turmaId: 't2',
    disciplinaId: 'd4',
    periodoInicio: '2026-11-03',
    periodoFim: '2026-11-14',
    aulasNoPeriodo: 8,
    responsavel: 'Beatriz Lemos',
    status: 'pendente',
    enviadoEm: '2026-11-17T15:03:00',
    atualizadoEm: '2026-11-17T15:03:00',
    itens: itensDaTurma('t2', null, 44),
    historico: [
      ev('criado', 'Beatriz Lemos', '2026-11-17T14:40:00'),
      ev('enviado', 'Beatriz Lemos', '2026-11-17T15:03:00'),
    ],
  },
  {
    id: 'l5',
    tipo: 'nota',
    turmaId: 't4',
    disciplinaId: 'd1',
    atividadeId: 'at4',
    responsavel: 'Helena Rocha',
    status: 'correcao',
    enviadoEm: '2026-11-09T10:12:00',
    atualizadoEm: '2026-11-10T08:30:00',
    itens: itensDaTurma('t4', 10, 55),
    historico: [
      ev('criado', 'Helena Rocha', '2026-11-08T18:00:00'),
      ev('enviado', 'Helena Rocha', '2026-11-09T10:12:00'),
      ev(
        'correcao',
        COORD,
        '2026-11-10T08:30:00',
        'Duas notas acima da média da turma sem justificativa. Confira a correção das questões abertas e reenvie.',
      ),
    ],
  },
  {
    id: 'l6',
    tipo: 'nota',
    turmaId: 't2',
    disciplinaId: 'd6',
    atividadeId: 'at5',
    responsavel: 'Rogério Tavares',
    status: 'rejeitado',
    enviadoEm: '2026-11-12T09:50:00',
    atualizadoEm: '2026-11-13T13:25:00',
    itens: itensDaTurma('t2', 10, 66),
    historico: [
      ev('criado', 'Rogério Tavares', '2026-11-11T20:15:00'),
      ev('enviado', 'Rogério Tavares', '2026-11-12T09:50:00'),
      ev(
        'rejeitado',
        COORD,
        '2026-11-13T13:25:00',
        'Os grupos do seminário não foram avaliados individualmente, como o critério da escola exige.',
      ),
    ],
  },
  {
    id: 'l7',
    tipo: 'falta',
    turmaId: 't1',
    disciplinaId: 'd1',
    periodoInicio: '2026-10-19',
    periodoFim: '2026-10-30',
    aulasNoPeriodo: 8,
    responsavel: 'Helena Rocha',
    status: 'aprovado',
    enviadoEm: '2026-10-31T08:10:00',
    atualizadoEm: '2026-11-03T10:00:00',
    itens: itensDaTurma('t1', null, 77),
    historico: [
      ev('criado', 'Helena Rocha', '2026-10-30T17:50:00'),
      ev('enviado', 'Helena Rocha', '2026-10-31T08:10:00'),
      ev('aprovado', COORD, '2026-11-03T10:00:00'),
    ],
  },
  {
    id: 'l8',
    tipo: 'nota',
    turmaId: 't3',
    disciplinaId: 'd5',
    atividadeId: 'at6',
    responsavel: 'Carla Fontes',
    status: 'rascunho',
    atualizadoEm: '2026-11-17T19:20:00',
    itens: itensDaTurma('t3', 10, 88).map((i, idx) =>
      idx > 4 ? { ...i, nota: null } : i,
    ),
    historico: [ev('criado', 'Carla Fontes', '2026-11-17T19:20:00')],
  },
]

/** Média acadêmica mensal por turma, de junho a novembro (série simulada). */
export const MESES = ['Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov']
export const desempenho: Record<string, number[]> = {
  geral: [6.8, 7.0, 6.9, 7.2, 7.4, 7.6],
  t1: [6.5, 6.9, 7.1, 7.0, 7.4, 7.8],
  t2: [6.9, 7.0, 6.7, 7.1, 7.0, 7.2],
  t3: [6.4, 6.6, 6.9, 7.3, 7.5, 7.4],
  t4: [7.4, 7.5, 7.0, 7.6, 7.9, 8.1],
}
