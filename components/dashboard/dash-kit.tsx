import type { LucideIcon } from "lucide-react"
import type { TooltipContentProps } from "recharts"

/*
 * Shared surface for the bespoke dashboards (e-commerce, email): the same
 * CSS-var palette and panel/tooltip shapes the Meta Ads and Real Estate
 * dashboards use, so all four read as one product.
 */

export const DARK_VARS = {
  "--bg": "#0a0a0a",
  "--panel": "#121212",
  "--line": "rgba(255,255,255,0.06)",
  "--txt": "#ffffff",
  "--txt2": "rgba(255,255,255,0.70)",
  "--txt3": "rgba(255,255,255,0.45)",
  "--txt4": "rgba(255,255,255,0.30)",
  "--track": "rgba(255,255,255,0.06)",
} as React.CSSProperties

export const LIGHT_VARS = {
  "--bg": "#F6F7F9",
  "--panel": "#ffffff",
  "--line": "rgba(17,24,39,0.09)",
  "--txt": "#15161c",
  "--txt2": "#41444f",
  "--txt3": "#6b7280",
  "--txt4": "#9aa1ad",
  "--track": "rgba(17,24,39,0.07)",
} as React.CSSProperties

export type ChartPalette = {
  tick: string
  grid: string
  cursor: string
  muted: string
  tipBg: string
  tipBorder: string
  tipText: string
  tipLabel: string
}

export function chartPalette(dark: boolean): ChartPalette {
  return dark
    ? {
        tick: "rgba(255,255,255,0.35)",
        grid: "rgba(255,255,255,0.05)",
        cursor: "rgba(255,255,255,0.04)",
        muted: "rgba(255,255,255,0.18)",
        tipBg: "#1a1a1a",
        tipBorder: "rgba(255,255,255,0.1)",
        tipText: "#ffffff",
        tipLabel: "rgba(255,255,255,0.5)",
      }
    : {
        tick: "#9aa1ad",
        grid: "rgba(17,24,39,0.07)",
        cursor: "rgba(17,24,39,0.04)",
        muted: "rgba(17,24,39,0.14)",
        tipBg: "#ffffff",
        tipBorder: "rgba(17,24,39,0.1)",
        tipText: "#15161c",
        tipLabel: "#6b7280",
      }
}

export const nf = new Intl.NumberFormat("en-US")
export const usd0 = (n: number) => "$" + new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n)
export const usd2 = (n: number) =>
  "$" + new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
export const usdCompact = (n: number) =>
  "$" + new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n)
export const pct = (n: number, d = 1) => n.toFixed(d) + "%"

export function Panel({
  Icon,
  title,
  aside,
  className = "",
  children,
}: {
  Icon: LucideIcon
  title: string
  aside?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-xs text-[var(--txt3)]">
          <Icon size={14} /> {title}
        </span>
        {aside}
      </div>
      {children}
    </div>
  )
}

export function StatCards({
  items,
}: {
  items: { key: string; Icon: LucideIcon; label: string; value: string; sub: string }[]
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(({ key, Icon, label, value, sub }) => (
        <div key={key} className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
          <span className="mb-4 flex items-center gap-2 text-xs text-[var(--txt3)]">
            <Icon size={15} /> {label}
          </span>
          <p className="text-2xl font-semibold tabular-nums">{value}</p>
          <p className="mt-2 text-xs text-[var(--txt4)]">{sub}</p>
        </div>
      ))}
    </div>
  )
}

/** Generic recharts tooltip: a label line plus one formatted row per series. */
export function ChartTooltip({
  active,
  payload,
  label,
  c,
  format,
}: Partial<TooltipContentProps<number, string>> & { c: ChartPalette; format: (name: string, v: number) => string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg px-3 py-2 shadow-lg" style={{ backgroundColor: c.tipBg, border: `1px solid ${c.tipBorder}` }}>
      <p className="mb-1 text-[11px]" style={{ color: c.tipLabel }}>
        {label}
      </p>
      {payload.map((p) => (
        <p key={String(p.dataKey)} className="text-sm font-medium tabular-nums" style={{ color: c.tipText }}>
          <span style={{ color: p.color }}>{p.name}: </span>
          {format(String(p.dataKey), p.value as number)}
        </p>
      ))}
    </div>
  )
}

export function Toggle<T extends string>({
  options,
  value,
  onChange,
  accent,
}: {
  options: { key: T; label: string }[]
  value: T
  onChange: (v: T) => void
  accent: string
}) {
  return (
    <div className="flex gap-1.5">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          aria-pressed={value === o.key}
          className="rounded-full border px-2.5 py-1 text-[11px] transition-colors"
          style={
            value === o.key
              ? { borderColor: accent + "60", color: accent, backgroundColor: accent + "12" }
              : { borderColor: "var(--line)", color: "var(--txt3)" }
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
