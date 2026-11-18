import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './Button'

interface Props {
  page: number
  pageSize: number
  total: number
  onPage: (p: number) => void
}

export function Pagination({ page, pageSize, total, onPage }: Props) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(total, page * pageSize)
  return (
    <div className="pagination">
      <span>
        {from}–{to} de {total}
      </span>
      <div className="pagination-btns">
        <Button
          size="sm"
          icon={<ChevronLeft size={16} />}
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          aria-label="Página anterior"
        />
        <span>
          Página {page} de {pages}
        </span>
        <Button
          size="sm"
          icon={<ChevronRight size={16} />}
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
          aria-label="Próxima página"
        />
      </div>
    </div>
  )
}
