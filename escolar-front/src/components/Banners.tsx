import { AlertTriangle, WifiOff } from 'lucide-react'
import { useApp } from '../state/useApp'
import { Button } from './ui'

/** Avisos de conexão com a API e de ids ausentes (usados nas áreas do professor e do aluno). */
export function Banners() {
  const { status, error, idsMissing, reload } = useApp()
  return (
    <>
        {status === 'error' && (
          <div className="banner banner-error" role="alert">
            <WifiOff size={18} />
            <div>
              <strong>Não foi possível carregar os dados</strong>
              {error}
              <div>
                <Button size="sm" onClick={reload}>
                  Tentar novamente
                </Button>
              </div>
            </div>
          </div>
        )}
        {idsMissing && (
          <div className="banner banner-warn" role="alert">
            <AlertTriangle size={18} />
            <div>
              <strong>A API não está devolvendo os identificadores</strong>
              Os registros chegam sem <code>alunoId</code>, <code>turmaId</code> ou{' '}
              <code>atividadeId</code>, então não dá para vincular notas e faltas. No backend, remova o{' '}
              <code>[JsonIgnore]</code> dos ids nos models.
            </div>
          </div>
        )}
    </>
  )
}
