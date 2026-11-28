import { Fragment, useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Check, GraduationCap, LogOut, Moon, Sun } from 'lucide-react'
import { API_URL } from '../api/client'
import { useApp } from '../state/useApp'
import { calcularBoletim } from '../utils/format'
import { Toasts } from './ui'

export function Layout() {
  const { status, alunos, atividades, notas, frequencias } = useApp()
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('educontrol_theme')
    if (saved) return saved === 'dark'
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  })

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    localStorage.setItem('educontrol_theme', dark ? 'dark' : 'light')
  }, [dark])

  const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`
  const aprovados = alunos.filter(
    (a) => calcularBoletim(a, notas, atividades, frequencias).situacao === 'Aprovado',
  ).length

  const steps = [
    { to: '/alunos', label: 'Alunos', hint: plural(alunos.length, 'cadastrado', 'cadastrados'), done: alunos.length > 0 },
    { to: '/atividades', label: 'Atividades', hint: plural(atividades.length, 'cadastrada', 'cadastradas'), done: atividades.length > 0 },
    { to: '/lancamentos', label: 'Lançamentos', hint: `${plural(notas.length, 'nota', 'notas')} · ${plural(frequencias.length, 'presença', 'presenças')}`, done: notas.length + frequencias.length > 0 },
    { to: '/status', label: 'Status de aprovação', hint: plural(aprovados, 'aprovado', 'aprovados'), done: false },
  ]

  return (
    <>
      <header className="hero">
        <div className="hero-inner">
          <div className="topbar-inner">
            <div className="brand">
              <span className="brand-mark">
                <GraduationCap size={21} />
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
              <span
                className={`conn ${status === 'ready' ? 'ok' : status === 'error' ? 'off' : ''}`}
                title={API_URL}
              >
                {status === 'ready' ? 'Conectado' : status === 'error' ? 'Erro de conexão' : 'Conectando...'}
              </span>
              <Link to="/" className="exit-link" title="Voltar à tela inicial">
                <LogOut size={16} />
                <span>Trocar perfil</span>
              </Link>
            </div>
          </div>

          <nav className="track" aria-label="Etapas">
            {steps.map((s, i) => (
              <Fragment key={s.to}>
                {i > 0 && <span className={`track-line ${steps[i - 1].done ? 'on' : ''}`} aria-hidden="true" />}
                <NavLink
                  to={s.to}
                  className={({ isActive }) => `step ${isActive ? 'active' : s.done ? 'done' : ''}`}
                >
                  {({ isActive }) => (
                    <>
                      <span className="step-num">
                        {s.done && !isActive ? <Check size={16} strokeWidth={3} /> : i + 1}
                      </span>
                      <span className="step-text">
                        {s.label}
                        <small>{s.hint}</small>
                      </span>
                    </>
                  )}
                </NavLink>
              </Fragment>
            ))}
          </nav>
        </div>
      </header>

      <main className="page">
        <Outlet />
      </main>
      <Toasts />
    </>
  )
}