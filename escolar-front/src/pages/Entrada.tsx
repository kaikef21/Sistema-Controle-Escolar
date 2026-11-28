import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, GraduationCap, IdCard, LogOut, Moon, Presentation, Sun, UserCheck, UserPlus } from 'lucide-react'
import { api, ApiError } from '../api/client'
import { Button, TextField } from '../components/ui'
import { setMatricula } from '../state/session'
import { useApp } from '../state/useApp'

interface ProfessorSessao {
  nome: string
  username: string
}

function lerProfessorSessao(): ProfessorSessao | null {
  try {
    const raw = sessionStorage.getItem('educontrol_professor')
    if (!raw) return null
    const parsed = JSON.parse(raw) as ProfessorSessao
    if (!parsed?.nome) return null
    return parsed
  } catch {
    return null
  }
}

export function Entrada() {
  const { status, alunos, notify } = useApp()
  const navigate = useNavigate()

  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('educontrol_theme')
    if (saved) return saved === 'dark'
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  })

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    localStorage.setItem('educontrol_theme', dark ? 'dark' : 'light')
  }, [dark])

  const [professor, setProfessor] = useState<ProfessorSessao | null>(() => lerProfessorSessao())
  const [erroProfessor, setErroProfessor] = useState('')
  const [carregandoProf, setCarregandoProf] = useState(false)

  const [matricula, setValor] = useState('')
  const [erro, setErro] = useState('')

  useEffect(() => {
    let ativo = true

    const sincronizarProfessor = async () => {
      try {
        const usuarios = await api.obterUsuarios()
        if (!ativo) return

        if (!usuarios || usuarios.length === 0) {
          sessionStorage.removeItem('educontrol_professor')
          setProfessor(null)
          return
        }

        const salvo = lerProfessorSessao()
        const encontrado = usuarios.find((u) => u.username === salvo?.username) ?? usuarios[0]
        const profAtivo = { nome: encontrado.nome, username: encontrado.username }
        sessionStorage.setItem('educontrol_professor', JSON.stringify(profAtivo))
        setProfessor(profAtivo)
      } catch {
        // Mantém o estado atual se a API não responder na carga inicial
      }
    }

    sincronizarProfessor()
    return () => {
      ativo = false
    }
  }, [])

  const entrarProfessor = async () => {
    setErroProfessor('')
    setCarregandoProf(true)
    try {
      const usuarios = await api.obterUsuarios()
      if (!usuarios || usuarios.length === 0) {
        sessionStorage.removeItem('educontrol_professor')
        setProfessor(null)
        setErroProfessor('Nenhum professor cadastrado no banco. Cadastre um professor antes de entrar.')
        notify('error', 'Acesso bloqueado', 'É necessário ter um professor cadastrado no banco.')
        return
      }

      const salvo = lerProfessorSessao()
      const encontrado = usuarios.find((u) => u.username === salvo?.username) ?? usuarios[0]
      const profAtivo = { nome: encontrado.nome, username: encontrado.username }
      sessionStorage.setItem('educontrol_professor', JSON.stringify(profAtivo))
      setProfessor(profAtivo)
      navigate('/alunos')
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Não foi possível consultar o banco/backend.'
      setErroProfessor(msg)
      notify('error', 'Erro de conexão', msg)
    } finally {
      setCarregandoProf(false)
    }
  }

  const sairProfessor = () => {
    sessionStorage.removeItem('educontrol_professor')
    setProfessor(null)
    setErroProfessor('')
  }

  const entrarAluno = (ev: FormEvent) => {
    ev.preventDefault()
    const m = matricula.trim()
    if (!m) return setErro('Digite a sua matrícula.')
    if (status !== 'ready') return setErro('Os dados ainda não carregaram. Tente de novo em instantes.')
    const aluno = alunos.find((a) => a.matricula === m)
    if (!aluno) return setErro('Matrícula não encontrada. Confira o número com a secretaria.')
    setMatricula(m)
    navigate('/aluno')
  }

  return (
    <div className="entry">
      <header className="hero hero-tall">
        <div className="hero-inner">
          <div className="topbar-inner">
            <div className="brand brand-lg">
              <span className="brand-mark">
                <GraduationCap size={24} />
              </span>
              <div>
                Educontrol
                <small>Notas, faltas e situação dos alunos</small>
              </div>
            </div>
            <div className="top-actions">
              <button
                type="button"
                className="exit-link"
                onClick={() => setDark((d) => !d)}
                aria-pressed={dark}
                title={dark ? 'Ativar modo claro' : 'Ativar modo noturno'}
              >
                {dark ? <Sun size={16} /> : <Moon size={16} />}
                <span>{dark ? 'Modo claro' : 'Modo noturno'}</span>
              </button>
            </div>
          </div>
          <h1 className="entry-title">Quem está acessando?</h1>
          <p className="entry-sub">Professores lançam notas e faltas. Alunos acompanham as próprias informações.</p>
        </div>
      </header>

      <main className="entry-main">
        <div className="entry-cards">
          <section className="card role-card">
            <span className="role-icon role-prof">
              <Presentation size={22} />
            </span>
            <h2>Sou professor</h2>
            <p>Cadastre alunos e atividades, lance notas e presenças e acompanhe quem está aprovado.</p>

            {professor ? (
              <div className="prof-badge">
                <div>
                  <strong>
                    <UserCheck size={15} /> {professor.nome}
                  </strong>
                  <small>@{professor.username}</small>
                </div>
                <button type="button" className="exit-link" onClick={sairProfessor} title="Limpar seleção da sessão">
                  <LogOut size={14} />
                  <span>Sair</span>
                </button>
              </div>
            ) : (
              <p className="field-error">{erroProfessor || 'Nenhum professor selecionado ou cadastrado.'}</p>
            )}

            <div className="form">
              <Button
                variant="primary"
                icon={<ArrowRight size={17} />}
                loading={carregandoProf}
                onClick={entrarProfessor}
              >
                Entrar na área do professor
              </Button>
              <Button
                icon={<UserPlus size={17} />}
                onClick={() => {
                  setErroProfessor('')
                  navigate('/cadastro-professor')
                }}
              >
                Cadastrar professor
              </Button>
            </div>
          </section>

          <section className="card role-card">
            <span className="role-icon role-aluno">
              <IdCard size={22} />
            </span>
            <h2>Sou aluno</h2>
            <p>Veja as atividades da sua turma, as suas notas, as faltas e a sua situação.</p>
            <form className="form" onSubmit={entrarAluno} noValidate>
              <TextField
                label="Matrícula"
                placeholder="Ex.: 2026001"
                value={matricula}
                error={erro}
                onChange={(e) => {
                  setValor(e.target.value)
                  setErro('')
                }}
              />
              <Button variant="success" type="submit" icon={<ArrowRight size={17} />}>
                Ver minhas notas
              </Button>
            </form>
          </section>
        </div>
      </main>
    </div>
  )
}