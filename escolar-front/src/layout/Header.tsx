import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, LogOut, Menu, Settings, UserRound } from 'lucide-react'
import { useApp } from '../store/useApp'
import { USUARIO } from '../data/mock'
import { initials, formatDateTime } from '../utils/format'

const TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/alunos': 'Alunos',
  '/atividades': 'Atividades',
  '/notas': 'Lançamento de notas',
  '/faltas': 'Lançamento de faltas',
  '/aprovacoes': 'Aprovações',
}

function useOutside(ref: React.RefObject<HTMLElement | null>, close: () => void) {
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close()
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [ref, close])
}

export function Header({ onMenu }: { onMenu: () => void }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { lancamentos, turmas, disciplinas, notify } = useApp()
  const [bell, setBell] = useState(false)
  const [menu, setMenu] = useState(false)
  const bellRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  useOutside(bellRef, () => setBell(false))
  useOutside(menuRef, () => setMenu(false))

  const pendentes = lancamentos
    .filter((l) => l.status === 'pendente')
    .sort((a, b) => (b.enviadoEm ?? '').localeCompare(a.enviadoEm ?? ''))

  return (
    <header className="header">
      <button
        type="button"
        className="icon-btn menu-btn"
        onClick={onMenu}
        aria-label="Abrir menu"
      >
        <Menu size={20} />
      </button>
      <h1 className="header-title">{TITLES[pathname] ?? 'Escolar'}</h1>
      <div className="header-spacer" />

      <div className="popover-wrap" ref={bellRef}>
        <button
          type="button"
          className="icon-btn"
          aria-label={`Notificações${pendentes.length ? `, ${pendentes.length} novas` : ''}`}
          aria-expanded={bell}
          onClick={() => setBell((v) => !v)}
        >
          <Bell size={19} />
          {pendentes.length > 0 && <span className="dot" />}
        </button>
        {bell && (
          <div className="popover" role="menu">
            <div className="popover-head">
              Aguardando sua aprovação
              <span className="muted">{pendentes.length}</span>
            </div>
            {pendentes.length === 0 ? (
              <div className="popover-empty">Nenhum lançamento pendente.</div>
            ) : (
              pendentes.slice(0, 5).map((l) => {
                const t = turmas.find((x) => x.id === l.turmaId)
                const d = disciplinas.find((x) => x.id === l.disciplinaId)
                return (
                  <button
                    key={l.id}
                    type="button"
                    className="popover-item"
                    onClick={() => {
                      setBell(false)
                      navigate(`/aprovacoes?abrir=${l.id}`)
                    }}
                  >
                    <strong>
                      {l.tipo === 'nota' ? 'Notas' : 'Faltas'} · {d?.nome} · {t?.nome}
                    </strong>
                    <span>
                      {l.responsavel} enviou em {formatDateTime(l.enviadoEm)}
                    </span>
                  </button>
                )
              })
            )}
          </div>
        )}
      </div>

      <div className="popover-wrap" ref={menuRef}>
        <button
          type="button"
          className="profile-btn"
          aria-expanded={menu}
          onClick={() => setMenu((v) => !v)}
        >
          <span className="avatar">{initials(USUARIO.nome)}</span>
          <span className="profile-meta">
            <strong>{USUARIO.nome}</strong>
            <span>{USUARIO.perfil}</span>
          </span>
          <ChevronDown size={16} className="muted" />
        </button>
        {menu && (
          <div className="menu" role="menu">
            <button
              type="button"
              onClick={() => {
                setMenu(false)
                notify('info', 'Perfil', 'A edição de perfil ainda não está disponível.')
              }}
            >
              <UserRound size={16} /> Meu perfil
            </button>
            <button
              type="button"
              onClick={() => {
                setMenu(false)
                notify('info', 'Preferências', 'As preferências ainda não estão disponíveis.')
              }}
            >
              <Settings size={16} /> Preferências
            </button>
            <button
              type="button"
              onClick={() => {
                setMenu(false)
                notify('info', 'Sessão encerrada', 'Esta é uma demonstração, sem login real.')
              }}
            >
              <LogOut size={16} /> Sair
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
