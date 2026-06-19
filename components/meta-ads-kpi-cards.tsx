import type { LucideIcon } from "lucide-react"
import { ArrowUp, ArrowDown } from "lucide-react"

export type Kpi = {
  key: string
  Icon: LucideIcon
  label: string
  value: string
  /** Month-over-month delta in %. Omit for a static (non-trend) card. */
  delta?: number
  deltaLabel?: string
}

const pctSigned = (n: number) => (n >= 0 ? "+" : "") + n.toFixed(1) + "%"

/**
 * Presentational KPI grid shared by the Meta Ads dashboard and the landing
 * dashboard preview. Colors come from CSS vars (--line, --panel, --txt,
 * --txt3, --txt4) so the consumer controls the theme.
 */
export function MetaAdsKpiCards({ kpis, className = "" }: { kpis: Kpi[]; className?: string }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {kpis.map(({ key, Icon, label, value, delta, deltaLabel }) => {
        const up = (delta ?? 0) >= 0
        return (
          <div key={key} className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
            <div className="flex items-center gap-2 text-[var(--txt3)] text-xs mb-4">
              <Icon size={15} /> {label}
            </div>
            <p className="text-2xl font-semibold tabular-nums text-[var(--txt)]">{value}</p>
            {delta !== undefined && (
              <p className="mt-2 flex items-center gap-1 text-xs">
                <span className={`flex items-center gap-0.5 ${up ? "text-emerald-500" : "text-red-500"}`}>
                  {up ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                  {pctSigned(delta)}
                </span>
                {deltaLabel && <span className="text-[var(--txt4)]">{deltaLabel}</span>}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
