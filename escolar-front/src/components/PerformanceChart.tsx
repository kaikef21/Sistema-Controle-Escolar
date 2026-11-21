import { useState } from 'react'
import { MESES, desempenho } from '../data/mock'

const W = 640
const H = 250
const PAD = { l: 36, r: 16, t: 16, b: 28 }
const MIN = 5
const MAX = 10

const x = (i: number) => PAD.l + (i * (W - PAD.l - PAD.r)) / (MESES.length - 1)
const y = (v: number) => PAD.t + ((MAX - v) * (H - PAD.t - PAD.b)) / (MAX - MIN)

function path(values: number[]) {
  return values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
}

export function PerformanceChart({
  serie,
  label,
}: {
  serie: string
  label: string
}) {
  const [hover, setHover] = useState<number | null>(null)
  const values = desempenho[serie] ?? desempenho.geral
  const geral = desempenho.geral
  const showGeral = serie !== 'geral'

  const area = `${path(values)} L${x(values.length - 1)} ${y(MIN)} L${x(0)} ${y(MIN)} Z`

  return (
    <div className="chart-wrap">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        role="img"
        aria-label={`Média acadêmica mensal de ${label}, de ${MESES[0]} a ${MESES[MESES.length - 1]}`}
        onMouseLeave={() => setHover(null)}
      >
        {[5, 6, 7, 8, 9, 10].map((t) => (
          <g key={t}>
            <line
              x1={PAD.l}
              x2={W - PAD.r}
              y1={y(t)}
              y2={y(t)}
              stroke="var(--line)"
              strokeWidth={1}
            />
            <text x={PAD.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--muted)">
              {t}
            </text>
          </g>
        ))}
        {MESES.map((m, i) => (
          <text key={m} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11.5" fill="var(--muted)">
            {m}
          </text>
        ))}

        <path d={area} fill="var(--sea-500)" opacity="0.09" />
        {showGeral && (
          <path
            d={path(geral)}
            fill="none"
            stroke="var(--luau-500)"
            strokeWidth={2}
            strokeDasharray="5 5"
          />
        )}
        <path
          d={path(values)}
          fill="none"
          stroke="var(--sea-600)"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {values.map((v, i) => (
          <g key={i}>
            <circle
              cx={x(i)}
              cy={y(v)}
              r={hover === i ? 6 : 4}
              fill="#fff"
              stroke="var(--sea-600)"
              strokeWidth={2.5}
            />
            <rect
              x={x(i) - 28}
              y={PAD.t}
              width={56}
              height={H - PAD.t - PAD.b}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
          </g>
        ))}
      </svg>
      {hover !== null && (
        <div
          className="chart-tip"
          style={{
            left: `${(x(hover) / W) * 100}%`,
            top: `${(y(values[hover]) / H) * 100}%`,
          }}
        >
          {MESES[hover]}: média {values[hover].toFixed(1).replace('.', ',')}
          {showGeral && ` · geral ${geral[hover].toFixed(1).replace('.', ',')}`}
        </div>
      )}
      <table className="sr-only">
        <caption>Média acadêmica mensal de {label}</caption>
        <tbody>
          {MESES.map((m, i) => (
            <tr key={m}>
              <th>{m}</th>
              <td>{values[i]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
