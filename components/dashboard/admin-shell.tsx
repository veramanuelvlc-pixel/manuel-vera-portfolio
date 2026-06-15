"use client"
import Link from "next/link"
import {
  LayoutGrid,
  LayoutDashboard,
  BarChart3,
  Layers,
  Settings,
  Download,
  Upload,
  Calendar,
  ArrowUp,
  ArrowDown,
} from "lucide-react"

export type DashView = "minimal" | "admin"

export const ADMIN_BG = "#F8F9FA"
export const ADMIN_DARK = "#1a1a2e"
export const ADMIN_GOAL = "#EF4444"
export const ADMIN_FONT = "Inter, ui-sans-serif, system-ui, sans-serif"
// Light-theme chart palette (shared across admin views)
export const AX_TICK = "#9CA3AF"
export const AX_LINE = "#E5E7EB"
export const AX_GRID = "#EEF0F2"

const pctSigned = (n: number) => (n >= 0 ? "+" : "") + n.toFixed(1) + "%"

export function ViewToggle({
  view,
  setView,
  theme,
  accent,
  minimalLabel,
  adminLabel,
}: {
  view: DashView
  setView: (v: DashView) => void
  theme: "dark" | "light"
  accent: string
  minimalLabel: string
  adminLabel: string
}) {
  const dark = theme === "dark"
  const items: { key: DashView; Icon: typeof LayoutGrid; label: string }[] = [
    { key: "minimal", Icon: LayoutGrid, label: minimalLabel },
    { key: "admin", Icon: LayoutDashboard, label: adminLabel },
  ]
  return (
    <div className="inline-flex rounded-lg p-0.5 gap-0.5" style={{ backgroundColor: dark ? "rgba(255,255,255,0.05)" : "#ECEEF1" }}>
      {items.map(({ key, Icon, label }) => {
        const active = view === key
        return (
          <button
            key={key}
            onClick={() => setView(key)}
            title={label}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors"
            style={
              active
                ? dark
                  ? { backgroundColor: accent + "20", color: accent }
                  : { backgroundColor: "#fff", color: ADMIN_DARK, boxShadow: "0 1px 2px rgba(0,0,0,0.08)" }
                : { color: dark ? "rgba(255,255,255,0.4)" : "#6b7280" }
            }
          >
            <Icon size={15} />
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function KpiCard({
  label,
  value,
  goal,
  goalLabel,
  mom,
  inverse = false,
  vsLabel,
}: {
  label: string
  value: string
  goal?: string
  goalLabel: string
  mom?: number
  inverse?: boolean
  vsLabel: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200/70 p-5 shadow-sm">
      <p className="text-xs text-gray-500 mb-2">{label}</p>
      <p className="text-2xl font-semibold tabular-nums" style={{ color: ADMIN_DARK }}>{value}</p>
      {goal !== undefined && (
        <p className="text-xs mt-1" style={{ color: ADMIN_GOAL }}>{goalLabel}: {goal}</p>
      )}
      {mom !== undefined && (() => {
        const up = mom >= 0
        const good = inverse ? mom < 0 : mom >= 0
        return (
          <div className="flex items-center gap-1 mt-2 text-xs font-medium" style={{ color: good ? "#16A34A" : "#DC2626" }}>
            {up ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
            <span className="tabular-nums">{pctSigned(mom)}</span>
            <span className="text-gray-400 font-normal">{vsLabel}</span>
          </div>
        )
      })()}
    </div>
  )
}

export function AdminShell({
  accent,
  title,
  backLabel,
  range,
  view,
  setView,
  navLabels,
  exportLabel,
  importLabel,
  minimalLabel,
  adminLabel,
  children,
}: {
  accent: string
  title: string
  backLabel: string
  range?: string
  view: DashView
  setView: (v: DashView) => void
  navLabels: [string, string, string, string]
  exportLabel: string
  importLabel: string
  minimalLabel: string
  adminLabel: string
  children: React.ReactNode
}) {
  const navIcons = [LayoutDashboard, BarChart3, Layers, Settings]
  const btn = "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-gray-200 bg-white text-gray-600 hover:border-gray-300 transition-colors"

  return (
    <div className="min-h-screen" style={{ backgroundColor: ADMIN_BG, fontFamily: ADMIN_FONT }}>
      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 hidden md:flex flex-col sticky top-16 self-start min-h-[calc(100vh-4rem)]" style={{ backgroundColor: ADMIN_DARK }}>
          <div className="p-5">
            <p className="font-mono text-sm mb-8" style={{ color: accent }}>mv.dev</p>
            <nav className="flex flex-col gap-1">
              {navLabels.map((label, i) => {
                const Icon = navIcons[i]
                const active = i === 0
                return (
                  <button
                    key={label}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left"
                    style={active ? { backgroundColor: "rgba(255,255,255,0.08)", color: "#fff" } : { color: "rgba(255,255,255,0.55)" }}
                  >
                    <Icon size={17} />
                    <span>{label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0 p-6 lg:p-8">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
            <div>
              <Link href="/projects" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                {String.fromCharCode(8592)} {backLabel}
              </Link>
              <h1 className="text-2xl font-semibold mt-2" style={{ color: ADMIN_DARK }}>{title}</h1>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <ViewToggle view={view} setView={setView} theme="light" accent={accent} minimalLabel={minimalLabel} adminLabel={adminLabel} />
              <button className={btn}><Download size={15} /> {exportLabel}</button>
              <button className={btn}><Upload size={15} /> {importLabel}</button>
              {range && <button className={btn}><Calendar size={15} /> {range}</button>}
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
