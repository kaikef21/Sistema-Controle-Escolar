import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  PenLine,
  CalendarX2,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { useApp } from '../store/useApp'

interface Props {
  collapsed: boolean
  mobileOpen: boolean
  onToggle: () => void
  onNavigate: () => void
}

function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 28 28" aria-hidden>
      <rect width="28" height="28" rx="8" fill="var(--luau-700)" />
      <path
        d="M5 17c2.2-3 4.3-3 6.5 0s4.3 3 6.5 0 4.3-3 5-1.6"
        fill="none"
        stroke="var(--sea-100)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M5 12.2c2.2-3 4.3-3 6.5 0s4.3 3 6.5 0 4.3-3 5-1.6"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function Sidebar({ collapsed, mobileOpen, onToggle, onNavigate }: Props) {
  const { lancamentos } = useApp()
  const pendentes = lancamentos.filter((l) => l.status === 'pendente').length

  const link = (
    to: string,
    label: string,
    Icon: typeof LayoutDashboard,
    badge?: number,
  ) => (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
    >
      <Icon size={19} />
      <span className="label">{label}</span>
      {!!badge && <span className="nav-badge">{badge}</span>}
    </NavLink>
  )

  return (
    <aside className={`sidebar ${mobileOpen ? 'is-open' : ''}`}>
      <div className="brand">
        <BrandMark />
        <div className="brand-name">
          Escolar
          <small>Gestão acadêmica</small>
        </div>
      </div>

      <nav className="nav" aria-label="Principal">
        {link('/', 'Dashboard', LayoutDashboard)}

        <div className="nav-group-label">Cadastros</div>
        {link('/alunos', 'Alunos', Users)}
        {link('/atividades', 'Atividades', ClipboardList)}

        <div className="nav-group-label">Lançamentos</div>
        {link('/notas', 'Lançar notas', PenLine)}
        {link('/faltas', 'Lançar faltas', CalendarX2)}
        {link('/aprovacoes', 'Aprovações', ShieldCheck, pendentes)}
      </nav>

      <div className="sidebar-foot">
        <button
          type="button"
          className="collapse-btn"
          onClick={onToggle}
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
          <span className="label">Recolher menu</span>
        </button>
      </div>
    </aside>
  )
}
