// Guarda só a matrícula do aluno que entrou, e só enquanto a aba estiver aberta.
const KEY = 'educontrol.matricula'

export function getMatricula(): string | null {
  try {
    return sessionStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function setMatricula(m: string): void {
  try {
    sessionStorage.setItem(KEY, m)
  } catch {
    /* sem armazenamento (aba anônima, por exemplo): a pessoa só precisa entrar de novo */
  }
}

export function clearMatricula(): void {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* ignora */
  }
}
