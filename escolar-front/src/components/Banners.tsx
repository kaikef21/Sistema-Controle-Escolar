import { WifiOff } from 'lucide-react'
import { useApp } from '../state/useApp'
import { Button } from './ui'

/** Avisos de conexão com a API (usados nas áreas do professor e do aluno). */
export function Banners() {
  const { status, error, reload } = useApp()
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
    </>
  )
}