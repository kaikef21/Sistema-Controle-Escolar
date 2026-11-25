import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, GraduationCap, Moon, Sun, UserPlus } from 'lucide-react'
import { api, ApiError } from '../api/client'
import { Banners } from '../components/Banners'
import { Button, TextField } from '../components/ui'
import { useApp } from '../state/useApp'

export function CadastroProfessor() {
  const { notify } = useApp()
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

  const [nome, setNome] = useState('')
  const [username, setUsername] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const submit = async (ev: FormEvent) => {
    ev.preventDefault()
    const e: Record<string, string> = {}
    const nomeLimpo = nome.trim()
    const userLimpo = username.trim()

    if (nomeLimpo.length < 3) e.nome = 'Informe o nome completo.'
    else if (nomeLimpo.length > 100) e.nome = 'O nome deve ter no máximo 100 caracteres.'

    if (!userLimpo) e.username = 'Informe o usuário de acesso.'
    else if (userLimpo.length > 50) e.username = 'O usuário deve ter no máximo 50 caracteres.'

    if (senha.length < 3) e.senha = 'Informe uma senha com pelo menos 3 caracteres.'
    if (confirmarSenha !== senha) e.confirmarSenha = 'As senhas não conferem.'

    setErrors(e)
    if (Object.keys(e).length) return

    setSaving(true)
    try {
      await api.criarUsuario({
        nome: nomeLimpo,
        username: userLimpo,
        senha,
        confirmarSenha,
      })
      notify('success', 'Professor cadastrado', `Usuário ${nomeLimpo} criado com sucesso.`)
      navigate('/')
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fields)
        notify('error', 'Não foi possível cadastrar', err.message)
      } else {
        const msg = err instanceof Error ? err.message : 'Erro inesperado ao conectar.'
        notify('error', 'Não foi possível cadastrar', msg)
      }
    } finally {
      setSaving(false)
    }
    sessionStorage.setItem(
  'educontrol_professor',
  JSON.stringify({ nome: nomeLimpo, username: userLimpo }),
)
notify('success', 'Professor cadastrado', `Usuário ${nomeLimpo} criado com sucesso.`)
navigate('/alunos')
  }

  return (
    <div className="entry">
      <header className="hero hero-slim">
        <div className="hero-inner">
          <div className="topbar-inner">
            <div className="brand">
              <span className="brand-mark">
                <GraduationCap size={21} />
              </span>
              <div>
                Educontrol
                <small>Cadastro de professor</small>
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
        </div>
      </header>

      <main className="page">
        <Banners />
        <div className="page-head">
          <div>
            <h1>Cadastro de professor</h1>
            <p>Cadastre um novo usuário docente com login e senha.</p>
          </div>
          <Button variant="primary" icon={<ArrowLeft size={17} />} onClick={() => navigate('/')}>
            Voltar ao início
          </Button>
        </div>

        <section className="card">
          <div className="card-head">
            <h2>
              <UserPlus size={18} /> Dados do professor
            </h2>
          </div>
          <form className="card-body form" onSubmit={submit} autoComplete="off" noValidate>
            <TextField
              label="Nome completo"
              placeholder="Ex.: Maria Oliveira"
              autoComplete="off"
              value={nome}
              error={errors.nome}
              onChange={(e) => setNome(e.target.value)}
            />
            <TextField
              label="Usuário"
              placeholder="Ex.: maria.oliveira"
              autoComplete="off"
              value={username}
              error={errors.username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <div className="row2">
              <TextField
                label="Senha"
                type="password"
                placeholder="Digite a senha"
                autoComplete="new-password"
                value={senha}
                error={errors.senha}
                onChange={(e) => setSenha(e.target.value)}
              />
              <TextField
                label="Confirmar senha"
                type="password"
                placeholder="Repita a senha"
                autoComplete="new-password"
                value={confirmarSenha}
                error={errors.confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
              />
            </div>
            <Button variant="primary" type="submit" loading={saving}>
              Cadastrar professor
            </Button>
          </form>
        </section>
      </main>
    </div>
  )
}