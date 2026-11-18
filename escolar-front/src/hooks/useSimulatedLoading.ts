import { useEffect, useState } from 'react'

/** Simula a espera de uma requisição ao montar a tela, para exibir o estado de carregamento. */
export function useSimulatedLoading(ms = 550) {
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms)
    return () => clearTimeout(t)
  }, [ms])
  return loading
}
