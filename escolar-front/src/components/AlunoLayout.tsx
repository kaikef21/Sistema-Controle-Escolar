import { useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { GraduationCap, LogOut, Moon, Sun } from 'lucide-react'
import { clearMatricula } from '../state/session'
import { Banners } from './Banners'
import { Toasts } from './ui'

export function AlunoLayout() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('educontrol_theme')
    if (saved) return saved === 'dark'
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  })

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    localStorage.setItem('educontrol_theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <>
      <header className="hero hero-slim">
        <div className="hero-inner">
          <div className="topbar-inner">
            <div className="brand">
              <span className="brand-mark">
                <GraduationCap size={21} />
              </span>
              <div>
                Educontrol
                <small>Área do aluno</small>
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
              <Link to="/" className="exit-link" onClick={clearMatricula}>
                <LogOut size={16} />
                <span>Sair</span>
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main className="page">
        <Banners />
        <Outlet />
      </main>
      <Toasts />
    </>
  )
}