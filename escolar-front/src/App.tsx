import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppProvider } from './store/AppProvider'
import { AppLayout } from './layout/AppLayout'
import { Dashboard } from './pages/Dashboard'
import { Alunos } from './pages/Alunos'
import { Atividades } from './pages/Atividades'
import { LancarNotas } from './pages/LancarNotas'
import { LancarFaltas } from './pages/LancarFaltas'
import { Aprovacoes } from './pages/Aprovacoes'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="alunos" element={<Alunos />} />
            <Route path="atividades" element={<Atividades />} />
            <Route path="notas" element={<LancarNotas />} />
            <Route path="faltas" element={<LancarFaltas />} />
            <Route path="aprovacoes" element={<Aprovacoes />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
