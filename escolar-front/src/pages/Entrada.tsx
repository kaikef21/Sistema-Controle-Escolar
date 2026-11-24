import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, GraduationCap, IdCard, Presentation } from 'lucide-react'
import { Banners } from '../components/Banners'
import { Button, TextField } from '../components/ui'
import { setMatricula } from '../state/session'
import { useApp } from '../state/useApp'

export function Entrada() {
  const { status, alunos } = useApp()
  const navigate = useNavigate()
  const [matricula, setValor] = useState('')
  const [erro, setErro] = useState('')

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
          <div className="brand brand-lg">
            <span className="brand-mark">
              <GraduationCap size={24} />
            </span>
            <div>
              Educontrol
              <small>Notas, faltas e situação dos alunos</small>
            </div>
          </div>
          <h1 className="entry-title">Quem está acessando?</h1>
          <p className="entry-sub">Professores lançam notas e faltas. Alunos acompanham as próprias informações.</p>
        </div>
      </header>

      <main className="entry-main">
        <Banners />
        <div className="entry-cards">
          <section className="card role-card">
            <span className="role-icon role-prof">
              <Presentation size={22} />
            </span>
            <h2>Sou professor</h2>
            <p>Cadastre alunos e atividades, lance notas e presenças e acompanhe quem está aprovado.</p>
            <Button variant="primary" icon={<ArrowRight size={17} />} onClick={() => navigate('/alunos')}>
              Entrar na área do professor
            </Button>
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
