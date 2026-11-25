import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppProvider } from './state/AppProvider'
import { AlunoLayout } from './components/AlunoLayout'
import { Layout } from './components/Layout'
import { Alunos } from './pages/Alunos'
import { Atividades } from './pages/Atividades'
import { Entrada } from './pages/Entrada'
import { Lancamentos } from './pages/Lancamentos'
import { MeuBoletim } from './pages/MeuBoletim'
import { StatusGeral } from './pages/StatusGeral'
import { CadastroProfessor } from './pages/CadastroProfessor'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route index element={<Entrada />} />

          {/* Área do professor */}
          <Route element={<Layout />}>
            <Route path="alunos" element={<Alunos />} />
            <Route path="atividades" element={<Atividades />} />
            <Route path="lancamentos" element={<Lancamentos />} />
            <Route path="status" element={<StatusGeral />} />
            <Route path="/cadastro-professor" element={<CadastroProfessor />} />
          </Route>

          {/* Área do aluno */}
          <Route element={<AlunoLayout />}>
            <Route path="aluno" element={<MeuBoletim />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
