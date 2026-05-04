import type { DashboardCategoryKey } from '@/lib/dashboardCalcs'
import { categoryOklch } from '@/lib/categoryColors'

export type RingSlice = {
  key: DashboardCategoryKey
  label: string
  value: number
}

type Props = {
  slices: RingSlice[]
}

export function AllocationRing({ slices }: Props) {
  const positive = slices.filter(s => s.value > 0)
  const total = positive.reduce((s, d) => s + d.value, 0)
  const r = 64
  const c = 2 * Math.PI * r
  let cum = 0
  const arcs = positive.map(d => {
    const frac = d.value / total
    const len = frac * c
    const off = cum
    cum += len
    return { d, len, off }
  })

  if (total <= 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-6 text-center text-sm text-muted-foreground">
        <p>Add holdings to see allocation.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-5">
      <svg
        viewBox="0 0 160 160"
        className="h-40 w-40 shrink-0"
        aria-hidden
      >
        <circle
          cx="80"
          cy="80"
          r={r}
          fill="none"
          className="stroke-muted"
          strokeWidth="18"
        />
        {arcs.map(({ d, len, off }) => (
          <circle
            key={d.key}
            cx="80"
            cy="80"
            r={r}
            fill="none"
            stroke={categoryOklch(d.key)}
            strokeWidth="18"
            strokeDasharray={`${len} ${c - len}`}
            strokeDashoffset={-off}
            transform="rotate(-90 80 80)"
            strokeLinecap="butt"
          />
        ))}
        <text
          x="80"
          y="76"
          textAnchor="middle"
          className="fill-muted-foreground text-[10px] font-semibold uppercase tracking-widest"
        >
          allocation
        </text>
        <text
          x="80"
          y="94"
          textAnchor="middle"
          className="fill-foreground text-sm font-semibold"
        >
          {positive.length} types
        </text>
      </svg>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {positive.map(d => (
          <div key={d.key} className="flex items-center gap-2 text-xs">
            <span
              className="size-2.5 shrink-0 rounded-[3px]"
              style={{ background: categoryOklch(d.key) }}
            />
            <span className="min-w-0 flex-1 truncate text-muted-foreground">
              {d.label}
            </span>
            <span className="shrink-0 font-semibold tabular-nums text-foreground">
              {Math.round((d.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
