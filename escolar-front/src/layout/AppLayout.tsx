import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Toasts } from '../components/ui/Feedback'

const KEY = 'escolar.sidebar.collapsed'

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(readCollapsed)
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggle = () => {
    setCollapsed((c) => {
      try {
        localStorage.setItem(KEY, c ? '0' : '1')
      } catch {
        /* armazenamento indisponível: segue sem persistir */
      }
      return !c
    })
  }

  return (
    <div className={`app ${collapsed ? 'is-collapsed' : ''}`}>
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggle={toggle}
        onNavigate={() => setMobileOpen(false)}
      />
      {mobileOpen && (
        <div className="scrim" onClick={() => setMobileOpen(false)} aria-hidden />
      )}
      <div className="main">
        <Header onMenu={() => setMobileOpen(true)} />
        <main className="content">
          <Outlet />
        </main>
      </div>
      <Toasts />
    </div>
  )
}
