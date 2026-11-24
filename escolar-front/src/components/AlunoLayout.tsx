import { Link, Outlet } from 'react-router-dom'
import { GraduationCap, LogOut } from 'lucide-react'
import { clearMatricula } from '../state/session'
import { Banners } from './Banners'
import { Toasts } from './ui'

export function AlunoLayout() {
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
